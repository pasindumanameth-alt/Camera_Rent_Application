# Jenkins SSH Credentials Setup Guide

## Private Key Generated

Your EC2 SSH private key has been extracted from Terraform state and saved to:
📁 **`terraform/deploy_key.pem`**

This key corresponds to the public key deployed to your EC2 instance at: **13.53.37.159**

---

## Adding SSH Credentials to Jenkins

### Step 1: Access Jenkins Credentials
1. Open Jenkins in your browser: `http://localhost:8080` (or your Jenkins URL)
2. Navigate to: **Manage Jenkins** → **Credentials**
3. Click on **(global)** under "Stores scoped to Jenkins"
4. Click **Add Credentials** button

### Step 2: Configure SSH Credential

Fill in the form with the following details:

| Field | Value |
|-------|-------|
| **Kind** | `SSH Username with private key` |
| **Scope** | `Global (Jenkins, nodes, items, all child items, etc)` |
| **ID** | `ec2-ssh-key` |
| **Description** | `EC2 Deploy Key for Camera Rent Application` |
| **Username** | `ubuntu` |
| **Private Key** | Select **"Enter directly"** |

### Step 3: Add the Private Key

1. Click the **Add** button next to "Private Key"
2. Open the file: `terraform/deploy_key.pem`
3. Copy the entire contents (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
4. Paste into the text area in Jenkins

**The key should look like this:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIJKQIBAAKCAgEA4HtZkLQVZkasoEiqfnpYyPhKZVc/482CLiUyObxxKPkdYB9l
...
(many lines)
...
aV/UXKHELbmPAsfapRTyJPcUVDZNBl8ncEa+agxBMEDDBbKs9ZBnt1R08/tL
-----END RSA PRIVATE KEY-----
```

5. Click **Create** to save the credential

---

## Verification

### Your Jenkinsfile Configuration
The deployment stage is already configured to use these credentials:

```groovy
environment {
    EC2_USER = "ubuntu"
    EC2_IP   = "13.53.37.159"
}

stage('Deploy on EC2 Server') {
    withCredentials([sshUserPrivateKey(
        credentialsId: 'ec2-ssh-key',
        keyFileVariable: 'SSH_KEY',
        usernameVariable: 'SSH_USER'
    )]) {
        // SSH deployment commands
    }
}
```

### Test SSH Connection (Optional)

From WSL/Linux terminal, verify the key works:

```bash
chmod 600 terraform/deploy_key.pem
ssh -i terraform/deploy_key.pem ubuntu@13.53.37.159
```

If successful, you'll connect to the EC2 instance.

---

## Security Notes

⚠️ **Important:**
- Keep `deploy_key.pem` secure and do NOT commit to Git
- The key is also stored in Jenkins encrypted credentials
- Consider adding to `.gitignore`:
  ```
  terraform/deploy_key.pem
  terraform/*.tfstate*
  ```

---

## Troubleshooting

### Permission Denied Error
If Jenkins shows permission denied:
- Verify the credential ID is exactly `ec2-ssh-key`
- Ensure the entire private key was copied including headers/footers
- Check the EC2 security group allows SSH (port 22) from Jenkins server

### Wrong Key Error
If you see "Server refused our key":
- Verify EC2 instance is using the key pair `devops-deploy-key`
- Run `terraform output` to confirm it matches

### Can't Find Credentials
If Jenkins can't find `ec2-ssh-key`:
- Ensure credentials are in **(global)** scope, not folder-scoped
- The credential ID must exactly match (case-sensitive)

---

## Next Steps

After adding credentials:
1. ✅ Verify EC2 IP is correct: `13.53.37.159`
2. ✅ Run Jenkins pipeline build
3. ✅ Monitor deployment stage logs
4. ✅ Access application at `http://13.53.37.159`

---

**Generated:** February 15, 2026  
**Terraform State:** terraform.tfstate (serial: 8)
