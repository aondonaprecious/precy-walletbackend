const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const monnifyMiddleware = require('../middleware/monnify.middleware');

router.post('/register', monnifyMiddleware, authController.register);
router.post('/login', authController.login);

module.exports = router;