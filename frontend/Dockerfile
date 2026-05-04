# Use an official Node runtime as a parent image
FROM node:18-slim

# Set work directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project
COPY . .

# Build for production
RUN npm run build

# Use a lightweight server to serve the static files
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]
