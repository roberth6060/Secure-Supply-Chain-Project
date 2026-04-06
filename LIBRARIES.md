# Libraries and Tools Used — Rationale

**ISTE.442.800 – Secure Web Application Development**
Self-Guided Study: Software Supply Chain Security

---

## 1. `express` v5 (production dependency)

| Attribute | Detail |
|-----------|--------|
| Package | `express` |
| Version pinned in lock file | `^5.2.1` |
| Role | HTTP server framework |

**Why chosen:**  
Express is the most widely deployed Node.js web framework in production — its use reflects realistic industry conditions rather than an artificial lab environment. It provides just enough structure (routing, middleware stack) to demonstrate hardening headers and endpoint behaviour without adding business-logic noise that would distract from the supply chain security topic.  

**Supply chain security relevance:**  
Express and its transitive dependencies are fetched from the npm registry on every `npm ci`. Running `npm audit --audit-level=high` after install checks whether Express or any of its transitive packages carry a known critical or high advisory. This makes Express the controlled dependency whose audit status the CI pipeline actively enforces — it is not just a tool choice, it is the subject of the demonstration.

---

## 2. `node:test` and `node:assert/strict` (built-in — no install required)

| Attribute | Detail |
|-----------|--------|
| Package | Node.js standard library (built-in since Node 18) |
| Role | Test runner and assertion library |

**Why chosen:**  
Using the built-in test runner eliminates a test-framework dependency from the lock file. This is a deliberate supply chain security decision: every additional npm dependency is an additional vector for a malicious or vulnerable package. `node:test` provides everything needed (async test cases, TAP-like output, a proper non-zero exit code on failure) with zero added risk surface.  

**Supply chain security relevance:**  
Because it is part of the Node.js runtime itself, it is covered by Node.js release security processes, not by individual npm maintainers. Choosing built-in tooling over third-party testing frameworks is a concrete, justifiable reduction of the dependency attack surface.

---

## 3. `npm` and `npm audit` (package manager — ships with Node.js)

| Attribute | Detail |
|-----------|--------|
| Tool | npm CLI (bundled with Node.js) |
| Key command | `npm audit --audit-level=high` |
| Role | Dependency management and vulnerability scanning |

**Why chosen:**  
npm is the default package manager for JavaScript and is already present in every Node.js environment. It maintains a public advisory database (the npm Advisory Database, sourced from GitHub Advisory Database / OSV) and the `npm audit` command queries that database against the exact resolved dependency tree in `package-lock.json`.  

**Supply chain security relevance:**  
`npm audit --audit-level=high` is the primary enforcement gate in the CI pipeline. A non-zero exit code (returned when high-severity findings exist) causes the GitHub Actions job to fail, blocking any further pipeline steps (including deployment). Using `npm ci` instead of `npm install` ensures that the lock file is authoritative: the exact same dependency versions that were audited are the ones installed.

---

## 4. GitHub Actions (CI/CD — `.github/workflows/ci.yml`)

| Attribute | Detail |
|-----------|--------|
| Platform | GitHub Actions |
| Trigger | Every `push` event |
| Runner | `ubuntu-latest` |
| Role | Automated security enforcement pipeline |

**Why chosen:**  
GitHub Actions is the CI/CD system integrated directly into the repository host used for this project. It provides verifiable, per-commit execution logs and is the standard tool for enforcing repository-level security policies (branch protections, required status checks) in small and large teams alike.  

**Supply chain security relevance:**  
CI/CD systems are themselves part of the software supply chain — they are the infrastructure that transforms source code into a shipped artefact. Placing security checks (audit, tests) inside the pipeline rather than relying on developer workstations ensures the checks are not skipped, are consistent across contributors, and produce a traceable audit trail tied to specific commits. This addresses the exact failure mode illustrated by the SolarWinds compromise: an attacker who bypasses build-pipeline controls can undermine all application-layer security.

---

## Summary Table

| Library / Tool | Type | Version / Source | Security Reason for Choice |
|---|---|---|---|
| `express` | npm dependency | `^5.2.1` | Industry-realistic; subject of the audit gate |
| `node:test` | Built-in | Node.js ≥ 18 | Zero added supply chain surface for testing |
| `node:assert` | Built-in | Node.js core | Zero added supply chain surface for assertions |
| `npm` + `npm audit` | Bundled CLI | Ships with Node.js | Authoritative advisory database; CI enforcement gate |
| GitHub Actions | CI/CD platform | `ubuntu-latest` | Traceable, per-commit enforcement; cannot be skipped locally |
