const fs = require('fs');
const DataParser = require('./DataParser');
const CloudflareUpdater = require('./CloudflareUpdater')
let config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

switch(process.argv[2]){
    case 'build_data' :
        let parser = new DataParser(config);
        parser.buildDataFile()
        break;
    case 'save_data' :
        let updater = new CloudflareUpdater(config);
        updater.writeKeystore();
        break;
    default:
        console.log(`Unknown step ${process.argv[2]}`)
        break;
}
