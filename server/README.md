# TraceWorks Server

NestJS backend API with PostgreSQL database and JWT authentication.

## Description

A RESTful API built with [NestJS](https://nestjs.com/) framework using TypeScript, PostgreSQL for data persistence, and JWT for authentication.

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- PostgreSQL 15 (or use Docker)

## Installation

```bash
pnpm install
```

## Environment Setup

1. Create a `.env` file in the server directory:
   ```bash
   cp .env.example .env
   ```

2. Update the environment variables:
   ```env
   DATABASE_URL=postgres://app:secret@localhost:5432/appdb
   JWT_SECRET=your_super_secret_jwt_key
   ACCESS_TOKEN_EXP=900
   REFRESH_TOKEN_EXP=604800
   NODE_ENV=development
   PORT=5000
   MIGRATIONS_PATH="path/to/migrations/init.sql"
   ```

### Environment Variables Explained

- `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgres://username:password@host:port/database`
- `JWT_SECRET` - Secret key for signing JWT tokens (change in production!)
- `ACCESS_TOKEN_EXP` - Access token expiration (900 seconds = 15 minutes)
- `REFRESH_TOKEN_EXP` - Refresh token expiration (604800 seconds = 7 days)
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Port number for the server
- `MIGRATIONS_PATH` - Path to database migration files

## Database Setup

### Using Docker

```bash
docker run -d \
  --name traceworks-db \
  -e POSTGRES_USER=app \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 \
  postgres:15
```

### Manual PostgreSQL Setup

1. Install PostgreSQL 15
2. Create a database:
   ```sql
   CREATE DATABASE appdb;
   CREATE USER app WITH PASSWORD 'secret';
   GRANT ALL PRIVILEGES ON DATABASE appdb TO app;
   ```

## Running the Application

### Development Mode
```bash
# with hot reload
pnpm run start:dev
```

### Production Mode
```bash
# build the application
pnpm run build

# run in production
pnpm run start:prod
```

### Standard Mode
```bash
pnpm run start
```

## Testing

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# test coverage
pnpm run test:cov
```

## Docker

### Build and Run with Docker

```bash
# Build the image
docker build -t traceworks-server .

# Run the container
docker run -p 5000:5000 \
  -e DATABASE_URL=postgres://app:secret@host.docker.internal:5432/appdb \
  -e JWT_SECRET=supersecret \
  traceworks-server
```

### Using Docker Compose

From the root directory:
```bash
docker-compose up server
```

## API Documentation

Once the server is running, you can access:

- API Base URL: http://localhost:5000
- Health Check: http://localhost:5000/health (if implemented)

## Project Structure

```
server/
├── src/
│   ├── auth/           # Authentication module
│   ├── users/          # Users module
│   ├── common/         # Shared utilities
│   ├── config/         # Configuration files
│   ├── database/       # Database configuration
│   └── main.ts         # Application entry point
├── migrations/         # Database migrations
├── test/              # Test files
├── Dockerfile         # Docker configuration
└── .env.example       # Environment variables template
```

## Available Scripts

- `pnpm run start` - Start the application
- `pnpm run start:dev` - Start in development mode with hot reload
- `pnpm run start:prod` - Start in production mode
- `pnpm run build` - Build the application
- `pnpm run format` - Format code with Prettier
- `pnpm run lint` - Lint code with ESLint
- `pnpm run test` - Run unit tests
- `pnpm run test:e2e` - Run end-to-end tests
- `pnpm run test:cov` - Run tests with coverage

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   docker ps  # if using Docker
   ```

2. Check connection string in `.env`

3. Test connection:
   ```bash
   psql -h localhost -U app -d appdb
   ```

### Port Already in Use

Change the PORT in `.env` or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

### Migration Issues

Ensure the `MIGRATIONS_PATH` in `.env` points to the correct SQL file.

## Security Notes

- Always change `JWT_SECRET` in production
- Use strong database passwords
- Never commit `.env` files to version control
- Use environment-specific configurations

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## License

[MIT licensed](../LICENSE)
