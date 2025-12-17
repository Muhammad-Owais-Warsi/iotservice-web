const crypto = require('crypto');

class HMACService {
    constructor(secret) {
        this.secret = secret;
    }

    /**
     * Verify incoming HMAC signature
     * @param {string} rawBody - Raw request body (unparsed JSON)
     * @param {string} timestamp - X-Timestamp header
     * @param {string} receivedSignature - X-Signature header
     * @returns {boolean} - True if signature is valid
     */
    verifySignature(rawBody, timestamp, receivedSignature) {
        // CRITICAL: Formula must match Python sender
        // Formula: HMAC_SHA256(Payload + Timestamp)
        const message = rawBody + timestamp;

        const calculatedSignature = crypto
            .createHmac('sha256', this.secret)
            .update(message)
            .digest('hex');

        return calculatedSignature === receivedSignature;
    }

    /**
     * Generate signature (for testing)
     */
    generateSignature(rawBody, timestamp) {
        const message = rawBody + timestamp;
        return crypto
            .createHmac('sha256', this.secret)
            .update(message)
            .digest('hex');
    }
}

module.exports = new HMACService(process.env.HMAC_SECRET || '9vA3xKp2nR8sL7qW4eY1zU6tH5mJ0cB2');
