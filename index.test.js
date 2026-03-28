const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("./index");

function request(path, port) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        path,
        port,
        method: "GET"
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, headers: res.headers, body });
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

test("GET / returns branded HTML", async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const response = await request("/", port);
    assert.equal(response.statusCode, 200);
    assert.match(response.body, /Secure Supply Chain Demo/i);
    assert.equal(response.headers["x-content-type-options"], "nosniff");
  } finally {
    server.close();
  }
});

test("GET /health returns healthy status", async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const response = await request("/health", port);
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers["content-type"].includes("application/json"), true);
    assert.deepEqual(JSON.parse(response.body), { status: "ok" });
  } finally {
    server.close();
  }
});
