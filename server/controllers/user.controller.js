'use strict';

const User = require('../models/User.model');
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

const getAllUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    throw new AppError('Not authorized', 403);
  }
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: users });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    throw new AppError('Not authorized', 403);
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'User deleted' });
});

module.exports = { getProfile, toggleWishlist, getAllUsers, deleteUser };
