/**
 * controllers/cart.controller.js
 *
 * PURPOSE:
 *   Handles HTTP requests for the user's shopping cart.
 *   Provides endpoints to view, add, update, and remove items.
 */

'use strict';

const CartService = require('../services/cart.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get user cart with calculated totals
 * @route   GET /api/v1/cart
 * @access  Private (Customer)
 */
const getCart = asyncHandler(async (req, res) => {
  const cart = await CartService.getOrCreateCart(req.user._id);
  const totals = CartService.calculateTotals(cart);

  res.status(200).json({
    success: true,
    data: {
      _id: cart._id,
      items: cart.items,
      coupon: cart.coupon,
      ...totals,
    },
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/v1/cart/items
 * @access  Private (Customer)
 */
const addItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  if (!productId) {
    throw new AppError('Product ID is required', 400, 'MISSING_PRODUCT_ID');
  }

  const cart = await CartService.getOrCreateCart(req.user._id);

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex((item) => {
    return item.product.toString() === productId && 
           (item.variant ? item.variant.toString() === variantId : !variantId);
  });

  let newQuantity = quantity;
  if (existingItemIndex > -1) {
    newQuantity += cart.items[existingItemIndex].quantity;
  }

  // Fetch product and validate stock based on the NEW total quantity
  const snapshotData = await CartService.getProductSnapshotData(productId, variantId, newQuantity);

  if (existingItemIndex > -1) {
    // Update existing item
    cart.items[existingItemIndex].quantity = newQuantity;
    // Update price snapshot in case it changed since they last added it
    cart.items[existingItemIndex].priceSnapshot = snapshotData.priceSnapshot;
  } else {
    // Check cart length limit
    if (cart.items.length >= 20) {
      throw new AppError('Cart cannot hold more than 20 distinct items', 400, 'CART_FULL');
    }
    // Add new item
    cart.items.push({
      product: snapshotData.product,
      variant: snapshotData.variant,
      quantity: newQuantity,
      priceSnapshot: snapshotData.priceSnapshot,
      nameSnapshot: snapshotData.nameSnapshot,
      imageSnapshot: snapshotData.imageSnapshot,
      variantNameSnapshot: snapshotData.variantNameSnapshot,
    });
  }

  await cart.save();
  const totals = CartService.calculateTotals(cart);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: {
      items: cart.items,
      ...totals,
    },
  });
});

/**
 * @desc    Update item quantity in cart
 * @route   PATCH /api/v1/cart/items/:itemId
 * @access  Private (Customer)
 */
const updateItemQuantity = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    throw new AppError('Quantity must be at least 1. Use DELETE to remove the item.', 400, 'INVALID_QUANTITY');
  }

  const cart = await CartService.getOrCreateCart(req.user._id);
  
  const item = cart.items.id(itemId);
  if (!item) {
    throw new AppError('Item not found in cart', 404, 'ITEM_NOT_FOUND');
  }

  // Verify stock before updating
  await CartService.getProductSnapshotData(item.product, item.variant, quantity);

  item.quantity = quantity;
  await cart.save();

  const totals = CartService.calculateTotals(cart);

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    data: {
      items: cart.items,
      ...totals,
    },
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/v1/cart/items/:itemId
 * @access  Private (Customer)
 */
const removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const cart = await CartService.getOrCreateCart(req.user._id);
  
  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  
  if (itemIndex === -1) {
    throw new AppError('Item not found in cart', 404, 'ITEM_NOT_FOUND');
  }

  cart.items.splice(itemIndex, 1);
  
  // If cart is empty, remove coupon to prevent hanging discounts
  if (cart.items.length === 0) {
    cart.coupon = null;
    cart.couponDiscount = 0;
  }

  await cart.save();
  const totals = CartService.calculateTotals(cart);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: {
      items: cart.items,
      ...totals,
    },
  });
});

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/v1/cart
 * @access  Private (Customer)
 */
const clearCart = asyncHandler(async (req, res) => {
  const cart = await CartService.getOrCreateCart(req.user._id);
  
  cart.items = [];
  cart.coupon = null;
  cart.couponDiscount = 0;
  
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    data: {
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      totalAmount: 0,
      totalItems: 0,
    },
  });
});

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
