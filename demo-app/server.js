const http = require("http");
const fs = require("fs");
const path = require("path");
const speakeasy = require("speakeasy");

// Demo secret - same as in .env file
const TOTP_SECRET = "JBSWY3DPEHPK3PXP";

// Demo user credentials
const DEMO_USER = {
  username: "testuser",
  password: "Test@123",
};

const PORT = process.env.DEMO_APP_PORT || 3333;

const server = http.createServer((req, res) => {
  // Serve the login page
  if (req.method === "GET" && req.url === "/") {
    const html = fs.readFileSync(
      path.join(__dirname, "index.html"),
      "utf-8"
    );
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  // Handle login (Step 1: username + password)
  if (req.method === "POST" && req.url === "/api/login") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const { username, password } = JSON.parse(body);

      if (
        username === DEMO_USER.username &&
        password === DEMO_USER.password
      ) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "OTP required" }));
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Invalid credentials" })
        );
      }
    });
    return;
  }

  // Handle OTP verification (Step 2: enter TOTP)
  if (req.method === "POST" && req.url === "/api/verify-otp") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const { otp } = JSON.parse(body);
      const isValid = speakeasy.totp.verify({
        secret: TOTP_SECRET,
        encoding: "base32",
        token: otp,
        window: 1,
      });

      if (isValid) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: true,
            message: "Login successful! Welcome to Dashboard.",
          })
        );
      } else {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ success: false, message: "Invalid OTP" })
        );
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`Demo 2FA app running at http://localhost:${PORT}`);
});

module.exports = server;
