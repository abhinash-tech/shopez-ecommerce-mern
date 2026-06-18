'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');

router.use(authenticate); // All user routes require authentication

router.get('/me', userController.getProfile);
router.post('/wishlist', userController.toggleWishlist);

module.exports = router;
