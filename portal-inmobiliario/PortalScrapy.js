module.exports = (cheerioModule, commonModule, dbModule, itemClass, resultClass) =>
  new PortalScrapy(cheerioModule, commonModule, dbModule, itemClass, resultClass);

/*
* Main class of portal inmobiliario web scrap
*/
class PortalScrapy {
    // DYNAMIC MODULES
    common;
    cheerio;
    dbModule;
    itemClass;
    resultClass;
    // CONSTANTS
    URL_BASE;
    URL_REFERER;
    OPERATIONS;
    CATEGORIES;
    PAGE_INFO_CHUNK;
    DEFAULT_PAGE_SIZE;

    /**
     * Init the Portal Inmobiliario Main Scrapy class. 
     *
     *
     * @param {Object}          cheerioModule           Cheerio Module, required.
     * @param {Object}          commonModule            Common local class, required.
     * @param {Object}          dbModule                Database module, optional.
     * @param {Object}          itemClass               PortalItem local class, required.
     * @param {Object}          resultClass             PortalResults local class, required.
     *
     * @return {Object} New instance of PortalScrapy.
     */
    constructor(cheerioModule, commonModule, dbModule, itemClass, resultClass){
        this.common = commonModule;
        this.cheerio = cheerioModule;
        this.dbModule = dbModule;

        // PORTAL CLASES
        this.itemClass = itemClass;
        this.resultClass = resultClass;

        this.URL_BASE = "https://www.portalinmobiliario.com";
        this.URL_REFERER = this.URL_BASE;

        this.OPERATIONS = ['venta'];
        this.CATEGORIES = ['departamento', 'casa', 'sitio', 'parcela', 'terreno'];
        this.PAGE_INFO_CHUNK = 5;
        this.DEFAULT_PAGE_SIZE = 50;
    }
    
    async scrap(){
        // Get from portal inmobiliario (Venta de casas)

        // TODO: Añadir busqueda y parse de otro tipo de operaciones y propiedades (Arriendo / Departamento)
        for( let operation in this.OPERATIONS){
            console.log("Get operation: ", this.OPERATIONS[operation])
            for( let category in this.CATEGORIES){
                console.log("-- Get category: ", this.CATEGORIES[category])
                let nextUrl = `${this.URL_BASE}/${this.OPERATIONS[operation]}/${this.CATEGORIES[category]}`;
                // GET THE RESULT PAGE
                for(let i = 1; nextUrl !== undefined; i++){
                    if( i % this.PAGE_INFO_CHUNK == 1)
                        console.log("-- -- pages :", i);
                    nextUrl = await this.getResult(nextUrl);
                }
            }
        }
        
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