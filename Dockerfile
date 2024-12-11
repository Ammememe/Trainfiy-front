# Stage 1: Build the application
FROM node:18 as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the application
FROM node:18

WORKDIR /app

# Copy the build files from the previous stage
COPY --from=builder /app/build .

# Install a lightweight HTTP server
RUN npm install -g serve

EXPOSE 80

# Serve the application
CMD ["serve", "-s", ".", "-l", "80"]
