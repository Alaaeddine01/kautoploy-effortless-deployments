# Étape 1 : Build React
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# ⚠️ IMPORTANT : L'URL du backend doit être connue au build
ENV VITE_API_URL=https://api.kautoploy.com/api/v1
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine
# Copier les fichiers buildés vers Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Config pour le routing React (SPA)
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]