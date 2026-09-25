# Base image with Node.js and Python
FROM node:20-bullseye-slim

# Fix Debian slim missing man1 directory, then install Python 3, C/C++ compilers, and OpenJDK
RUN mkdir -p /usr/share/man/man1 && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    build-essential \
    default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

# Set JAVA_HOME and ensure java/javac are on PATH
ENV JAVA_HOME=/usr/lib/jvm/default-java
ENV PATH="${JAVA_HOME}/bin:${PATH}"

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
