# ==========================
# Backend API - Base
# ==========================

# ---------- Build stage ----------
FROM node:20-alpine AS build

WORKDIR /app

# Copiar manifestos del proyecto
COPY package*.json ./

# Instalar dependencias (condicional para dev o prod)
# Si el entorno es prod, omitimos dependencias de desarrollo
ARG NODE_ENV=production
RUN npm install --omit=dev # Solo las de producción
RUN [ "$NODE_ENV" = "production" ] || npm install # Vuelve a instalar si estamos en dev para incluir devDependencies

# Copiamos el código fuente
COPY src ./src
COPY test ./test


# ---------- Runtime stage ----------
FROM node:20-alpine

WORKDIR /app

# Copiamos la app ya construida
COPY --from=build /app ./

# Establecer variables de entorno por defecto
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ENV PORT=3000

# Exponer el puerto (ajustable con Docker Compose)
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

# Comando por defecto para iniciar el servidor
CMD ["node", "src/server.js"]