import { Api, Bucket, Config, StackContext } from 'sst/constructs';

export function API({ stack }: StackContext) {
  const UPLOAD_TOKENS = new Config.Secret(stack, 'UPLOAD_TOKENS');

  const bucket = new Bucket(stack, 'public');

  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        bind: [bucket, UPLOAD_TOKENS],
      },
    },
    routes: {
      'GET /': 'packages/functions/src/lambda.handler',
      'GET /todo': 'packages/functions/src/todo.list',
      'POST /todo': 'packages/functions/src/todo.create',
      'POST /upload': 'packages/functions/src/upload.create',
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
