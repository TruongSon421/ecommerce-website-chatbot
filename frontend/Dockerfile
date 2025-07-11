# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --quiet && \
    npm cache clean --force

# Create app directory with proper permissions
RUN mkdir -p /app && chown -R node:node /app

# Switch to non-root user
USER node

# Expose port 5173
EXPOSE 5173

# Command to run the Vite development server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]