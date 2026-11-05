FROM node:20-alpine
WORKDIR /app

# Copy package files first so Docker caches the install step
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "index.js"]