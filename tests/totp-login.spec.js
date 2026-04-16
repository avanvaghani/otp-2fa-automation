const { test, expect } = require("@playwright/test");
const TOTPGenerator = require("../src/totp-generator");
require("dotenv").config();

const BASE_URL = `http://localhost:${process.env.DEMO_APP_PORT || 3333}`;
const TOTP_SECRET = process.env.TOTP_SECRET;

test.describe("2FA Login with TOTP", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("TC-01: Successful login with valid credentials and valid OTP", async ({
    page,
  }) => {
    // Step 1: Enter valid credentials
    await page.getByTestId("username").fill("testuser");
    await page.getByTestId("password").fill("Test@123");
    await page.getByTestId("login-btn").click();

    // Step 2: Wait for OTP step to appear
    await expect(page.getByTestId("otp-input")).toBeVisible();

    // Step 3: Generate TOTP and enter it
    const otp = TOTPGenerator.generateOTP(TOTP_SECRET);
    console.log(`Generated OTP: ${otp}`);

    await page.getByTestId("otp-input").fill(otp);
    await page.getByTestId("verify-btn").click();

    // Step 4: Verify dashboard is visible
    await expect(page.getByTestId("dashboard-title")).toBeVisible();
    await expect(page.getByTestId("dashboard-title")).toHaveText(
      "Welcome to Dashboard!"
    );
    await expect(page.getByTestId("logged-user")).toHaveText("testuser");
  });

  test("TC-02: Login fails with invalid credentials", async ({ page }) => {
    await page.getByTestId("username").fill("wronguser");
    await page.getByTestId("password").fill("WrongPass");
    await page.getByTestId("login-btn").click();

    // Should show error message, OTP step should NOT appear
    await expect(page.locator("#login-message")).toBeVisible();
    await expect(page.locator("#login-message")).toHaveText(
      "Invalid credentials"
    );
    await expect(page.getByTestId("otp-input")).not.toBeVisible();
  });

  test("TC-03: Login fails with valid credentials but invalid OTP", async ({
    page,
  }) => {
    // Step 1: Login with valid credentials
    await page.getByTestId("username").fill("testuser");
    await page.getByTestId("password").fill("Test@123");
    await page.getByTestId("login-btn").click();

    // Step 2: Enter wrong OTP
    await expect(page.getByTestId("otp-input")).toBeVisible();
    await page.getByTestId("otp-input").fill("000000");
    await page.getByTestId("verify-btn").click();

    // Should show OTP error, dashboard should NOT appear
    await expect(page.locator("#otp-message")).toBeVisible();
    await expect(page.locator("#otp-message")).toHaveText("Invalid OTP");
    await expect(page.getByTestId("dashboard-title")).not.toBeVisible();
  });

  test("TC-04: OTP field should accept only 6 digits", async ({ page }) => {
    await page.getByTestId("username").fill("testuser");
    await page.getByTestId("password").fill("Test@123");
    await page.getByTestId("login-btn").click();

    await expect(page.getByTestId("otp-input")).toBeVisible();

    // Try entering more than 6 characters
    await page.getByTestId("otp-input").fill("12345678");
    const value = await page.getByTestId("otp-input").inputValue();

    // maxlength=6 should restrict to 6 chars
    expect(value.length).toBeLessThanOrEqual(6);
  });

  test("TC-05: Generate and verify OTP programmatically", async () => {
    // Pure unit test for TOTP generator
    const secret = TOTPGenerator.generateSecret();
    const otp = TOTPGenerator.generateOTP(secret);

    // OTP should be 6 digits
    expect(otp).toMatch(/^\d{6}$/);

    // OTP should be valid for the same secret
    const isValid = TOTPGenerator.verifyOTP(otp, secret);
    expect(isValid).toBe(true);

    // OTP should be invalid for a different secret
    const otherSecret = TOTPGenerator.generateSecret();
    const isInvalid = TOTPGenerator.verifyOTP(otp, otherSecret);
    expect(isInvalid).toBe(false);
  });

  test("TC-06: Time remaining for OTP should be between 1-30 seconds", async () => {
    const timeRemaining = TOTPGenerator.getTimeRemaining();
    expect(timeRemaining).toBeGreaterThan(0);
    expect(timeRemaining).toBeLessThanOrEqual(30);
  });
});
