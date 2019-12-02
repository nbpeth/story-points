terraform {
  backend "s3" {
    bucket         = "eo-terraform"
    dynamodb_table = "terraform-statelock"
    encrypt        = true
    key            = "github-repos/story-points/ops/terraform/terraform.tfstate"
    profile        = "eo"
    region         = "us-east-1"
  }
}
