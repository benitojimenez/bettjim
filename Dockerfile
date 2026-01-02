# Usamos Node Alpine (versión ligera igual que tu entorno)
FROM node:22-alpine

WORKDIR /app

# 1. COPIAMOS LOS ARTIFACTOS YA COMPILADOS
# GitHub Actions ya creó la carpeta 'dist', aquí solo la metemos a la imagen.
# La estructura quedará: /app/dist/bettjim
COPY dist/bettjim ./dist/bettjim

# 2. Copiamos package.json para instalar las dependencias del servidor SSR
COPY package*.json ./

# 3. Instalamos solo dependencias de producción (ahorra espacio y tiempo)
RUN npm install --omit=dev

# 4. Configuración de red
# IMPORTANTE: Asegúrate de que en tu código (server.mjs) el puerto sea 4200 o use process.env.PORT
ENV PORT=4200
EXPOSE 4200

# 5. Arrancamos el servidor SSR
CMD ["node", "dist/bettjim/server/server.mjs"]