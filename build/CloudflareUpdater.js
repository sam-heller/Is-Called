const fs = require('fs');
const fetch = require('node-fetch');

/**
 * Class responsible for updating cloudflare records
 */
 class CloudflareUpdater {
    animals;
    kvOptions;
    kvTarget;

    constructor() {
        this.animals = JSON.parse(fs.readFileSync('build/animals.json'), 'utf-8');
        this.kvTarget = process.env.UPDATE_TEMPLATE
            .replace(':account', process.env.ACCOUNT_ID)
            .replace(':namespace', process.env.NAMESPACE_ID)
        this.kvOptions = {
            method: 'PUT',
            headers: {
                "X-Auth-Email": process.env.API_EMAIL,
                "X-Auth-Key": process.env.API_TOKEN,
                "Content-Type": 'application/json'
            },
            body: ''
        }
    }

    writeBulk(values) {
        this.kvOptions.body = values;
        return fetch(this.kvTarget, this.kvOptions)
            .then(res => res.json())
            .then(json => console.log(`response setting bulk values : `, json))
    }

    async writeKeystore() {
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
        toData = JSON.stringify(toData);
        return await this.writeBulk(toData)
    }
}

module.exports = CloudflareUpdater