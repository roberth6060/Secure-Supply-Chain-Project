/**
 * index.test.js – Supply chain security demo: automated test suite
 *
 * Run with:  npm test   (invokes `node --test`)
 *
 * Why these tests matter for supply chain security:
 *   1. Security headers are the minimum hardening baseline for any HTTP service.
 *      CI gating on these tests means a regression that removes a header causes
 *      the pipeline to fail before the code reaches production.
 *   2. Deterministic tests (no live network calls, no manual steps) allow the
 *      GitHub Actions workflow to enforce policy repeatably on every push.
 *   3. Combining header tests, body tests, and status-code tests covers the
 *      three main attack surfaces the demo addresses: content injection,
 *      clickjacking, and information leakage.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("./index");

// ── Helper ────────────────────────────────────────────────────────────────────

function request(path, port, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: "127.0.0.1", path, port, method },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => { body += chunk; });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("GET / returns 200 with branded HTML body", async () => {
  const app = createApp();
  const server = app.listen(0);
  try {
    const { statusCode, body } = await request("/", server.address().port);
    assert.equal(statusCode, 200);
    assert.match(body, /Secure Supply Chain Demo/i);
    assert.match(body, /Dependency Scanning/i);
    assert.match(body, /Controlled Pipeline/i);
  } finally {
    server.close();
  }
});

// ── Security-header tests (supply chain security enforcement) ─────────────────
//
// Each of the three headers below is set unconditionally in createApp().
// Verifying them in automated tests means the CI pipeline will catch any
// accidental removal or misconfiguration before the change reaches production —
// exactly the "shift-left" principle at the heart of supply chain security.

test("GET / sets X-Content-Type-Options: nosniff (prevents MIME sniffing)", async () => {
  const app = createApp();
  const server = app.listen(0);
  try {
    const { headers } = await request("/", server.address().port);
    assert.equal(headers["x-content-type-options"], "nosniff");
  } finally {
    server.close();
  }
});

test("GET / sets X-Frame-Options: DENY (prevents clickjacking)", async () => {
  const app = createApp();
  const server = app.listen(0);
  try {
    const { headers } = await request("/", server.address().port);
    assert.equal(headers["x-frame-options"], "DENY");
  } finally {
    server.close();
  }
});

test("GET / sets Referrer-Policy: no-referrer (limits information leakage)", async () => {
  const app = createApp();
  const server = app.listen(0);
  try {
    const { headers } = await request("/", server.address().port);
    assert.equal(headers["referrer-policy"], "no-referrer");
  } finally {
    server.close();
  }
});

// ── /health endpoint ──────────────────────────────────────────────────────────

test("GET /health returns 200 JSON { status: 'ok' }", async () => {
  const app = createApp();
  const server = app.listen(0);
  try {
    const { statusCode, headers, body } = await request("/health", server.address().port);
    assert.equal(statusCode, 200);
    assert.ok(headers["content-type"].includes("application/json"));
    assert.deepEqual(JSON.parse(body), { status: "ok" });
  } finally {
    server.close();
  }
});

test("GET /health also carries all hardening headers", async () => {
  const app = createApp();
  const server = app.listen(0);
  try {
    const { headers } = await request("/health", server.address().port);
    assert.equal(headers["x-content-type-options"], "nosniff");
    assert.equal(headers["x-frame-options"], "DENY");
    assert.equal(headers["referrer-policy"], "no-referrer");
  } finally {
    server.close();
  }
});

// ── Unknown routes ────────────────────────────────────────────────────────────

test("GET /unknown returns 404 (no information disclosure on unknown paths)", async () => {
  const app = createApp();
  const server = app.listen(0);
  try {
    const { statusCode } = await request("/unknown-route", server.address().port);
    assert.equal(statusCode, 404);
  } finally {
    server.close();
  }
});
