# Base image with Node.js and Python
FROM node:20-bullseye-slim

# Install Python 3 for the code execution & tracer engine
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application source code
COPY . .

# Build React frontend bundle into dist/
RUN npm run build

# Expose port
EXPOSE 3001

# Environment variable for port
ENV PORT=3001
ENV NODE_ENV=production

# Start Express server (serves API and static dist/ files)
CMD ["node", "server/index.js"]
