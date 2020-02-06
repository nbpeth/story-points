resource "aws_ecr_repository" "rp-story-points" {
  name = "rp-story-points"

  image_scanning_configuration {
    scan_on_push = true
  }
}

data "aws_iam_role" "rds_monitoring_role" {
  name = "rds-monitoring-role"
}

variable "release_db_password" {
  type = string
}

resource "aws_db_instance" "release" {
  allow_major_version_upgrade = false
  auto_minor_version_upgrade = false
  backup_retention_period = 10
  backup_window = "06:40-07:10"
  copy_tags_to_snapshot = true
  db_subnet_group_name = "vpc-test-private"
  deletion_protection = true
  engine = "mysql"
  engine_version = "5.7"
  identifier = "storypointsrelease"
  instance_class = "db.t2.small"
  maintenance_window = "Sun:05:54-Sun:06:24"
  monitoring_role_arn = data.aws_iam_role.rds_monitoring_role.arn
  monitoring_interval = "60"
  multi_az = false
  name = "storypointsrelease"
  option_group_name = "default:mysql-5-7"
  parameter_group_name = "default.mysql5.7"
  username = "storypoints_release"
  password = var.release_db_password

  storage_encrypted = true
  storage_type = "gp2"
  allocated_storage = 10
  max_allocated_storage = 20

  tags = {
    Name = "storypoints-release"
    application = "story-points"
    contact = "parrtnerdevelopment@validity.com"
    environment = "test"
    managedby = var.managedby
    project = "story-points"
    repo_name = var.repo_name

    team = "partner development"
  }
}

resource "aws_db_parameter_group" "default" {
  family = "mysql5.7"

  parameter {
    name = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name = "character_set_client"
    value = "utf8mb4"
  }
}
