import config from './config/config';

import * as models from './models';

import DirWatcher from './modules/DirWatcher';
import Importer from './modules/Importer';

console.log(config.name);

const user = new models.User();
const product = new models.Product();

const dirWatcher = new DirWatcher();
const importer   = new Importer();

dirWatcher.watch('./data', 1000);

dirWatcher.addListener('changed', filePath => {
	importer.import(filePath).then(console.log);
});

dirWatcher.addListener('deleted', filePath => {
	console.log(`File(s) deleted: ${filePath}`);
});