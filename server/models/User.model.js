/**
 * models/User.model.js
 *
 * PURPOSE:
 *   Mongoose schema definition for the User collection.
 *   Enforces data integrity, validation rules, and default values
 *   as defined in the ShopEZ Database Design specification.
 *
 * FEATURES:
 *   - Embedded schemas for Addresses and Notification Preferences.
 *   - Pre-save hook: Automatically hashes passwords if modified.
 *   - Instance method: comparePassword(candidatePassword) for login.
 *   - Custom JSON transform: Strips sensitive fields (password, tokens)
 *     when the user document is sent to the client.
 */

'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config/env');

const AddressSchema = new mongoose.Schema({
  label: { type: String, trim: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: 'India', trim: true },
  isDefault: { type: Boolean, default: false },
});

const NotifPrefsSchema = new mongoose.Schema({
  emailOrders: { type: Boolean, default: true },
  emailOffers: { type: Boolean, default: true },
  emailSecurity: { type: Boolean, default: true }, // Cannot be disabled in UI
  inAppOrders: { type: Boolean, default: true },
  inAppOffers: { type: Boolean, default: true },
}, { _id: false }); // No separate ObjectId needed for the embedded prefs object

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      // Required unless they logged in via OAuth
      required: function () {
        return !this.googleId;
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Do not include in queries by default
    },
    role: {
      type: String,
      enum: ['guest', 'customer', 'vendor', 'admin', 'super_admin'],
      default: 'customer',
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      sparse: true, // Allows missing values to not trigger unique constraint
      unique: true,
    },
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
    emailVerifyToken: { type: String, select: false },
    emailVerifyExpiry: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
    
    // Lockout logic fields
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    
    addresses: {
      type: [AddressSchema],
      validate: [
        (val) => val.length <= 5,
        'You can save a maximum of 5 addresses',
      ],
    },
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    notifPrefs: {
      type: NotifPrefsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Strip sensitive info before sending user object to the client
        delete ret.password;
        delete ret.refreshToken;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpiry;
        delete ret.emailVerifyToken;
        delete ret.emailVerifyExpiry;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Most indexes are created by the `unique: true` or `sparse: true` above,
// but we explicitly define compound indexes here.
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1, isBanned: 1 });
UserSchema.index({ createdAt: -1 });

// ── Pre-Save Hook (Password Hashing) ──────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  // Only run this if password was actually modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ── Instance Methods ──────────────────────────────────────────────────────────

/**
 * Checks if a given plain text password matches the hashed password in the DB.
 *
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Edge case: OAuth user trying to log in with password
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Checks if the account is currently locked due to too many failed attempts.
 */
UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;
