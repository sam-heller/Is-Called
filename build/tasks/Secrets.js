const CloudflareAPI = require('../../lib/CloudflareAPI')
class Secrets {
    constructor(){
        this.api = new CloudflareAPI()
    }
    async go(){
        await this.api.putSecret('UNSPLASH_KEY', process.env.UNSPLASH_KEY)
        await this.api.putSecret('GTM_ID', process.env.GTM_ID)
    }
}

module.exports = Secrets