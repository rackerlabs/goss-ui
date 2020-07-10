# Backend

terraform {
  backend "s3" {
    key     = "goss-ui/terraform.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}

# Providers

provider "aws" {
  version = "2.16.0"
  region  = "us-west-2"
}

resource "aws_s3_bucket" "goss_ui" {
  bucket = "goss-ui-${var.environment}"
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  lifecycle_rule {
    id                                     = "ttl-root-deploys"
    prefix                                 = "goss/"
    enabled                                = true
    abort_incomplete_multipart_upload_days = 7

    expiration {
      days = "${365 * 10}"
    }
  }

  lifecycle_rule {
    id                                     = "ttl-sha-deploys"
    prefix                                 = "goss-"
    enabled                                = true
    abort_incomplete_multipart_upload_days = 1

    expiration {
      days = 7
    }
  }
}
