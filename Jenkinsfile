#!/usr/bin/groovy

deployNode {
    checkoutCode {}
    envVars: [
      envVar(key: "SPHOST", value: "localhost:3306"),
      envVar(key: "SPUSER", value: "user"),
      envVar(key: "SPPASSWORD", value: "password"),
    ],
    def tag = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
    def environment = 'test'
    def cluster = "workload1-${environment}"

    if(false) {
        dockerBuild {
            imageName = 'rp-story-points'
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
            secrets = [
                'secrets.data.partner_db_pdtapi_passwd': "eo_${environment}_partner_db_pdtapi_passwd",
                'secrets.data.eo_ses_jwt_key_secret': "eo_${environment}_pdt_ses_jwt_key",
                'secrets.data.pdt_cm_api_client_id': "pdt_cm_api_client_id",
                'secrets.data.pdt_cm_api_password': "pdt_${environment}_cm_api_password",
                'secrets.data.pdt_internal_surili_cert_key': "pdt-partner-api-surili-key-${environment}"
            ]
        }
    }
}
