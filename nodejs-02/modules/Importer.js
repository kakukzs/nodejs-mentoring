import fs from 'fs';

export default class Importer {
	constructor() {
		this.fs = fs;
	}

	import(filePath) {
		return this.readFile(filePath).then(this.parseFile);
	}

	importSync(filePath) {
		const fileContent = this.fs.readFileSync(filePath, 'utf8');
		const data = this.parseFile(fileContent);
		return data;
	}

	readFile(filePath) {
		return new Promise((resolve, reject) => {
			this.fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}

	parseFile(dataStr) {
		return dataStr.split(/\n/).map(row => row.split(';'));
	}
}