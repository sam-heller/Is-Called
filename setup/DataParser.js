const fs = require('fs');
const csv = require('csv-parser');

/**
 * Class responsible for reading wikipedia CSV 
 * and writing animal JSON object 
 */
 class DataParser {

    infile;
    outfile;

    constructor(config){
        this.infile = config['csv_in'];
        this.outfile = config['json_out'];
    }

    /**
     * Clean animal names
     * 
     * @param {*} row 
     * @returns 
     */
    cleanAnimalName(row){
        row['animal'] = row['animal']
            .replace('/','||')
            .replace('-', '')
            .toLowerCase();
        return row;
    }

    /**
     * Extract "also see" references from animal name 
     * 
     * @param {*} row 
     * @returns 
     */
    extractAnimalReference(row){
        if (row['animal'].includes('also see')){
            let parts = row['animal'].split('also see');
            row['animal'] = parts[0].trim();
            row['references'] = parts[1].trim();
        }
        return row;
    }

    /**
     * Extract "see" redirects from animal name
     * 
     * @param {} row 
     * @returns 
     */
    extractAnimalRedirect(row){
        if (row['animal'].includes('see') && !row['animal'].includes('also')){
            let parts = row['animal'].split('see');
            row['animal'] =  parts[0].trim();
            row['redirects'] = parts[1].trim();
        }
        return row;
    }

    /**
     * Extract contextual information for name
     * attributes and build the final object
     * 
     * @param {*} row 
     * @param {*} key 
     * @returns 
     */
    parseModifiers(row, key){
        let modified = {};
        let modifier = '';
        for (let group of row[key]){
            group = group.toLowerCase()
            if (group.endsWith(':')){
                modifier = group.replace(':', '');
            } else if (group.includes('(')){
                let parts = group.replace(')', '').split('(');
                modified[parts[0].trim()] = parts[1].trim(); 
            } else {
                modified[group.trim()] = modifier;  
            }
        }
        row[key] = modified;
        return row;
    }

    /**
     * 
     * @param {*} row 
     * @returns 
     */
    splitData(row){
        for (let k in row){
            row[k] = row[k].split('||');
            row[k].map((s) => {return s.trim()})
            row[k] = row[k].filter((el) => {return el != ''})
        }
        return row
    }

    /**
     * Read in the CSV from wikipedia, parse it with 
     * the above helper functions, and write out
     * the final data JSON file
     * 
     * @param {*} infile 
     * @param {*} outfile 
     */
    buildDataFile(){
        const animals = [];
        fs.createReadStream(this.infile)
        .pipe(csv())
        .on('data', (row) => {
            row = Object.assign(row, {'references': '', 'redirects':''})
            row = this.cleanAnimalName(row);
            row = this.extractAnimalReference(row);
            row = this.extractAnimalRedirect(row);        
            row = this.splitData(row);
            for (let k in row){
                row = this.parseModifiers(row, k);
            }
            animals.push(row);
        })
        .on('end', () => {
            fs.writeFileSync(this.outfile, JSON.stringify(animals))
        })
    }

}

module.exports = DataParser;