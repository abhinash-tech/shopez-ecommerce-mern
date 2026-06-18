/**
 * services/order.service.js
 *
 * PURPOSE:
 *   Contains core business logic for order creation and state transitions.
 *   Converts active cart sessions into frozen order documents, handles
 *   inventory deduction, and manages status tracking.
 */

'use strict';

const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const CartService = require('./cart.service');
const AppError = require('../utils/AppError');

class OrderService {
  /**
   * Generates a unique, human-readable order number.
   * Format: SEZ-YYMMDD-XXXX (e.g., SEZ-260617-A4F2)
   */
  static generateOrderNumber() {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    // Generate 4 random alphanumeric characters
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    return `SEZ-${yy}${mm}${dd}-${random}`;
  }

  /**
   * Verifies and deducts stock for all items in an order.
   * If any item fails validation, throws an error before any deduction occurs.
   * 
   * NOTE: In a real distributed system, this requires distributed locks or 
   * MongoDB transactions. For MVP, we do sequential checks.
   */
  static async validateAndDeductStock(cartItems) {
    // 1. First Pass: Validate everything exists and has stock
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      if (!product || product.status !== 'active') {
        throw new AppError(`Product "${item.nameSnapshot}" is no longer available.`, 400, 'PRODUCT_UNAVAILABLE');
      }

      let availableStock = product.stockQuantity;
      if (item.variant) {
        const variant = product.variants.id(item.variant);
        if (!variant) throw new AppError(`Variant for "${item.nameSnapshot}" not found.`, 400, 'VARIANT_NOT_FOUND');
        availableStock = variant.stockQuantity;
      }

      if (item.quantity > availableStock) {
        throw new AppError(`Insufficient stock for "${item.nameSnapshot}". Only ${availableStock} left.`, 400, 'INSUFFICIENT_STOCK');
      }
    }

    // 2. Second Pass: Deduct stock and increment sales count
    for (const item of cartItems) {
      const product = await Product.findById(item.product);
      
      product.salesCount += item.quantity;
      
      if (item.variant) {
        const variant = product.variants.id(item.variant);
        variant.stockQuantity -= item.quantity;
      } else {
        product.stockQuantity -= item.quantity;
      }

      // Auto-mark as out of stock if depleted
      if ((item.variant && product.variants.id(item.variant).stockQuantity <= 0) || 
          (!item.variant && product.stockQuantity <= 0)) {
            // Note: This logic might need refinement for multi-variant products,
            // but for MVP we handle it simply.
            if (!item.variant) product.status = 'out_of_stock';
      }

      await product.save();
    }
  }

  /**
   * Main checkout execution logic.
   */
  static async processCheckout(user, cart, shippingAddress, paymentMethod) {
    if (cart.items.length === 0) {
      throw new AppError('Cannot place an order with an empty cart.', 400, 'EMPTY_CART');
    }

    // 1. Calculate final verified totals
    const totals = CartService.calculateTotals(cart);

    // 2. Map cart items to order items, grabbing vendor IDs
    // We need to fetch the vendor ID for each product to support multi-vendor routing
    const orderItems = await Promise.all(cart.items.map(async (item) => {
      const product = await Product.findById(item.product).select('vendor');
      return {
        product: item.product,
        vendor: product.vendor,
        variant: item.variant,
        name: item.nameSnapshot,
        price: item.priceSnapshot,
        quantity: item.quantity,
        image: item.imageSnapshot,
        variantName: item.variantNameSnapshot,
        status: 'pending'
      };
    }));

    // 3. Validate and Deduct Stock
    // Important: In a production app with Stripe, stock deduction happens AFTER 
    // payment intent confirmation (via webhooks). For COD, it happens immediately.
    // For MVP, we'll deduct immediately and rely on cancellations to restore stock.
    await this.validateAndDeductStock(cart.items);

    // 4. Create the Order
    const order = await Order.create({
      orderNumber: this.generateOrderNumber(),
      user: user._id,
      items: orderItems,
      shippingAddress,
      subtotal: totals.subtotal,
      shippingFee: totals.shipping,
      couponDiscount: totals.discount,
      totalAmount: totals.totalAmount,
      coupon: cart.coupon,
      couponCode: null, // Would map from actual coupon doc if loaded
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending', // Would be 'paid' if handled by webhook
      status: 'pending',
    });

    // 5. Clear the Cart
    cart.items = [];
    cart.coupon = null;
    cart.couponDiscount = 0;
    await cart.save();

    return order;
  }
}

module.exports = OrderService;
