'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');

router.use(authenticate); // All user routes require authentication

router.get('/me', userController.getProfile);
router.post('/wishlist', userController.toggleWishlist);

router.get('/', userController.getAllUsers);
router.delete('/:id', userController.deleteUser);

module.exports = router;
