# OTP/2FA Automation with Playwright

Automate Two-Factor Authentication (TOTP) login flows using Playwright and Speakeasy.

## How TOTP Works

```
Secret Key (base32) + Current Time (30s window)
    → HMAC-SHA1 Algorithm
    → 6-digit OTP (e.g., 482901)
```

If you have the **secret key**, you can generate the same OTP that Google Authenticator would — no phone needed.

## Project Structure

```
otp-2fa-automation/
├── src/
│   └── totp-generator.js       # TOTP utility class (generate, verify, secret)
├── tests/
│   └── totp-login.spec.js      # Playwright test cases (6 tests)
├── demo-app/
│   ├── server.js               # Node.js server with 2FA login
│   └── index.html              # Login UI (credentials → OTP → dashboard)
├── utils/
│   └── generate-otp.js         # CLI tool to generate OTP on demand
├── playwright.config.js
├── .env.example
└── package.json
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Add your TOTP secret (demo: JBSWY3DPEHPK3PXP)

# 3. Start demo app
npm run start:app

# 4. Run tests (in another terminal)
npm test
```

## Test Cases

| Test | Description |
|------|-------------|
| TC-01 | Successful login with valid credentials + valid TOTP |
| TC-02 | Login fails with invalid credentials |
| TC-03 | Login fails with valid credentials but wrong OTP |
| TC-04 | OTP input field max length validation |
| TC-05 | TOTP generate & verify programmatically |
| TC-06 | Time remaining calculation (1-30 seconds) |

## Key Concept: How We Automate OTP

```javascript
const speakeasy = require("speakeasy");

// Same secret that's configured in the authenticator app
const secret = "JBSWY3DPEHPK3PXP";

// Generate valid OTP — same code Google Authenticator shows
const otp = speakeasy.totp({ secret, encoding: "base32" });

// Use in Playwright
await page.getByTestId("otp-input").fill(otp);
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:app` | Start the demo 2FA application |
| `npm test` | Run all Playwright tests (headless) |
| `npm run test:headed` | Run tests with browser visible |
| `npm run test:debug` | Run tests in debug mode |
| `npm run report` | Open Playwright HTML report |
| `npm run generate-otp` | Generate current OTP in terminal |

## Tech Stack

- **Playwright** — Browser automation & testing
- **Speakeasy** — TOTP code generation & verification
- **Node.js** — Demo app server
- **dotenv** — Environment variable management
