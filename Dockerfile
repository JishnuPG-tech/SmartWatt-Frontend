# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies only when package.json changes
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
