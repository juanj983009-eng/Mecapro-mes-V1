# ================================================================
# Meca-PRO Web — Multi-stage Dockerfile
# Stage 1: Node.js build
# Stage 2: nginx runtime
# ================================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar package files primero para cache de dependencias
COPY package*.json ./
# CAMBIO SENIOR: Reemplazamos 'npm ci' por 'npm install' con tolerancia de dependencias antiguas
RUN npm install --silent --legacy-peer-deps

# Build de producción
COPY . .
RUN REACT_APP_API_URL=/api npm run build

# --- Stage 2: nginx ---
FROM nginx:alpine AS runtime

# Copiar configuración nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build de React
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]