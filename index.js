const cheerio = require('cheerio');
const fs = require('fs');
const fetch = require('node-fetch');

// JSON.stringify(json, null, 4)

const URL_BASE = "https://www.portalinmobiliario.com/venta/casa";
const CACHE_FOLDER = "cache";
const URL_REFERER = "https://www.portalinmobiliario.com/";
const DEFAULT_WAITING_TIME = 10;

const common = require("./Common")(fs, fetch, CACHE_FOLDER, URL_REFERER);
const PortalResults = require("./portal-inmobiliario/PortalResults")(cheerio, common);
const PortalItem = require("./portal-inmobiliario/PortalItem")(cheerio, common);


// LE MAIN
(async () => {
    let nextUrl = URL_BASE;
    for(let i = 1; nextUrl !== undefined; i++){
        let pageContent = await common.getPage(nextUrl);
        nextUrl = await PortalResults.ReadEntry(pageContent);
        await common.delay(DEFAULT_WAITING_TIME);
        console.log("The next url (delayed) is: ", nextUrl);
        // Solo lee la primera (para efectos de prueba)
        break;
        
    }
    console.log("Se ha encontrado un total de: %s edificios", PortalResults.buildingList.length);
    // Test
    
    let pageContent = await common.getPage(PortalResults.buildingList[0].buildingUrl);
    let buildingResult = await PortalItem.ReadEntry(pageContent);
    console.log("Detalles de edificio %s, :",PortalResults.buildingList[0].buildingId, buildingResult)
})();

/*
parseResultsSite(URL_BASE)
.then((nextUrl) => delay(5, nextUrl))
.then((delayedValue) => {
    console.log("The next url (delayed) is: ", delayedValue);
});

*/