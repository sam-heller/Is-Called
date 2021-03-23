const fs = require('fs');
const CloudflareAPI = require('../../lib/CloudflareAPI')

/**
 * Class responsible for updating cloudflare records
 */
 class CloudflareUpdater {
    
    constructor() {
        this.animals = JSON.parse(fs.readFileSync('build/animals.json'), 'utf-8');
        this.api = new CloudflareAPI()
    }

    async go() {
        let toData = [];
        let animalNames = [];
        for (let entry of this.animals) {
            for (let name of Object.keys(entry.animal)) {
                toData.push({key: `${name}.infant`, value: JSON.stringify(entry.infant)});
                toData.push({key: `${name}.female`, value: JSON.stringify(entry.female)});
                toData.push({key: `${name}.male`, value: JSON.stringify(entry.male)});
                toData.push({key: `${name}.group`, value: JSON.stringify(entry.group)});
                toData.push({key: `${name}.meat`, value: JSON.stringify(entry.meat)});
                animalNames.push(name);
            }
        }
        toData.push({key: 'animals', value: JSON.stringify(animalNames)});
        return await this.api.putBulk(toData)
    }
}

module.exports = CloudflareUpdater