#!/bin/bash
# Quick setup script for Jenkins agent Docker socket access
# Run this script as root or with sudo on the Jenkins agent machine

set -e

echo "=== Jenkins Agent Docker Setup ==="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "ERROR: This script must be run as root (use sudo)"
   exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed on this machine."
    echo "Please install Docker first: https://docs.docker.com/engine/install/"
    exit 1
fi

echo "✓ Docker is installed"

# Check if jenkins user exists
if ! id -u jenkins > /dev/null 2>&1; then
    echo "ERROR: Jenkins user does not exist."
    echo "Please install Jenkins first or verify the jenkins user name."
    exit 1
fi

echo "✓ Jenkins user exists"

# Get docker group info
if ! getent group docker > /dev/null 2>&1; then
    echo "ERROR: Docker group does not exist."
    echo "Run: sudo groupadd docker"
    exit 1
fi

DOCKER_GID=$(getent group docker | cut -d: -f3)
echo "✓ Docker group found (GID: $DOCKER_GID)"
echo ""

# Add jenkins to docker group
echo "Adding jenkins user to docker group..."
usermod -aG docker jenkins
echo "✓ Jenkins user added to docker group"

# Verify membership
echo ""
echo "Verifying group membership..."
if groups jenkins | grep -q docker; then
    echo "✓ Jenkins is now a member of the docker group"
else
    echo "✗ ERROR: Failed to add jenkins to docker group"
    exit 1
fi

# Test docker access
echo ""
echo "Testing Docker access for jenkins user..."
if su - jenkins -c "docker ps" > /dev/null 2>&1; then
    echo "✓ Docker access test PASSED"
else
    echo "⚠ Warning: Docker access test failed"
    echo "  This may be normal - restart Jenkins and try again"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Restart Jenkins agent service:"
echo "     sudo systemctl restart jenkins"
echo "  2. Or if using Docker Compose:"
echo "     docker-compose restart jenkins-agent"
echo "  3. Trigger a new build in Jenkins"
echo ""
