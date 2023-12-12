import { RemovalPolicy } from 'aws-cdk-lib';
import { Bucket, StackContext, StaticSite } from 'sst/constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export function CdnStack({ stack }: StackContext) {
  const CDN_DOMAIN =
    process.env.CDN_DOMAIN && process.env.CDN_DOMAIN !== ''
      ? process.env.CDN_DOMAIN
      : undefined;

  const CDN_ZONE =
    process.env.CDN_ZONE && process.env.CDN_ZONE !== ''
      ? process.env.CDN_ZONE
      : undefined;

  const S3_BUCKET =
    process.env.S3_BUCKET && process.env.S3_BUCKET !== ''
      ? process.env.S3_BUCKET
      : undefined;

  console.log('CdnStack init config', {
    stage: stack.stage,
    CDN_DOMAIN,
    S3_BUCKET,
  });

  const bucket = new Bucket(stack, 'storage', {
    cdk: {
      bucket:
        S3_BUCKET != null
          ? s3.Bucket.fromBucketName(stack, 'istorage', S3_BUCKET)
          : {
              removalPolicy:
                stack.stage === 'dev' ? RemovalPolicy.DESTROY : undefined,
            },
    },
  });

  const site = new StaticSite(stack, 'cdn', {
    path: 'public',
    indexPage: 'index.html',
    errorPage: '404.html',
    customDomain: CDN_DOMAIN
      ? {
          domainName: CDN_DOMAIN,
          hostedZone: CDN_ZONE,
        }
      : undefined,
    purgeFiles: false,
    cdk: {
      // kind of a hack, but we need to pass the inner reference to the bucket so it doesn't recreate a new bucket
      bucket: bucket.cdk.bucket,
    },
  });

  stack.addOutputs({
    CdnEndpoint: site.customDomainUrl ?? site.url,
  });

  return {
    bucket,
    site,
  };
}
