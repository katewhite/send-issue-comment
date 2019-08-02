# Use the latest version of Node.js
#
# You may prefer the full image:
# FROM node
#
# or even an alpine image (a smaller, faster, less-feature-complete image):
# FROM node:alpine
#
# You can specify a version:
# FROM node:10-slim
FROM node:alpine

# Labels for GitHub to read your action
LABEL "maintainer"="Alex Page <alex@alexpage.com.au>"
LABEL "repository"="https://github.com/alex-page/move-assigned-issue-column"
LABEL "homepage"="https://github.com/alex-page/move-assigned-issue-column"

LABEL "com.github.actions.name"="Move assigned issues column"
LABEL "com.github.actions.description"="✨ Magically move assigned issues to a column."

LABEL "com.github.actions.icon"="move"
LABEL "com.github.actions.color"="green"

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci
RUN npm install axios

# Copy the rest of your action's code
COPY . .

# Run `node /index.js`
ENTRYPOINT ["node", "/index.js"]
