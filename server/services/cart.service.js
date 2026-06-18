/**
 * services/cart.service.js
 *
 * PURPOSE:
 *   Contains complex business logic for cart operations.
 *   Handles fetching product data for snapshots, recalculating totals,
 *   and merging duplicate items.
 */

'use strict';

const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');
const AppError = require('../utils/AppError');

class CartService {
  /**
   * Retrieves a user's cart or creates an empty one if it doesn't exist.
   */
  static async getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  /**
   * Calculates the financial totals of the cart.
   * Returns an object that the controller can append to the response.
   */
  static calculateTotals(cart) {
    const subtotal = cart.items.reduce((acc, item) => acc + item.priceSnapshot * item.quantity, 0);
    const discount = cart.couponDiscount || 0;
    
    // In a real app, shipping and taxes would be calculated here based on user address.
    // Assuming free shipping over 50000 paise (₹500), else 5000 paise (₹50).
    const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 5000;
    
    const totalAmount = Math.max(0, subtotal - discount) + shipping;

    return {
      subtotal,
      discount,
      shipping,
      totalAmount,
      totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    };
  }

  /**
   * Validates a product/variant exists, is active, and has sufficient stock.
   * Returns the snapshot data to be saved in the cart.
   */
  static async getProductSnapshotData(productId, variantId, requestedQty) {
    const product = await Product.findById(productId);

    if (!product || product.status !== 'active' || !product.isApproved) {
      throw new AppError('This product is no longer available.', 400, 'PRODUCT_UNAVAILABLE');
    }

    let price = product.salePrice || product.basePrice;
    let name = product.name;
    let image = product.images[0];
    let variantName = null;
    let availableStock = product.stockQuantity;

    // Handle variant logic
    if (variantId) {
      const variant = product.variants.id(variantId);
      if (!variant) {
        throw new AppError('Selected variant does not exist.', 400, 'VARIANT_NOT_FOUND');
      }
      price = variant.salePrice || variant.price;
      variantName = variant.name;
      if (variant.images && variant.images.length > 0) {
        image = variant.images[0]; // Override with variant specific image
      }
      availableStock = variant.stockQuantity;
    }

    if (requestedQty > availableStock) {
      throw new AppError(`Only ${availableStock} units available in stock.`, 400, 'INSUFFICIENT_STOCK');
    }

    return {
      product: productId,
      variant: variantId || null,
      priceSnapshot: price,
      nameSnapshot: name,
      imageSnapshot: image,
      variantNameSnapshot: variantName,
      availableStock, // Passed back to controller for bounds checking, not saved to DB
    };
  }
}

module.exports = CartService;
