const speakeasy = require("speakeasy");

class TOTPGenerator {
  /**
   * Generate a TOTP code from a secret key
   * @param {string} secret - Base32 encoded secret key
   * @returns {string} 6-digit OTP code
   */
  static generateOTP(secret) {
    return speakeasy.totp({
      secret: secret,
      encoding: "base32",
    });
  }

  /**
   * Verify if a given OTP is valid for the secret
   * @param {string} token - The OTP to verify
   * @param {string} secret - Base32 encoded secret key
   * @returns {boolean}
   */
  static verifyOTP(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 1, // Allow 1 step tolerance (30 seconds before/after)
    });
  }

  /**
   * Generate a new random secret key (used when setting up 2FA)
   * @returns {string} Base32 encoded secret
   */
  static generateSecret() {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.base32;
  }

  /**
   * Get the time remaining before current OTP expires
   * @returns {number} seconds remaining
   */
  static getTimeRemaining() {
    const epoch = Math.round(Date.now() / 1000);
    return 30 - (epoch % 30);
  }
}

module.exports = TOTPGenerator;
