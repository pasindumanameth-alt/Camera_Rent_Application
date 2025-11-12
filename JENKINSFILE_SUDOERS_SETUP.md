# Jenkinsfile Sudoers Configuration

The updated Jenkinsfile uses `sudo -n docker` for all Docker commands. The `-n` flag means "non-interactive" — it won't prompt for a password and will fail if sudo is not configured for passwordless execution.

## Setup Required on Jenkins Agent

You must configure sudoers to allow the jenkins user to run docker commands without a password.

### Option 1: Quick One-Liner (Recommended)

SSH into the Jenkins agent and run:

```bash
echo "jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker" | sudo tee /etc/sudoers.d/jenkins-docker
```

Then verify it works:
```bash
sudo -n docker ps
```

Expected output: list of containers (or empty if none running), no password prompt.

### Option 2: Manual sudoers Edit

If you prefer to edit sudoers manually:

```bash
sudo visudo
```

Add this line at the end of the file:
```
jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker
```

Save and exit (Ctrl+X, then Y, then Enter if using nano).

### Option 3: Using the sudoers.d Directory (More Secure)

Create a new sudoers file:

```bash
sudo bash -c 'cat > /etc/sudoers.d/jenkins-docker << EOF
jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker
EOF'

# Set correct permissions
sudo chmod 0440 /etc/sudoers.d/jenkins-docker
```

### Option 4: For Docker in Docker Container

If Jenkins agent runs in a Docker container, add to your docker-compose.yml:

```yaml
services:
  jenkins-agent:
    image: jenkins/agent:latest
    user: "1000:1000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker:ro
    environment:
      - JENKINS_URL=http://jenkins:8080
      - JENKINS_AGENT_NAME=agent1
```

And run this setup command on the host:
```bash
sudo bash -c 'cat > /etc/sudoers.d/jenkins-docker << EOF
jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker
EOF'
```

## Verification

After any of the above setup methods, verify it works:

```bash
# Test as jenkins user
su - jenkins -c "sudo -n docker ps"

# Should output containers without prompting for password
```

## After Setup

1. Restart Jenkins agent: `sudo systemctl restart jenkins`
2. Trigger a new build in Jenkins
3. The pipeline should now proceed past the Docker permission error

## Troubleshooting

### Error: "sudo: a password is required"
- **Cause:** sudoers not properly configured for NOPASSWD
- **Fix:** Verify the line exists: `sudo grep jenkins /etc/sudoers.d/jenkins-docker`

### Error: "sudo: /usr/bin/docker: command not found"
- **Cause:** Docker binary not at `/usr/bin/docker`
- **Fix:** Find docker: `which docker` and update the sudoers line with the correct path

### Error: "visudo: command not found"
- **Cause:** Rare, but visudo not available
- **Fix:** Use echo method instead: `echo "jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker" | sudo tee /etc/sudoers.d/jenkins-docker`

---

## Summary

The Jenkinsfile now uses `sudo -n docker` for all Docker operations. You need to:

1. SSH into Jenkins agent
2. Run: `echo "jenkins ALL=(ALL) NOPASSWD: /usr/bin/docker" | sudo tee /etc/sudoers.d/jenkins-docker`
3. Restart Jenkins: `sudo systemctl restart jenkins`
4. Trigger new build

Then the pipeline will successfully build and push Docker images.
