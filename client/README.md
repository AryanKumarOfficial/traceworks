# TraceWorks Client

Next.js frontend application for TraceWorks.

## Description

A modern web application built with [Next.js](https://nextjs.org/) 15, React, and TypeScript, featuring server-side rendering and optimized performance.

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Running backend server (see [../server/README.md](../server/README.md))

## Installation

```bash
pnpm install
```

## Environment Setup

Create a `.env.local` file in the client directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL
  - Development: `http://localhost:5000`
  - Production: Your deployed backend URL

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Running the Application

### Development Mode

```bash
pnpm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
pnpm run build

# Start the production server
pnpm run start
```

### Linting

```bash
pnpm run lint
```

## Docker

### Build and Run with Docker

```bash
# Build the image
docker build -t traceworks-client .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  traceworks-client
```

### Using Docker Compose

From the root directory:
```bash
docker-compose up client
```

## Features

- ⚡ Next.js 15 with App Router
- 🎨 Modern UI with Geist font family
- 🔐 Authentication integration
- 📱 Responsive design
- 🚀 Optimized performance
- 🔄 Hot module replacement in development

## Project Structure

```
client/
├── app/                # Next.js app directory
│   ├── page.tsx       # Home page
│   ├── layout.tsx     # Root layout
│   └── ...            # Other pages and routes
├── components/         # React components
├── lib/               # Utility functions
├── public/            # Static assets
├── styles/            # Global styles
├── Dockerfile         # Docker configuration
└── next.config.js     # Next.js configuration
```

## Development Guidelines

### File Structure

- Place page components in `app/` directory following the App Router conventions
- Reusable components go in `components/`
- Utility functions in `lib/`
- Static assets in `public/`

### Routing

Next.js uses file-based routing. Create new routes by adding folders and files in the `app/` directory:

```
app/
├── page.tsx              # /
├── about/
│   └── page.tsx         # /about
└── dashboard/
    └── page.tsx         # /dashboard
```

### API Integration

Use the `NEXT_PUBLIC_API_URL` environment variable for API calls:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const response = await fetch(`${API_URL}/api/endpoint`);
```

## Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint to check code quality

## Styling

This project uses:
- CSS Modules for component-specific styles
- Global styles in `styles/` directory
- Geist font family for optimal typography

## Performance Optimization

The application includes:
- Automatic code splitting
- Optimized image loading with `next/image`
- Font optimization with `next/font`
- Server-side rendering (SSR)
- Static site generation (SSG) where applicable

## Troubleshooting

### Port Already in Use

Change the port by setting the `PORT` environment variable:
```bash
PORT=3001 pnpm run dev
```

### API Connection Issues

1. Verify the backend server is running at the URL specified in `NEXT_PUBLIC_API_URL`
2. Check for CORS configuration on the backend
3. Ensure the URL in `.env.local` is correct

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Rebuild
pnpm run build
```

### Docker Build Issues

```bash
# Clean Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t traceworks-client .
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [React Documentation](https://react.dev) - React library
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript language
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying) - Deployment guide

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

### Other Platforms

- Docker: Use the included Dockerfile
- Static hosting: Run `pnpm run build` and deploy the `out/` directory
- Node.js hosting: Deploy with `pnpm run build && pnpm run start`

## License

[MIT licensed](../LICENSE)
