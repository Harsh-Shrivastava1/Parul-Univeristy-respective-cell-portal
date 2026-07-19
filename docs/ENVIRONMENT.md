# Coordinator Portal — Environment Variables

## Backend (`server/.env`)

| Variable | Purpose | Required | Default | Production recommendation |
|---|---|---|---|---|
| `PORT` | API port | No | `5001` | Set explicitly / behind proxy |
| `NODE_ENV` | Environment | No | `development` | `production` |
| `MONGODB_URI` | Shared Atlas connection string | **Yes** (to connect) | *(empty → error)* | Least-privilege user, TLS |
| `MONGODB_DB_NAME` | Database name | No | `parul_internship_system` | Keep shared name |
| `JWT_ACCESS_SECRET` | Signs/verifies access tokens | **Yes — won't boot without it** | *(none)* | Long random |
| `JWT_REFRESH_SECRET` | Signs/verifies refresh tokens | **Yes — won't boot without it** | *(none)* | Long random, distinct |
| `ACCESS_TOKEN_TTL` | Access lifetime | No | `15m` | `15m` |
| `REFRESH_TOKEN_TTL` | Refresh lifetime | No | `7d` | `7d` |
| `BCRYPT_ROUNDS` | Hash cost (compare only) | No | `12` | `12`+ |
| `FRONTEND_ORIGINS` | CORS allowlist (comma-separated) | No | localhost dev origins | Exact SPA origin(s), no `*` |
| `COOKIE_SAMESITE` | Cookie SameSite policy | No | `strict` | `strict` same-site; `none` cross-site (forces Secure) |
| `COOKIE_SECURE` | Override Secure flag | No | `true` in prod (`none`→always) | `true` (HTTPS) |

## Frontend (`.env`, optional)

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_URL` | Coordinator backend base | `http://localhost:5001/api` |

Coordinator accounts (users, role 'coordinator') are provisioned by the Admin
Portal with a bcrypt password; this portal only authenticates them.
