const axios = require('axios');
const User = require('../models/user.model'); // Adjust the path as necessary
const config = require('../config/config');





exports.getWallets = async (req, res) => {
    try {
        console.log('User ID:', req.user.email);
        console.log(req.monnifyToken)
        if (!req.user || !req.user.userId) {
           
            return res.status(400).json({ message: 'here' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const response = await axios.get(
            `${config.monnify.baseUrl}/api/v1/disbursements/wallet`,
            {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${req.monnifyToken}`,
                },
                params: {
                    customerEmail: req.user.email,
                    pageSize: 10,
                    pageNo: 0,
                },
            }
        );

        res.json(response.data.responseBody);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch wallets', error: error.message });
    }
};



exports.getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        console.log(user);
        const response = await axios.get(
            `${config.monnify.baseUrl}/api/v1/disbursements/wallet/balance?accountNumber=${user.accountNumber}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.monnifyToken}`
                },
               
            }
        );

        res.json(response.data.responseBody);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch balance', error: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const response = await axios.get(
            `${config.monnify.baseUrl}/api/v1/disbursements/wallet/transactions?accountNumber=${user.accountNumber}`,
            {
                headers: {
                    'Authorization': `Bearer ${req.monnifyToken}`
                }
            }
        );

        res.json(response.data.responseBody);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }
};

exports.transfer = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const { amount, destinationBankCode, destinationAccountNumber } = req.body;

        const transferData = {
            amount,
            reference: `transfer-debit-${Date.now()}`,
            narration: `Transfer from ${user.username}`,          
            destinationBankCode,
            destinationAccountNumber,
            currency: "NGN",
            sourceAccountNumber: user.accountNumber,
        
        };
        console.log('Transfer Data:', transferData);

        const response = await axios.post(
            `${config.monnify.baseUrl}/api/v1/disbursements/single`,
            transferData,
            {
                headers: {
                    'Authorization': `Bearer ${req.monnifyToken}`
                }
            }
        );

        res.json(response.data.responseBody);
    } catch (error) {
        res.status(500).json({ message: 'Transfer failed', error: error.message });
    }
};



