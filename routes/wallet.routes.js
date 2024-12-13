const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../middleware/auth.middleware');
const monnifyMiddleware = require('../middleware/monnify.middleware');

router.get('/wallets', [authMiddleware, monnifyMiddleware], walletController.getWallets);
router.get('/balance', [authMiddleware, monnifyMiddleware], walletController.getBalance);
router.get('/transactions', [authMiddleware, monnifyMiddleware], walletController.getTransactions);
router.post('/transfer', [authMiddleware, monnifyMiddleware], walletController.transfer);

module.exports = router;
