resource "aws_ecr_repository" "story-points" {
  name = "story-points"

  image_scanning_configuration {
    scan_on_push = true
  }
}
