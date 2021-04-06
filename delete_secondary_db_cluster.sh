#!/bin/bash

global_cluster_identifier=${GLOBAL_CLUSTER_IDENTIFIER:-ysku-testing-gloabl-database}
db_cluster_identifier=${DB_CLUSTER_IDENTIFIER:-ysku-testing-cluster}
db_instance_identifier=${DB_INSTANCE_IDNETIFIER:-ysku-testing-1}

aws rds describe-db-instances --region ap-northeast-3 --db-instance-identifier ${db_instance_identifier}
if [[ $? -eq 0 ]];
then
  echo "deleting db instance: ${db_instance_identifier}"
  aws rds delete-db-instance --region ap-northeast-3 --db-instance-identifier ${db_instance_identifier}
fi

# aws rds describe-global-clusters --global-cluster-identifier ${global_cluster_identifier}
aws rds remove-from-global-cluster \
  --global-cluster-identifier ${global_cluster_identifier} \
  --db-cluster-identifier ${db_cluster_identifier}

aws rds describe-db-clusters --region ap-northeast-3 --db-cluster-identifier ${db_cluster_identifier}
if [[ $? -eq 0 ]];
then
  echo "deleting db cluster: ${db_cluster_identifier}"
  aws rds delete-db-cluster \
    --region ap-northeast-3 \
    --db-cluster-identifier ${db_cluster_identifier} \
    --skip-final-snapshot
fi
