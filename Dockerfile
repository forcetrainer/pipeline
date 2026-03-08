# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build server
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npx tsc

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY --from=server-build /app/server/package.json ./server/
COPY --from=frontend-build /app/dist ./client/dist
EXPOSE 3001
CMD ["node", "server/dist/index.js"]
