#!/bin/bash

set -eu

existing_db_cluster_arn=${EXISTING_DB_CLUSTER_ARN:-}
global_cluster_identifier=${GLOBAL_CLUSTER_IDENTIFIER:-ysku-testing-gloabl-database}
db_cluster_identifier=${DB_CLUSTER_IDENTIFIER:-ysku-testing-cluster}

# これで既存のクラスタをグローバルデータベースに含めることができる
echo 'create global database if not exist'
aws rds describe-global-clusters --global-cluster-identifier ${global_cluster_identifier} || {
  aws rds create-global-cluster \
    --region ap-northeast-1  \
    --global-cluster-identifier ${global_cluster_identifier} \
    --source-db-cluster-identifier ${existing_db_cluster_arn}
}

# セカンダリクラスタの作成
echo 'create secondary cluster if not exist'
aws rds describe-db-clusters --region ap-northeast-3 --db-cluster-identifier ${db_cluster_identifier} || {
  aws rds --region ap-northeast-3 \
    create-db-cluster \
    --db-cluster-identifier ${db_cluster_identifier} \
    --global-cluster-identifier ${global_cluster_identifier} \
    --engine aurora-postgresql \
    --engine-version 11.9
}

# セカンダリクラスタにインスタンスを登録
echo 'create secondary cluster instance if not exist'
aws rds describe-db-instances --region ap-northeast-3 --db-instance-identifier ysku-testing-1 || {
  aws rds --region ap-northeast-3 \
    create-db-instance \
    --db-instance-class db.r5.large \
    --db-cluster-identifier ${db_cluster_identifier} \
    --db-instance-identifier ysku-testing-1 \
    --engine aurora-postgresql --engine-version 11.9
}
