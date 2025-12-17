FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma
RUN npx prisma generate

# Copy application
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
