# --- Stage 1: The Builder ---
# This stage installs all dependencies and builds your Next.js app
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including devDependencies for the build)
RUN pnpm install --no-prod

# Copy all remaining source code
COPY . .

# Run the build (this runs 'next build')
RUN pnpm run build


# --- Stage 2: The Runner ---
# This is the final, small image that runs the app
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install ONLY production dependencies
RUN pnpm install --prod

# Copy the built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Expose the default Next.js port
EXPOSE 3000

# Set the default port env variable
ENV PORT 3000

# Start the server (this runs 'next start')
CMD ["pnpm", "start"]