import { Api, Config, StackContext, use } from 'sst/constructs';
import { CdnStack } from './CdnStack';

export function ApiStack({ stack }: StackContext) {
  const { bucket, site } = use(CdnStack);

  const API_DOMAIN =
    process.env.API_DOMAIN && process.env.API_DOMAIN !== ''
      ? process.env.API_DOMAIN
      : undefined;

  console.log('ApiStack init config', {
    stage: stack.stage,
    API_DOMAIN,
  });

  const UPLOAD_TOKENS = new Config.Secret(stack, 'UPLOAD_TOKENS');

  const api = new Api(stack, 'api', {
    customDomain: API_DOMAIN,
    defaults: {
      function: {
        bind: [bucket, site, UPLOAD_TOKENS],
        environment: {
          API_DOMAIN: API_DOMAIN ?? '',
          CDN_DOMAIN:
            (site.customDomainUrl ?? site.url)?.replace('https://', '') ?? '',
        },
      },
    },
    routes: {
      'POST /upload': 'packages/functions/src/upload.create',
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl ?? api.url,
  });
}
