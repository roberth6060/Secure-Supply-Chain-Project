const express = require("express");

function buildHomePageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Secure Supply Chain Demo</title>
    <style>
      :root {
        --ink: #14213d;
        --deep: #1f3b73;
        --accent: #fca311;
        --paper: #f8f4ec;
        --card: #ffffff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Trebuchet MS", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at 10% 10%, #ffd48a 0%, transparent 35%),
          radial-gradient(circle at 90% 90%, #aecbff 0%, transparent 30%),
          linear-gradient(140deg, #f7efe0 0%, #e9f1ff 100%);
        min-height: 100vh;
      }

      .layout {
        width: min(900px, 92vw);
        margin: 48px auto;
        background: var(--card);
        border-radius: 16px;
        box-shadow: 0 18px 40px rgba(20, 33, 61, 0.18);
        overflow: hidden;
      }

      .hero {
        padding: 36px 28px;
        color: #fff;
        background: linear-gradient(120deg, var(--deep), #2e5aac 70%, #4d7dd4 100%);
      }

      h1 {
        margin: 0 0 10px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(1.7rem, 4vw, 2.4rem);
        letter-spacing: 0.4px;
      }

      .tagline {
        margin: 0;
        font-size: 1.05rem;
        line-height: 1.5;
        max-width: 70ch;
      }

      .content {
        padding: 24px 28px 30px;
      }

      .grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .card {
        padding: 14px;
        border-left: 4px solid var(--accent);
        background: #fffaf1;
        border-radius: 10px;
      }

      .card h2 {
        margin: 0 0 8px;
        font-size: 1rem;
      }

      .card p {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.4;
      }

      .status {
        margin-top: 16px;
        padding: 12px 14px;
        border-radius: 10px;
        background: #eef7ff;
        border: 1px solid #c6ddff;
        font-weight: 600;
      }

      code {
        background: #f2f4f8;
        padding: 2px 6px;
        border-radius: 6px;
        font-family: Consolas, "Courier New", monospace;
      }
    </style>
  </head>
  <body>
    <main class="layout">
      <section class="hero">
        <h1>Secure Supply Chain Demo</h1>
        <p class="tagline">
          A lightweight Node.js app showing how dependency auditing and CI policy enforcement support secure web application delivery.
        </p>
      </section>
      <section class="content">
        <div class="grid">
          <article class="card">
            <h2>Dependency Scanning</h2>
            <p>CI runs <code>npm audit --audit-level=high</code> on every push.</p>
          </article>
          <article class="card">
            <h2>Controlled Pipeline</h2>
            <p>Build steps are deterministic and fail fast when security policy is violated.</p>
          </article>
          <article class="card">
            <h2>Traceable Logs</h2>
            <p>GitHub Actions keeps per-commit logs for accountability and review.</p>
          </article>
        </div>
        <p class="status">Service Status: Running on port 3000</p>
      </section>
    </main>
  </body>
</html>`;
}

function createApp() {
  const app = express();

  // Set security headers on all responses to enforce hardening policies.
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff"); //  Prevents MIME sniffing, which can lead to content injection attacks.
    res.setHeader("X-Frame-Options", "DENY"); // Prevents clickjacking by disallowing the page from being framed.
    res.setHeader("Referrer-Policy", "no-referrer"); // Prevents information leakage by not sending referrer information to other sites.
    next();
  });

  app.get("/", (req, res) => {
    res.status(200).type("html").send(buildHomePageHtml());
  });

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

module.exports = { createApp };
// Test