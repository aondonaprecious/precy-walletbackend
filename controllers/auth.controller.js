const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const axios = require('axios');
const { generateWalletReference } = require('../utils/reference.generator');


exports.register = async (req, res) => {
    try {
        const { username, email, password, bvn, bvnDateOfBirth } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists with this email or username' 
            });
        }

        // Validate BVN format (11 digits)
        if (!/^\d{11}$/.test(bvn)) {
            return res.status(400).json({ 
                message: 'Invalid BVN format. Must be 11 digits' 
            });
        }

        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(bvnDateOfBirth)) {
            return res.status(400).json({ 
                message: 'Invalid date format. Use YYYY-MM-DD' 
            });
        }

        // Create wallet reference
        const walletRef = generateWalletReference();

        // Prepare wallet data for Monnify
        const walletData = {
            walletReference: walletRef,
            walletName: `Wallet-${username}-${Date.now()}`, // Make wallet name unique
            customerName: username,
            customerEmail: email,
            bvnDetails: {
                bvn,
                bvnDateOfBirth
            }
        };

        console.log('Sending request to Monnify:', {
            url: `${config.monnify.baseUrl}/api/v1/disbursements/wallet`,
            data: walletData,
            token: req.monnifyToken
        });

        // Create wallet on Monnify
        const response = await axios.post(
            `${config.monnify.baseUrl}/api/v1/disbursements/wallet`,
            walletData,
            {
                headers: {
                    'Authorization': `Bearer ${req.monnifyToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // If wallet creation successful, create user in database
        if (response.data.requestSuccessful) {
            const user = new User({
                username,
                email,
                password,
                bvn,
                bvnDateOfBirth,
                walletReference: response.data.responseBody.walletReference,
                accountNumber: response.data.responseBody.accountNumber,
                accountName: response.data.responseBody.accountName
            });

            await user.save();

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                config.jwtSecret,
                { expiresIn: '24h' }
            );

            return res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    username: user.username,
                    email: user.email,
                    accountNumber: user.accountNumber,
                    accountName: user.accountName
                }
            });
        } else {
            throw new Error('Wallet creation failed');
        }
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        
        // Handle specific Monnify API errors
        if (error.response?.data) {
            return res.status(error.response.status).json({
                message: 'Registration failed',
                error: error.response.data.responseMessage || error.response.data.message
            });
        }

        res.status(500).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            config.jwtSecret,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                username: user.username,
                email: user.email,
                accountNumber: user.accountNumber,
                accountName: user.accountName
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};