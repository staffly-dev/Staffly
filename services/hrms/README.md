# HRMS NestJS

Full NestJS port of the Staffly HRMS service. All features from the Express HRMS are implemented.

## Setup

```bash
cd services/hrms-nest
npm install
```

Environment (copy from `services/hrms/.env` or root):

- `PORT` – server port (default 4001)
- `MONGO_URI_RMOTE` or `MONGODB_URI` – MongoDB connection
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`
- `RESEND_API_KEY`, `EMAIL_FROM` – for auth emails
- `CORS_ORIGIN` (optional)

## Run

```bash
npm run start:dev
```

- Base URL: `http://localhost:4001` (or your `PORT`)
- Global prefix: `/hrms`
- Swagger: `GET /hrms/api-docs`

## API (all under `/hrms`)

| Area | Endpoints |
|------|-----------|
| **Health** | `GET /hrms/health` |
| **Auth** | `POST /auth/register`, `POST /auth/verify-email`, `POST /auth/login`, `GET /auth/refresh`, `POST /auth/request-resetPass`, `POST /auth/verify-resetPass-code`, `POST /auth/reset-password`, `POST /auth/logout`, `POST /auth/logout-all`, `POST /auth/verify-token` |
| **Users** | `GET /users/me` (Bearer) |
| **Employees** | `POST /employees/addEmployee`, `GET /employees/getAllEmployees`, `GET /employees/getEmployee/:id`, `PUT /employees/updateEmployee/:id`, `DELETE /employees/deleteEmployee/:id` (Bearer) |
| **Attendance** | `POST /attendance/checkin`, `GET /attendance/getAllAttendance`, `GET /attendance/getAttendance/:id`, `GET /attendance/search?firstName=&lastName=` (Bearer) |
| **Payroll** | `POST /payroll/createPayroll`, `GET /payroll/getAllPayroll`, `GET /payroll/search?firstName=&lastName=`, `PUT /payroll/updatePayroll/:id`, `DELETE /payroll/deletePayroll/:id` (Bearer) |
| **Dashboard** | `GET /dashboard`, `GET /dashboard/total-attendance` (Bearer) |
| **Settings** | `GET /settings`, `PUT /settings`, `PATCH /settings/:section`, `DELETE /settings/reset` (Bearer) |

Protected routes require `Authorization: Bearer <access_token>`.

## Structure

- `src/main.ts` – bootstrap, global prefix `/hrms`, CORS, ValidationPipe, Swagger
- `src/app.module.ts` – Config, Mongoose, Throttler, feature modules
- `src/common/utils/bcrypt.ts` – hashing and device hash
- `src/health/` – health check
- `src/auth/` – auth (JWT access + refresh, email verification, password reset), guards, strategies, DTOs
- `src/users/` – current user (GET /users/me)
- `src/employees/` – employee CRUD
- `src/attendance/` – check-in and attendance list/search
- `src/payroll/` – payroll CRUD and search
- `src/dashboard/` – stats and total attendance
- `src/settings/` – user settings (notifications, appearance, privacy, workspace)

See repo root `REFACTOR-NESTJS.md` for the full NestJS migration plan.
