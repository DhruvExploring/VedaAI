# Stage 1: Build the backend
FROM node:20-alpine AS backend-builder
WORKDIR /usr/src/app/backend

# Copy backend dependencies configuration
COPY backend/package.json ./
RUN npm install

# Copy source code and config
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Build compiled JavaScript
RUN npm run build

# Prune development dependencies to keep only production modules
RUN npm prune --production

# Stage 2: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /usr/src/app/frontend

# Copy frontend dependencies configuration
COPY frontend/package.json ./
RUN npm install

# Copy build-time arguments for Next.js env variables
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Copy source code and configs
COPY frontend/tsconfig.json frontend/next.config.js frontend/postcss.config.js frontend/tailwind.config.js ./
COPY frontend/public ./public
COPY frontend/src ./src

# Build production Next.js application
RUN npm run build

# Prune development dependencies
RUN npm prune --production

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Install PM2 globally for production process management
RUN npm install -g pm2

# Create directories for services
RUN mkdir -p backend frontend

# Copy compiled backend and its production dependencies
COPY --from=backend-builder /usr/src/app/backend/dist ./backend/dist
COPY --from=backend-builder /usr/src/app/backend/package.json ./backend/package.json
COPY --from=backend-builder /usr/src/app/backend/node_modules ./backend/node_modules

# Copy built frontend and its production dependencies
COPY --from=frontend-builder /usr/src/app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /usr/src/app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /usr/src/app/frontend/next.config.js ./frontend/next.config.js
COPY --from=frontend-builder /usr/src/app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /usr/src/app/frontend/public ./frontend/public

# Copy process orchestrator configuration
COPY pm2.config.js ./

# Define production ports
EXPOSE 3000 4000

# Start Express server, BullMQ worker, and Next.js frontend with PM2
CMD ["pm2-runtime", "pm2.config.js"]
