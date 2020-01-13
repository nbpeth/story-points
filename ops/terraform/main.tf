resource "aws_ecr_repository" "rp-story-points" {
  name = "rp-story-points"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_db_instance" "rp-story-points-db" {
  allow_major_version_upgrade = false
  auto_minor_version_upgrade = false
  backup_retention_period = 10
  backup_window = "06:40-07:10"
  copy_tags_to_snapshot = true
  db_subnet_group_name = "vpc-test-private"
  deletion_protection = true
  engine = "mysql"
  engine_version = "5.7"
  identifier = "example"
  instance_class = "db.t2.micro"
  maintenance_window = "Sun:05:54-Sun:06:24"
  monitoring_role_arn = "${data.aws_iam_role.rds_monitoring_role.arn}"
  monitoring_interval = "60"
  multi_az = false
  name = "rpstorypointsdb"
  option_group_name = "default:postgres-10"
  parameter_group_name = "default.postgres10"
  password = "${var.db_password}"
  username = "${var.db_user}"

  storage_encrypted = true
  storage_type = "gp2"
  allocated_storage = 10
  max_allocated_storage = 20

  tags = {
    Name = "example"
    application = "example"
    contact = "example@validity.com"
    environment = "test"
    managedby = "${var.managedby}"
    project = "Example"
    repo_name = "${var.repo_name}"

    team = "example"
  }
}
