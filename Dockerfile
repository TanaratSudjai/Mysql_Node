# Use the official Node.js image from Docker Hub
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port that your application will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
