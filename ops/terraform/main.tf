resource "aws_ecr_repository" "rp-story-points" {
  name = "rp-story-points"

  image_scanning_configuration {
    scan_on_push = true
  }
}
