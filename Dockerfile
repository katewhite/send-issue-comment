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
LABEL "maintainer"="Kate White <kate@customer.io>"
LABEL "repository"="https://github.com/katewhite/send-issue-comment"
LABEL "homepage"="https://github.com/katewhite/send-issue-comment"

LABEL "com.github.actions.name"="Send issue comment to Zapier"
LABEL "com.github.actions.description"="Check every issue comment for '+1' or 'feature request' label, parse HS ticket if it exists, and send all relevant information to Zapier. Right now, this is being used to then create a note in productboard."

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
