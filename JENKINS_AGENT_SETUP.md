# Jenkins Agent Docker Setup Guide

## Problem
The Jenkins agent cannot access the Docker daemon socket because the Jenkins user is not in the `docker` group.

**Error:** `permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock`

## Solution

You need to add the Jenkins user to the `docker` group on the agent machine. Follow the steps below based on your setup.

---

## Option 1: If Jenkins Agent runs on Linux (Recommended)

### Step 1: SSH into the Jenkins agent machine
```bash
ssh your-agent-user@your-agent-ip
```

### Step 2: Find the Docker group GID
```bash
getent group docker
# Output example: docker:x:999:
```

### Step 3: Add Jenkins user to docker group
```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Verify the jenkins user is in the docker group
groups jenkins
# Output should include: jenkins : jenkins docker
```

### Step 4: Apply new group membership (no logout required)
```bash
# Option A: Using newgrp (temporary for current shell)
su - jenkins -c "newgrp docker"

# Option B: Restart Jenkins agent service (persistent)
sudo systemctl restart jenkins
# or if using docker compose:
# docker-compose restart jenkins-agent
# or if using systemd service:
# sudo systemctl restart jenkins-agent
```

### Step 5: Verify Docker access for jenkins user
```bash
# Test as jenkins user
su - jenkins -c "docker ps"

# Should output:
# CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# (no permission error)
```

---

## Option 2: If Jenkins Agent runs in Docker

If the Jenkins agent runs as a Docker container, ensure the container:
1. Mounts the Docker socket
2. Runs with proper permissions

### Update your docker-compose.yml or docker run command:

```yaml
# docker-compose.yml example
services:
  jenkins-agent:
    image: jenkins/agent:latest-jdk11  # or your agent image
    environment:
      JENKINS_URL: http://jenkins:8080
      JENKINS_AGENT_NAME: agent1
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker:ro
    user: "1000:999"  # Match host jenkins user:docker group GID
```

Or with docker run:
```bash
docker run -d \
  --name jenkins-agent \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/bin/docker:/usr/bin/docker:ro \
  -e JENKINS_URL=http://jenkins:8080 \
  -e JENKINS_AGENT_NAME=agent1 \
  jenkins/agent:latest-jdk11
```

---

## Option 3: If Jenkins Agent is Windows-based

Docker for Windows uses named pipes instead of sockets. Ensure:
1. Docker Desktop is running
2. Jenkins service has access to Docker Desktop daemon
3. Consider using Jenkins agent image with Docker-in-Docker capability

---

## Troubleshooting

### Issue: "Permission denied" still appears after setup
- **Cause:** Jenkins service/agent wasn't restarted after adding user to docker group
- **Fix:** Restart Jenkins agent: `sudo systemctl restart jenkins`

### Issue: "Docker command not found"
- **Cause:** Docker binary is not in PATH for jenkins user
- **Fix:** Verify docker is installed: `which docker` and add to jenkins user's PATH if needed

### Issue: Socket permission denied in Docker container
- **Cause:** Container doesn't have proper permissions to socket
- **Fix:** Verify volume mount and user GID match host docker group GID

---

## After Setup Verification

Once setup is complete:

1. **Verify jenkins user can run docker:**
   ```bash
   su - jenkins -c "docker version"
   ```

2. **Restart Jenkins agent:**
   ```bash
   sudo systemctl restart jenkins
   # or restart the docker container
   ```

3. **Trigger a new Jenkins build** — the pipeline should now run Docker commands without permission errors.

---

## Jenkins Pipeline Verification

After agent setup, the Jenkinsfile will execute:
```groovy
stage('Build Frontend Docker Image') {
    steps {
        sh "docker build -t kvcn/frontend-app:latest -f frontend/Dockerfile frontend"
    }
}
```

This should succeed without permission errors.

---

## Quick Setup Script (Linux only)

Run this script on the Jenkins agent machine as root or with sudo:

```bash
#!/bin/bash
set -e

echo "=== Jenkins Agent Docker Setup ==="

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if jenkins user exists
if ! id -u jenkins > /dev/null 2>&1; then
    echo "ERROR: Jenkins user does not exist. Please install Jenkins first."
    exit 1
fi

# Get docker group GID
DOCKER_GID=$(getent group docker | cut -d: -f3)
echo "Docker group GID: $DOCKER_GID"

# Add jenkins to docker group
echo "Adding jenkins user to docker group..."
usermod -aG docker jenkins

# Verify
if groups jenkins | grep -q docker; then
    echo "✓ Jenkins user successfully added to docker group"
else
    echo "✗ Failed to add jenkins to docker group"
    exit 1
fi

# Test docker access
echo "Testing docker access..."
if su - jenkins -c "docker ps" > /dev/null 2>&1; then
    echo "✓ Docker access verified for jenkins user"
else
    echo "⚠ Warning: Docker access test failed (may need service restart)"
fi

echo "=== Setup Complete ==="
echo "Next steps:"
echo "  1. Restart Jenkins agent: sudo systemctl restart jenkins"
echo "  2. Trigger a new build in Jenkins"
```

Save as `setup-jenkins-docker.sh`, then run:
```bash
chmod +x setup-jenkins-docker.sh
sudo ./setup-jenkins-docker.sh
```

---

## Additional Resources

- [Docker Post-installation steps for Linux](https://docs.docker.com/engine/install/linux-postinstall/)
- [Jenkins Agent Configuration](https://www.jenkins.io/doc/book/system-administration/jenkins-agent/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
