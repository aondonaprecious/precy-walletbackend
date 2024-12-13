const { v4: uuidv4 } = require('uuid');

exports.generateWalletReference = () => {
    return `wallet-${uuidv4()}`;
};