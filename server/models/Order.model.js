/**
 * models/Order.model.js
 *
 * PURPOSE:
 *   Mongoose schema definition for the Order collection.
 *   This schema relies heavily on snapshotting data (shipping address,
 *   prices, product names) so that historical orders remain accurate
 *   even if users change their addresses or products are updated.
 */

'use strict';

const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Technically references the Vendor, mapping to User for MVP
    required: true,
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, required: true },
  variantName: { type: String, default: null },
  // Optional: per-item status for multi-vendor orders (e.g. one item shipped, one pending)
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
}, { _id: true }); // Keep _id to track individual line items for returns

const AddressSnapshotSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String, default: null },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  comment: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      // Format: SEZ-YYYYMMDD-XXXX
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      validate: [
        (val) => val.length > 0,
        'Order must contain at least one item',
      ],
    },
    shippingAddress: {
      type: AddressSnapshotSchema,
      required: true,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    couponCode: { type: String, default: null }, // Snapshot in case coupon is deleted
    subtotal: { type: Number, required: true, min: 0 },
    couponDiscount: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    
    // Overall Order Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: () => [{ status: 'pending', comment: 'Order placed' }],
    },

    // Payment Tracking
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'wallet', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment', // Payment module placeholder
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// OrderSchema.index({ orderNumber: 1 }); // Removed: Created automatically by unique: true
OrderSchema.index({ user: 1, createdAt: -1 }); // Fast lookup for user's order history
OrderSchema.index({ status: 1 }); // Admin/Vendor filtering by status
OrderSchema.index({ 'items.vendor': 1 }); // For vendors to find their orders

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
