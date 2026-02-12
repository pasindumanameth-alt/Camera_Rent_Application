variable "aws_region" {
  description = "AWS region to create resources in"
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "repo_url" {
  description = "GitHub repository URL (HTTPS) to deploy from"
  type        = string
}

variable "github_branch" {
  description = "Branch to checkout"
  type        = string
  default     = "main"
}

variable "my_ip_cidr" {
  description = "Your IP in CIDR notation allowed SSH access (e.g. 1.2.3.4/32)"
  type        = string
  default     = "0.0.0.0/0"
}
