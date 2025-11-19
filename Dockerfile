# === Build Frontend ===
FROM node:18 AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build


# === Backend + Copy Frontend Build ===
FROM node:18
WORKDIR /app

# Install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source
COPY backend ./backend

# Copy frontend/dist → backend/public
COPY --from=build-frontend /app/frontend/dist ./backend/public

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["node", "backend/index.js"]
