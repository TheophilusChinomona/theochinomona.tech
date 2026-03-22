# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Build args for Vite env vars (with fallback to runtime env for flexibility)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
# Convert build args to environment variables for Vite
# Use build args if provided, otherwise fallback to runtime env (for local development)
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-""}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-""}

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
