/**
 * models/Category.model.js
 *
 * PURPOSE:
 *   Mongoose schema definition for the Category collection.
 *   This is a dependency for the Product module to establish references.
 */

'use strict';

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // null means it is a top-level category
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug if not provided (simplified)
CategorySchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
