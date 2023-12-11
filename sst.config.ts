import { SSTConfig } from 'sst';
import { API } from './stacks/ShottrHandlerStack';

export default {
  config(_input) {
    return {
      name: 'shottr-handler-aws',
      region: 'eu-central-1',
    };
  },
  stacks(app) {
    app.stack(API);
  },
} satisfies SSTConfig;
