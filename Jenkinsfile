#!/usr/bin/groovy

deployNode {
    checkoutCode {}

    def tag = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
    def environment = 'test'
    def cluster = "workload1-${environment}"


    dockerBuild {
        imageName = 'rp-story-points'
        imageTag = tag
    }

  if (BRANCH_NAME == 'master') {
    deployWithHelm {
      deployCluster = cluster
      deployName = 'story-points'
      overrideYaml = "${environment}.yaml"
      overrides = [
        'image.tag': tag
      ]
      repoChart = "https://helm-charts.returnpath.net/charts/rp-standard-deployment-0.0.1.tgz"
      secrets = [
        'secrets.data.db_user'    : "storypoints-rds-user-${environment}",
        'secrets.data.db_password': "storypoints-rds-password-${environment}"
      ]
    }
  }
}
