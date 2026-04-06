# Secure Supply Chain Demo

**ISTE.442.800 – Secure Web Application Development**
Self-Guided Study: Software Supply Chain Security
Student: Robert Haye

This repository is a working example for the self-guided study on software supply chain security in a Node.js project. It demonstrates automated dependency risk visibility and CI/CD security enforcement using tooling that is common in production teams.

---

## What This Demo Shows

1. A minimal Express web service with hardening response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
2. Automated dependency risk checks using `npm audit --audit-level=high` on every push.
3. CI/CD security gate with GitHub Actions — pipeline fails on high-severity vulnerabilities or test failures.
4. Seven deterministic automated tests (`node --test`) covering status codes, HTML body, all three security headers, and 404 behaviour.

---

## Project Files

| File | Purpose |
|---|---|
| `index.js` | Express app — routes and hardening middleware |
| `index.test.js` | Node built-in test suite (7 tests, zero extra dependencies) |
| `package.json` | Dependency metadata; `npm test` runs `node --test` |
| `package-lock.json` | Lock file — ensures `npm ci` installs exactly audited versions |
| `.github/workflows/ci.yml` | CI pipeline: install → audit → test |
| `LIBRARIES.md` | Per-library description and security rationale |
| `SELF_GUIDED_STUDY_FINAL.md` | Full written study (Introduction, Advantages, Disadvantages, Working Example) |
| `Secure_Supply_Chain_Final.docx` | Word document submission |
| `Secure_Supply_Chain_Slides.pptx` | Presentation (10 slides, generated from `create_slides.py`) |

---

## Run Locally

```bash
npm ci                          # deterministic install from lock file
npm audit --audit-level=high    # check for high-severity advisories
npm test                        # run all 7 tests
npm start                       # start server on port 3000
```

App endpoints:

- `GET /` — HTML landing page demonstrating the supply chain controls in context
- `GET /health` — JSON health status `{ "status": "ok" }`

---

## CI Security Gate (`.github/workflows/ci.yml`)

```
push event
  └─ npm ci                           # lock-file install
  └─ npm audit --audit-level=high     # GATE: fail on high/critical advisory
  └─ npm test                         # GATE: fail on any test failure
```

A non-zero exit from either gate fails the job, produces visible pipeline failure, and blocks any downstream deployment steps.

---

## Real-World Applicability

This pattern scales directly to production teams with the following additions:

| Increment | What it adds |
|---|---|
| Branch protection rules + required status checks | Merges to main are blocked when CI fails |
| Pull request triggers | Audit and tests run on every PR, not just post-merge pushes |
| Dependabot / Renovate | Automated dependency update PRs keep the advisory window small |
| Environment-specific gates | Separate audit and approval steps for staging and production |
| SBOM generation (`npm sbom`) | Artefact-level component inventory for compliance and incident response |
| Artifact signing (Sigstore/Cosign) | Cryptographic provenance — prove the artefact came from your pipeline |

The core principle is platform-independent: security checks must run automatically in the same path that ships software.

**Industry sectors where this pattern is adopted:**
Fintech · SaaS platforms · Healthcare IT · Cloud-native product companies · Government and defense contractors

---

## Submission Readiness Checklist

- [x] `LIBRARIES.md` — per-library description and security rationale
- [x] `Secure_Supply_Chain_Slides.pptx` — 10-slide presentation
- [x] `Secure_Supply_Chain_Final.docx` — full Word document
- [x] 7 passing tests (`npm test`)
- [x] 0 high-severity vulnerabilities (`npm audit --audit-level=high`)
- [x] CI workflow enforces both gates on every push

