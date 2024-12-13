const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    monnify: {
        apiKey: process.env.MONNIFY_API_KEY,
        secretKey: process.env.MONNIFY_SECRET_KEY,
        baseUrl: process.env.MONNIFY_BASE_URL,
        contractCode: process.env.MONNIFY_CONTRACT_CODE
    }
};

module.exports = config;