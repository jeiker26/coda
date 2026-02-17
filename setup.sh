#!/bin/bash

# Coda Setup Script

echo "Coda - Setup Script"
echo "========================="
echo ""

# Check for Rust
if ! command -v rustc &> /dev/null; then
    echo "Rust is not installed. Installing via rustup..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

echo "Rust version: $(rustc --version)"
echo "Cargo version: $(cargo --version)"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install Tauri CLI
echo ""
echo "Installing Tauri CLI..."
cargo install tauri-cli

# Install dependencies
echo ""
echo "Installing project dependencies..."
npm install

echo ""
echo "Installing runner dependencies..."
cd tools/runner && npm install && cd ../..

# Create .env file for runner if not exists
if [ ! -f "tools/runner/.env" ]; then
    echo ""
    echo "Creating runner .env file..."
    cp tools/runner/.env.example tools/runner/.env
    echo "Please edit tools/runner/.env with your API keys"
fi

echo ""
echo "========================="
echo "Setup complete!"
echo ""
echo "To start development:"
echo "  1. Terminal 1: cd tools/runner && npm run dev"
echo "  2. Terminal 2: npm run tauri dev"
echo ""
echo "Or to just test the frontend:"
echo "  npm run dev"
echo ""
