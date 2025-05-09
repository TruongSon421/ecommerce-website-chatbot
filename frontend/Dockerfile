# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies as a non-root user
RUN npm ci --quiet && \
    npm cache clean --force

# Copy the rest of the application code
COPY . .

# Fix permissions for the app directory
RUN chown -R node:node /app && \
    chmod -R u+rwX /app

# Switch to non-root user for security
USER node

# Expose port 3000 for Vite dev server
EXPOSE 5173

# Command to run the Vite development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
