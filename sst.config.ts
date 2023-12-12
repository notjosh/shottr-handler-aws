import { SSTConfig } from 'sst';
import { ApiStack } from './stacks/ApiStack';
import { CdnStack } from './stacks/CdnStack';

export default {
  config(_input) {
    return {
      name: 'shottr-handler-aws',
      region: 'eu-central-1',
    };
  },
  stacks(app) {
    app.stack(CdnStack);
    app.stack(ApiStack);
  },
} satisfies SSTConfig;
