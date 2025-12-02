# Étape 1 : Build React
FROM node:22-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine
# Copie du site compilé
COPY --from=build /app/dist /usr/share/nginx/html

# 👇 COPIE DE LA CONFIG NGINX PERSONNALISÉE
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]