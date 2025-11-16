# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all backend code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables (optional defaults, can override in deployment)
ENV PORT=5000

# Start server
CMD ["node", "server.js"]
