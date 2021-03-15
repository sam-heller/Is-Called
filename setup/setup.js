const fs = require('fs');
const DataParser = require('./DataParser');
const CloudflareUpdater = require('./CloudflareUpdater');
let config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

parser = new DataParser(config);
parser.buildDataFile();