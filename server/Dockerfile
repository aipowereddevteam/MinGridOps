# Stage 1: Install Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Build Application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production Security Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# Copy compiled dist from builder
COPY --from=builder --chown=node:node /app/dist ./dist

# Non-root security user
USER node

EXPOSE 5000

CMD ["node", "dist/main.js"]
