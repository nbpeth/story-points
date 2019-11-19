#!/usr/bin/groovy

deployNode {
    checkoutCode {}

    def tag = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
    def environment = 'test'
    def cluster = "workload1-${environment}"

    dockerBuild {
        imageName = 'story-points'
        imageTag = tag
    }

    deployWithHelm {
        deployCluster = cluster
        deployName = 'story-points'
        overrideYaml = "${environment}.yaml"
        overrides = [
            'image.tag': tag
        ]
        repoChart = "https://helm-charts.returnpath.net/charts/rp-standard-deployment-0.0.1.tgz"
    }
}
