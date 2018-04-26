import EventEmitter from 'events';
import crypto from 'crypto';
import fs from 'fs';

export default class DirWatcher extends EventEmitter {
	constructor() {
		super();
		this.fs = fs;
		this.crypto = crypto;
		this.files = [];
		this.modifiedDates = {};
		this.hashes = {};
	}

	watch(path, delay) {
		setInterval(() => {
			this.readDir(path).then(files => {
				// Checking deleted files
				const deletedFiles = this.files.filter(file => !files.includes(file));
				if (deletedFiles.length) {
					deletedFiles.forEach(file => this.files.splice(this.files.indexOf(file), 1));
					this.emit('deleted', deletedFiles.map(file => path + '/' + file));
				}

				// Checking new files or changed existing files
				files.forEach(file => {
					const filePath = path + '/' + file;
					if (!this.files.includes(file)) {
						Promise.all([this.getFileStat(filePath), this.readFile(filePath)]).then(([stats, fileContent]) => {
							this.files.push(file);
							this.modifiedDates[file] = stats['mtimeMs'];
							this.hashes[file] = this.getHash(fileContent);
							this.emit('changed', filePath);
						}).catch(err => {
							console.log(`Error happened during file operation: ${err.toString()}`);
						});
					} else {
						this.getFileStat(filePath).then(stats => {
							const modifiedTime = stats['mtimeMs'];
							if (file in this.modifiedDates && this.modifiedDates[file] != modifiedTime) {
								this.readFile(filePath).then(fileContent => {
									const newHash = this.getHash(fileContent);
									if (newHash != this.hashes[file]) {
										this.modifiedDates[file] = modifiedTime;
										this.hashes[file] = newHash;
										this.emit('changed', filePath);
									}
								}).catch(err => {
									console.log(`Error happened during file operation: ${err.toString()}`);
								});
							}
						});
					}
				});
			}).catch(err => {
				console.log(`Error happened during reading directory: ${path}, ${err.toString()}`);
			});;
		}, delay);
	}

	readDir(path) {
		return new Promise((resolve, reject) => {
			this.fs.readdir(path, (err, files) => {
				if (err) {
					reject(err);
				} else {
					resolve(files);
				}
			});
		});
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

	getFileStat(filePath) {
		return new Promise((resolve, reject) => {
			this.fs.stat(filePath, (err, stats) => {
				if (err) {
					reject(err);
				} else {
					resolve(stats);
				}
			});
		});
	}

	getHash(data) {
		return this.crypto.createHash('sha256').update(data).digest('hex');
	}
}