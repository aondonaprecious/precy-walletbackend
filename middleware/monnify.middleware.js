// middleware/monnify.middleware.js
const axios = require('axios');
const config = require('../config/config');

let monnifyToken = null;
let tokenExpiry = null;

const getMonnifyToken = async () => {
    try {
        const auth = Buffer.from(`${config.monnify.apiKey}:${config.monnify.secretKey}`).toString('base64');
        const response = await axios.post(`${config.monnify.baseUrl}/api/v1/auth/login`, {}, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        monnifyToken = response.data.responseBody.accessToken;
        console.log(monnifyToken);
        tokenExpiry = Date.now() + (response.data.responseBody.expiresIn * 1000);
        return monnifyToken;
    } catch (error) {
        console.error('Error getting Monnify token:', error);
        console.log(error)
        throw error;
        
    }
};

const monnifyMiddleware = async (req, res, next) => {
    try {
        if (!monnifyToken || Date.now() >= tokenExpiry) {
            await getMonnifyToken();
        }
        req.monnifyToken = monnifyToken;
        console.log('Monnify Token:', req.monnifyToken); 
        next();
    } catch (error) {
        res.status(500).json({ message: 'Monnify authentication failed' });
        console.log(error);
    }
};

module.exports = monnifyMiddleware;