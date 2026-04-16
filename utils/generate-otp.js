/**
 * Standalone utility to generate and display TOTP codes
 * Run: npm run generate-otp
 */
const TOTPGenerator = require("../src/totp-generator");
require("dotenv").config();

const secret = process.env.TOTP_SECRET;

console.log("=================================");
console.log("   TOTP Code Generator");
console.log("=================================");
console.log(`Secret Key : ${secret}`);
console.log(`Current OTP: ${TOTPGenerator.generateOTP(secret)}`);
console.log(`Expires in : ${TOTPGenerator.getTimeRemaining()} seconds`);
console.log("=================================");
