# Use Node.js image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire project
COPY . .

# Expose the port
EXPOSE 8000

# Start the backend server without nodemon
CMD ["node", "server.js"]
