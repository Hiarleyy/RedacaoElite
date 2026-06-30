FROM node:20

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (including devDependencies like prisma for generating client)
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 3000

# Run migrations, seed database (idempotent), and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node src/server.js"]
