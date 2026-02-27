# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copiamos solo package.json y lock
COPY package*.json ./

# Instalamos dependencias
RUN npm ci

# Copiamos solo el código fuente, NO todo el proyecto
COPY index.js ./

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app

# Copiamos solo node_modules y el código
COPY --from=builder /app .

EXPOSE 3000
CMD ["node", "index.js"]
