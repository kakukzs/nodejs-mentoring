import * as config from './config/config';

import * as models from './models';

console.log(config.name);

const user = new models.User();
const product = new models.Product();