# Usamos Node Alpine (versión ligera)
FROM node:22.12.0-alpine

# Establecemos el directorio de trabajo
WORKDIR /app

# 1. Copiamos package.json primero (Buena práctica de caché de Docker)
COPY package*.json ./

# 2. Instalamos solo dependencias de producción
RUN npm install --omit=dev

# 3. COPIAMOS EL CONTENIDO DIRECTO
# Al poner ./ estamos volcando 'browser' y 'server' directamente en /app
COPY dist/bettjim ./

# 4. Configuración de red
ENV PORT=4200
EXPOSE 4200

# 5. Arrancamos el servidor SSR
# Como volcamos todo en /app, ahora la ruta es mucho más directa y limpia
CMD ["node", "server/server.mjs"]