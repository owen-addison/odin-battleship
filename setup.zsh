#!/usr/bin/env zsh

echo "Initialising new npm project"

# Initialise a new npm project
npm init --yes || { echo "Failed to initialize npm project"; exit 1; }

echo "Setting up configuration files"

# Copy the .eslintrc.json file to the current directory
cp /Users/owen/Documents/VSCode-preferences_settings/START_.eslintrc.json ./.eslintrc.json

# Copy the .gitignore file to the current directory
cp /Users/owen/Documents/VSCode-preferences_settings/START_.gitignore ./.gitignore

# Copy the .prettierignore file to the current directory
cp /Users/owen/Documents/VSCode-preferences_settings/START_.prettierignore ./.prettierignore

echo "Installing dependencies and plugins"

# Install Webpack dependency
npm install webpack webpack-cli --save-dev

# Install ESLint dependency
npm install eslint --save-dev

# Install Prettier locally
npm install --save-dev --save-exact prettier

# Create empty config file for Prettier
node --eval "fs.writeFileSync('.prettierrc','{}\n')"

# Install ESLint plugins for "airbnb-base" and "prettier"
npm install eslint-config-airbnb-base eslint-plugin-import eslint-config-prettier --save-dev

echo "Project setup completed successfully!!"
