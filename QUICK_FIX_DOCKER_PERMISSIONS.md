# Quick Fix: Run This Now on Jenkins Agent

The build is still failing because the jenkins user cannot access Docker. You must run the setup on the agent machine.

## Quick Commands (Copy & Paste)

SSH into your Jenkins agent machine and run these commands:

```bash
# 1. Add jenkins user to docker group
sudo usermod -aG docker jenkins

# 2. Verify it worked
groups jenkins

# 3. Test docker access as jenkins user
su - jenkins -c "docker ps"

# 4. Restart Jenkins agent
sudo systemctl restart jenkins
```

**Expected output from step 2:**
```
jenkins : jenkins docker
```

**Expected output from step 3:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
(empty or list of containers - no permission error)
```

## If using Docker Compose for Jenkins Agent

Instead of SSH, update your `docker-compose.yml`:

```yaml
services:
  jenkins-agent:
    image: jenkins/agent:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker:ro
    user: "1000:999"  # Adjust GID to match docker group on host
```

Then restart:
```bash
docker-compose restart jenkins-agent
```

## After Setup

1. Restart Jenkins agent (see commands above)
2. Go back to Jenkins and **trigger a new build**
3. The build should now proceed past the Docker permission error

## Full Documentation

See `JENKINS_AGENT_SETUP.md` in the repo root for complete setup details, troubleshooting, and alternative options.

---

**Status:** Setup script is committed to repo and ready — you just need to execute it on the agent machine.
