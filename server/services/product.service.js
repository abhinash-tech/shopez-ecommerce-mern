/**
 * services/product.service.js
 *
 * PURPOSE:
 *   Handles advanced queries for products such as filtering, sorting,
 *   pagination, and text searching.
 */

'use strict';

const Product = require('../models/Product.model');

class ProductService {
  /**
   * Builds the MongoDB query object based on request queries.
   */
  static async buildQuery(queryObj) {
    const filter = {
      status: 'active', // Public queries only see active products
      isApproved: true,
    };

    // 1. Search (Full-text search)
    if (queryObj.q) {
      filter.$text = { $search: queryObj.q };
    }

    // 2. Category Filter
    if (queryObj.category) {
      const Category = require('../models/Category.model');
      const cat = await Category.findOne({ slug: queryObj.category });
      if (cat) {
        filter.category = cat._id;
      } else {
        // If the category slug does not exist, force an empty result
        filter.category = null;
      }
    }

    // 3. Brand Filter
    if (queryObj.brand) {
      // Split by comma for multiple brands: ?brand=sony,apple
      const brands = queryObj.brand.split(',');
      filter.brand = { $in: brands };
    }

    // 4. Price Range Filter
    if (queryObj.minPrice || queryObj.maxPrice) {
      filter.basePrice = {};
      if (queryObj.minPrice) filter.basePrice.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) filter.basePrice.$lte = Number(queryObj.maxPrice);
    }

    // 5. Minimum Rating Filter
    if (queryObj.minRating) {
      filter.avgRating = { $gte: Number(queryObj.minRating) };
    }

    return filter;
  }

  /**
   * Determines the sort configuration.
   */
  static buildSort(sortStr) {
    switch (sortStr) {
      case 'price_asc':
        return { basePrice: 1 };
      case 'price_desc':
        return { basePrice: -1 };
      case 'rating_desc':
        return { avgRating: -1 };
      case 'newest':
        return { createdAt: -1 };
      default:
        // Default sort: if text search, sort by text score relevance, else newest
        return { createdAt: -1 }; // Handled conditionally in controller for text score
    }
  }
}

module.exports = ProductService;
