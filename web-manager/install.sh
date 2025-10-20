#!/bin/bash
# Installation script for ARK Server Web Manager

set -e

echo "=== ARK Server Web Manager Installation ==="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js 22.x or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "Error: Node.js version 22.x or higher is required."
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

echo "✓ pnpm $(pnpm -v) detected"

# Check if arkmanager is installed
if ! command -v arkmanager &> /dev/null; then
    echo "Warning: arkmanager is not installed or not in PATH."
    echo "The web interface requires arkmanager to be installed."
    echo "Please install arkmanager first: https://github.com/arkmanager/ark-server-tools"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ arkmanager detected"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
pnpm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Database configuration
DATABASE_URL=mysql://user:password@localhost:3306/ark_web_manager

# JWT Secret (change this to a random string)
JWT_SECRET=change-this-to-a-random-secret-string

# OAuth configuration (for Manus OAuth)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=
OWNER_NAME=

# App branding
VITE_APP_TITLE=ARK Server Web Manager
VITE_APP_LOGO=/logo.png

# Built-in APIs (optional)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
EOF
    echo "✓ .env file created"
    echo ""
    echo "IMPORTANT: Please edit .env file and configure your database and OAuth settings."
    echo "You need to:"
    echo "  1. Set up a MySQL/TiDB database"
    echo "  2. Update DATABASE_URL with your database credentials"
    echo "  3. Change JWT_SECRET to a random string"
    echo "  4. Configure OAuth settings if using Manus OAuth"
    echo ""
    read -p "Press Enter to continue after configuring .env..."
fi

# Initialize database
echo ""
echo "Initializing database..."
if pnpm db:push; then
    echo "✓ Database initialized successfully"
else
    echo "Error: Failed to initialize database"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Create systemd service file
echo ""
read -p "Do you want to create a systemd service? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    SERVICE_USER=$(whoami)
    INSTALL_DIR=$(pwd)
    
    sudo tee /etc/systemd/system/ark-web-manager.service > /dev/null << EOF
[Unit]
Description=ARK Server Web Manager
After=network.target mysql.service

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=$(which pnpm) start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable ark-web-manager
    
    echo "✓ Systemd service created"
    echo ""
    echo "You can now:"
    echo "  - Start the service: sudo systemctl start ark-web-manager"
    echo "  - Check status: sudo systemctl status ark-web-manager"
    echo "  - View logs: sudo journalctl -u ark-web-manager -f"
fi

echo ""
echo "=== Installation Complete ==="
echo ""
echo "To start the development server:"
echo "  pnpm dev"
echo ""
echo "To build for production:"
echo "  pnpm build"
echo "  pnpm start"
echo ""
echo "The web interface will be available at http://localhost:3000"
echo ""
echo "For more information, see README.md"

