# Optional image build. The cluster on this Pi runs node:22-alpine
# and mounts this folder as a Volume, so a second image build is not required.
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY server.js validate.js ./
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "server.js"]
