# Usamos Node Alpine
FROM node:22.12.0-alpine

# 1. Establecemos la raíz para instalar dependencias
WORKDIR /app

# 2. Copiamos package.json e instalamos
COPY package*.json ./
RUN npm install --omit=dev

# 3. Copiamos tu carpeta dist tal como la escupe GitHub Actions
COPY dist/bettjim ./dist/bettjim

# ==========================================
# 🔥 EL TRUCO MÁGICO 🔥
# Cambiamos el directorio de trabajo JUSTO a donde están tus carpetas
# 'browser' y 'server'. Así Angular cree que está corriendo localmente.
# Node.js es inteligente y buscará los 'node_modules' una carpeta más arriba (/app)
# ==========================================
WORKDIR /app/dist/bettjim

# 4. Configuración de red
ENV PORT=4200
EXPOSE 4200

# 5. Arrancamos el servidor (ahora sin rutas largas, directo al archivo)
CMD ["node", "server/server.mjs"]