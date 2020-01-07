resource "aws_ecr_repository" "rp-story-points" {
  name = "rp-story-points"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_db_instance" "rp-story-points-db" {
  identifier = "rp-story-points-db"
  allocated_storage    = 10
  storage_type         = "gp2"
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t2.micro"
  name                 = "rpstorypointsdb"
  username             = "spuser"
  password             = "supersppass"
  parameter_group_name = "default.mysql5.7"
  db_subnet_group_name = "vpc-test-public"


}
