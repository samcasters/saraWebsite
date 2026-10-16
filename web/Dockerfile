# Optional image build. On this Pi the cluster uses nginx:1.27-alpine
# and mounts web/dist plus content/photos as Volumes.
FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /src/dist /usr/share/nginx/html
