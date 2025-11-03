# Home Service Backend API

A robust Node.js backend API built with Express, TypeScript, Supabase, and Drizzle ORM for home service management.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   └── auth/
│   │       └── auth.controller.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/              # API routes
│   │   └── auth.routes.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── jwt.service.ts
│   │   └── supabase.service.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   └── config/
│   │       └── index.ts
│   ├── utils/               # Utility functions
│   │   └── validators.ts
│   ├── db/                  # Database connection
│   │   └── index.ts
│   ├── app.ts               # Express app configuration
│   └── index.ts             # Application entry point
├── drizzle/                 # Database schema and migrations
│   ├── migrations/
│   └── schema.ts
├── package.json
└── .env.example
```

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with Supabase integration
- **Type Safety**: Full TypeScript support with proper type definitions
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Request validation middleware
- **Error Handling**: Centralized error handling
- **Environment Configuration**: Secure environment variable management

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database
- Supabase account

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables in `.env`

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

## 🏃‍♂️ Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## 🌐 Deploying to Render

This repository includes a `render.yaml` blueprint at the repo root that defines a web service for the backend (Root directory: `backend`). If you deploy with the blueprint, Render will:

- Install and build: `npm ci && npm run build`
- Start the server: `npm run start:mem` (which runs `node --max-old-space-size=1024 build/index.js`)
- Health check path: `/`

Important notes:

- Don’t use the dev script (`npm run dev`) in production. It runs `nodemon` + `ts-node`, which watches files and consumes extra memory, leading to crashes on small instances.
- Ensure the following environment variables are set in Render (Render Dashboard → Environment):
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - (Optional) `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- Port binding: the server reads `process.env.PORT` automatically via `config.port`; no need to hard-code a port.

If you created the service manually in the Render dashboard, set:

- Root Directory: `backend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start` (or `npm run start:mem` on low-memory plans)

After saving, trigger a deploy. If you see “No open ports detected,” double-check that the Start Command uses the production build and that required env vars are present.

### Seed an Admin User

The seeding script creates an admin account using environment variables and is idempotent (safe to run multiple times). If the email already exists in Supabase, it will reuse that user and only insert the local record.

```bash
npm run seed:admin
```

Configurable via:

- `ADMIN_EMAIL` (default: `admin@example.com`)
- `ADMIN_PASSWORD` (default: `Admin@123456`)
- `ADMIN_NAME` (default: `Administrator`)

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration (email, password, fullName)
- `POST /api/auth/login` - User login (email, password)
- `POST /api/auth/logout` - User logout (protected)
- `GET /api/auth/profile` - Get user profile (protected)

### Health Check

- `GET /health` - Server health check

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🏗️ Architecture

The project follows a clean, layered architecture:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Middleware**: Handle cross-cutting concerns (auth, validation, errors)
- **Routes**: Define API endpoints
- **Types**: TypeScript type definitions
- **Utils**: Reusable utility functions

## 🔒 Security

- JWT token-based authentication
- Environment variable validation
- Request validation
- Error handling without sensitive data exposure
- CORS configuration

## 📝 Environment Variables

See `.env.example` for required environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
