module.exports = (cheerioModule, commonModule, dbModule, itemClass, resultClass) =>
  new YapoScrapy(cheerioModule, commonModule, dbModule, itemClass, resultClass);


class YapoScrapy{
    URL_BASE;
    URL_REFERER;
    CODE_REGION;
    PARAM_REGION;
    REGIONS;
    OPERATIONS;

    common;
    cheerio;
    dbModule;

    constructor(cheerioModule, commonModule, dbModule, itemClass, resultClass){
        this.common = commonModule;
        this.cheerio = cheerioModule;
        this.dbModule = dbModule;

        this.itemClass = itemClass;
        this.resultClass = resultClass;

        this.URL_BASE = "https://www.yapo.cl";
        this.URL_REFERER = this.URL_BASE;

        this.CODE_REGION = "15_s&l=0&w=1&cmn=";
        this.PARAM_REGION = "?ca=";

        this.REGIONS = 'region_metropolitana';
        this.OPERATIONS= ['comprar'];
    }

    async scrap(){
        
        for( let operation in this.OPERATIONS){
            console.log("Get operation: ", this.OPERATIONS[operation])
            let nextUrl = `${this.URL_BASE}/${this.REGIONS}/${this.OPERATIONS[operation]}`;
            // GET THE RESULT PAGE
            for(let i = 1; nextUrl !== undefined; i++){
                // Get only on UF values
                nextUrl = `${nextUrl}${this.PARAM_REGION}${this.CODE_REGION}`
                nextUrl = await this.getResult(nextUrl);
                // TODO: REMOVE BREAK
                break;
            }
            // TODO: REMOVE BREAK
            break
            
        }
        // TODO: Read the item content
        return;
        
        console.log("Se ha encontrado un total de: %s elementos", this.resultClass.buildingList.length);
        // Get from portal inmobiliario items detail
        for(let i = 0, l = this.resultClass.buildingList.length; i < l; i++){
            if(i % this.DEFAULT_PAGE_SIZE == 0)
                console.log("Items processed :", i);
            /// TODO: Establecer relación en lugar de añadir como hijo?
            let itemData = await this.getItem(this.resultClass.buildingList[i]);
            this.resultClass.buildingList[i].buildingDetail =  itemData;
            // Save-it to Database
            if(this.dbModule.enabled){
                /// TODO: validar si exite registro en la BD
                this.dbModule.adapter.SaveBuilding(itemData);
            }
        }
    }

    async getResult(currentUrl){
        let waitingTime = this.common.getRandomTime(this.common.DEFAULT_WAITING_TIME);
        let pageContent = await this.common.getPage(currentUrl);
        let nextUrl = await this.resultClass.ReadEntry(pageContent);
        await this.common.delay(waitingTime);
        return nextUrl;
    }

    async getItem(currentBuilding){
        let waitingTime = this.common.getRandomTime(this.common.DEFAULT_WAITING_TIME);
        let pageContent = await this.common.getPage(currentBuilding.buildingUrl);
        let buildingResult = await this.itemClass.ReadEntry(pageContent);
        await this.common.delay(waitingTime);
        return buildingResult;
    }

}