provider "aws" {
  version = "~> 2.34.0"

  region  = var.region
  profile = var.profile
}

variable "managedby" {
  default = "terraform"
}

variable "profile" {
  default = "eo"
}

variable "region" {
  default = "us-east-1"
}

variable "repo_name" {
  default = "ReturnPath/story-points/"
}

variable "tf_s3_bucket" {
  default = "eo-terraform"

  description = <<EOF
Full S3 bucket name for remote state including the AWS CLI account profile
EOF

}

