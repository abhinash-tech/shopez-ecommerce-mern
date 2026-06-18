'use strict';

const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (!user) throw new AppError('User not found', 404);

  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Toggle product in wishlist
 * @route   POST /api/v1/users/wishlist
 * @access  Private
 */
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  if (!productId) throw new AppError('Product ID is required', 400);

  const user = await User.findById(req.user._id);
  
  const inWishlist = user.wishlist.includes(productId);
  
  if (inWishlist) {
    user.wishlist.pull(productId);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: inWishlist ? 'Removed from wishlist' : 'Added to wishlist',
    wishlist: user.wishlist
  });
});

module.exports = { getProfile, toggleWishlist };
