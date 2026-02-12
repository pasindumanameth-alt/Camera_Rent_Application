## Deploying (Terraform + single EC2 + Jenkins)

Overview
- This deploys a single EC2 instance (t2.micro) that runs your Dockerized app and Jenkins for CI/CD. Changes pushed to GitHub will trigger Jenkins to re-deploy.

Prerequisites
- **AWS credentials**: configure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (or use `aws configure`).
- **Terraform** installed locally (>= 1.0 recommended).
- You must provide your repository HTTPS URL (e.g. https://github.com/you/repo.git).

How to run
1. Open a shell in the repository root.
2. Initialize Terraform:

```bash
cd terraform
terraform init
```

3. Apply Terraform (example with vars):

```bash
terraform apply -var="repo_url=https://github.com/yourusername/yourrepo.git" -var='github_branch=main' -auto-approve
```

4. After apply completes, Terraform will write `deploy_key.pem` to `terraform/deploy_key.pem` and output the public IP. Secure this file.

SSH to instance (optional)

```bash
chmod 600 terraform/deploy_key.pem
ssh -i terraform/deploy_key.pem ubuntu@<INSTANCE_PUBLIC_IP>
```

Access Jenkins
- Open http://<INSTANCE_PUBLIC_IP>:8080 in your browser.
- The initial admin password is printed to cloud-init logs and created by the bootstrap script at `/var/lib/jenkins/secrets/initialAdminPassword` — you can also view it by SSHing into the instance and `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`.

Configure Jenkins
1. Install suggested plugins and create the first admin user.
2. Create a new Pipeline job (or Multibranch Pipeline) that checks out your repository.
   - If using a Pipeline job, set `Pipeline script from SCM` and point to this repository and branch. Jenkins will use the `Jenkinsfile` we added.

Configure GitHub Webhook
1. In your GitHub repo, go to Settings -> Webhooks -> Add webhook.
2. Payload URL: `http://<INSTANCE_PUBLIC_IP>:8080/github-webhook/`
3. Content type: `application/json`.
4. Select `Just the push event`.

Notes and troubleshooting
- The `bootstrap.sh` installs Docker, docker-compose, Jenkins, clones the repo and starts `docker-compose up -d` automatically on first boot.
- Jenkins runs on the instance and has access to Docker (the `jenkins` user is added to `docker` group). If pipeline commands fail, check permissions or run commands over SSH manually.
- This setup is minimal for university/learning usage. For production, separate concerns (CI host vs app host), use IAM users, HTTPS, proper secrets handling, and avoid running Jenkins as root.

If you want, I can now:
- Run a quick walkthrough of running Terraform from your machine (tell me if you have AWS creds configured). 
- Or change user_data to enable HTTPS / domain.
