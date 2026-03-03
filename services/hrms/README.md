# HRMS NestJS Microservice

Staffly's **HRMS** service implemented with NestJS as a **NATS microservice**.  
It exposes message patterns consumed by the API Gateway (no public HTTP routes here).

## Setup

```bash
cd services/hrms
npm install
```

Copy or create a `.env` in `services/hrms` with at least:

- **Core**
  - `NODE_ENV` – e.g. `development` or `production`
  - `NATS_URL` – NATS server URL (e.g. `nats://localhost:4222`)
- **Database (MongoDB)**
  - `MONGO_URI_LOCAL` – local MongoDB URI (used when `NODE_ENV=development`)
  - `MONGO_URI_REMOTE` – remote MongoDB URI (used otherwise)
  - `MONGO_DB_NAME` – database name
- **JWT/Auth**
  - `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`
  - `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- **Email (Resend)**
  - `RESEND_API_KEY`, `EMAIL_FROM`
- **AWS S3 (optional, for uploads)**
  - `AWS_S3_REGION`, `AWS_S3_ACCESS_KEY_ID`, `AWS_S3_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`

## Run

```bash
# 1. Start NATS (e.g. Docker: docker run -p 4222:4222 nats)
# 2. Ensure .env has NATS_URL=nats://localhost:4222 (same as Api-Gateway)
npm run start:dev
```

The service runs as a NestJS microservice and listens for **NATS messages**.

### Troubleshooting: `GET /api/v1/hrms/health` returns 503

The API Gateway returns **503** when no HRMS instance is responding over NATS. To get **200**:

1. **NATS is running** – e.g. `docker run -p 4222:4222 nats` or your NATS server.
2. **Same NATS_URL** – In both `services/Api-Gateway/.env` and `services/hrms/.env` set the same value, e.g. `NATS_URL=nats://localhost:4222`.
3. **HRMS is running** – From `services/hrms` run `npm run start:dev` (or `pnpm run start:dev`). Wait until the app logs that it is listening.
4. Call `GET http://localhost:4000/api/v1/hrms/health` again; it should return 200 with `"service": "HRMS Service"`.  
Health is exposed via the pattern `{ cmd: 'getHrmsHealth' }` handled in `AppController`.

## Message Patterns

These are the main patterns the API Gateway calls over NATS:

| Area | Pattern(s) |
|------|------------|
| **Health** | `{ cmd: 'getHrmsHealth' }` |
| **Auth** | `{ cmd: 'register' }`, `{ cmd: 'verifyEmail' }`, `{ cmd: 'welcomeEmail' }`, `{ cmd: 'uploadProfilePicture' }`, `{ cmd: 'oAuthGoogleLogin' }`, `{ cmd: 'welcomeUserOAuthGoogle' }`, `{ cmd: 'login' }`, `{ cmd: 'refreshToken' }`, `{ cmd: 'logout' }`, `{ cmd: 'logoutAll' }`, `{ cmd: 'currentUser' }`, `{ cmd: 'requestResetPassword' }`, `{ cmd: 'verifyResetCode' }`, `{ cmd: 'resetPassword' }` |
| **Employees** | `'hrms.employees.create'`, `'hrms.employees.findAll'`, `'hrms.employees.getAllEmployeesByUserId'`, `'hrms.employees.findOne'`, `'hrms.employees.update'`, `'hrms.employees.remove'` |
| **Attendance** | `'hrms.attendance.checkin'`, `'hrms.attendance.findAll'`, `'hrms.attendance.findOne'`, `'hrms.attendance.search'` |
| **Payroll** | `'hrms.payroll.create'`, `'hrms.payroll.findAll'`, `'hrms.payroll.search'`, `'hrms.payroll.update'`, `'hrms.payroll.remove'` |
| **Dashboard** | `'hrms.dashboard.get'`, `'hrms.dashboard.totalAttendance'` |
| **Settings** | `{ cmd: 'findOneSetting' }`, `{ cmd: 'updateSetting' }`, `{ cmd: 'deleteSetting' }` |
| **Account** | `{ cmd: 'findAccount' }`, `{ cmd: 'updateAccount' }` |
| **Billing** | `{ cmd: 'getUserBilling' }`, `{ cmd: 'updateUserBilling' }` |

## Structure

- `src/app.module.ts` – Config, Mongo connection, and feature modules
- `src/app.controller.ts` – basic HRMS health pattern
- `src/common/config/*` – configuration and Mongo setup
- `src/auth/` – auth flows, JWT, Google OAuth
- `src/employees/` – employee CRUD and queries
- `src/attendance/` – attendance check‑in, list, and search
- `src/payroll/` – payroll CRUD and search
- `src/dashboard/` – HRMS dashboard statistics
- `src/settings/` – user settings (theme, language, notification preferences)
- `src/account/` – organization/account profile
- `src/billing/` – subscription and billing details

The API Gateway (`services/Api-Gateway`) is responsible for exposing public HTTP routes and translating them into these message patterns.
