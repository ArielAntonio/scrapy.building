const cheerio = require('cheerio');
const fs = require('fs');
const fetch = require('node-fetch');

// JSON.stringify(json, null, 4)

const URL_BASE = "https://www.portalinmobiliario.com/venta/casa";
const CACHE_FOLDER = "cache";
const URL_REFERER = "https://www.portalinmobiliario.com/";
const DEFAULT_WAITING_TIME = 10;
const URL_MONGODB = "mongodb://localhost:27017/scrapy"

const common = require("./Common")(fs, fetch, CACHE_FOLDER, URL_REFERER);
const PortalResults = require("./portal-inmobiliario/PortalResults")(cheerio, common);
const PortalItem = require("./portal-inmobiliario/PortalItem")(cheerio, common);

/* BD Mongo */
const USE_MONGO = true;
const Mongodb = require("./Mongo/MongoDB")(URL_MONGODB);
/* ******** */

// Get from portal inmobiliario (Venta de casas)
(async () => {
    // TODO: Añadir busqueda y parse de otro tipo de operaciones y propiedades (Arriendo / Departamento)
    let nextUrl = URL_BASE;
    
    for(let i = 1; nextUrl !== undefined; i++){
        let waitingTime = GetRandomTime(DEFAULT_WAITING_TIME);
        let pageContent = await common.getPage(nextUrl);
        nextUrl = await PortalResults.ReadEntry(pageContent);
        await common.delay(waitingTime);
        console.log("The next url (delayed) is: ", nextUrl);
        // Solo lee la primera (para efectos de prueba)
        break;
        
    }
    console.log("Se ha encontrado un total de: %s edificios", PortalResults.buildingList.length);
    // Test
    for(let i = 0, l = PortalResults.buildingList.length; i < l; i++){
        console.log("Get the detail of: ", PortalResults.buildingList[i].buildingId);
        let waitingTime = GetRandomTime(DEFAULT_WAITING_TIME);
        let pageContent = await common.getPage(PortalResults.buildingList[i].buildingUrl);
        let buildingResult = await PortalItem.ReadEntry(pageContent);
        if(USE_MONGO){
            /// TODO: validar si exite registro en la BD
            Mongodb.SaveBuilding(buildingResult);
        }
        /// TODO: Establecer relación en lugar de añadir como hijo
        PortalResults.buildingList[i].buildingDetail = buildingResult;
        await common.delay(waitingTime);
    }
    
    //console.log("Detalles de edificio %s, :", PortalResults.buildingList[0].buildingId, buildingResult)
})();

function GetRandomTime( rangeValue){
    return Math.floor((Math.random() * rangeValue) +1);
}


// TODO: Buscar en https://chilepropiedades.cl/propiedades/venta/casa/region-metropolitana(rm)/0
// TODO: Buscar en https://www.goplaceit.com/cl/mapa?id_modalidad=1&tipo_propiedad=1%2C2&selectedTool=list#11.92/-33.45071/-70.66728
// TODO: Buscar en https://www.vivastreet.cl/compra-casas/cl
// TODO: Buscar en https://www.icasas.cl/
// TODO: Buscar en https://www.toctoc.com/#!
// TODO: Buscar en https://casas.trovit.cl/
// TODO: Buscar en https://www.enlaceinmobiliario.cl/propiedadesnuevas/
// TODO: Buscar en https://www.nuroa.cl/venta/casas-nuevas-santiago-chile
// TODO: Buscar en https://www.zoominmobiliario.com/
// TODO: Buscar en https://www.realproperty.cl/
// TODO: Buscar en https://www.realtor.com/international/cl/
// TODO: Buscar en https://www.doomos.cl/
// TODO: Buscar en http://www.enchile.cl/ ?
// TODO: Buscar en https://fich.cl/venta/
// TODO: Buscar en http://www.corredoresintegrados.cl/
// TODO: Buscar en https://www.yapo.cl/
// TODO: Buscar en http://www.remax.cl/
// TODO: Buscar en http://www.propiedades.emol.com/
// TODO: Buscar en https://www.procasa.cl/
// TODO: http://www.elinmobiliario.cl/
// TODO: Buscar en (Concentrador) https://casas.mitula.cl/casas/casa

// TODO: Buscar en ? https://www.casasenremate.com/

// Relacionado? https://www.minvu.cl/beneficios/vivienda/

/*
parseResultsSite(URL_BASE)
.then((nextUrl) => delay(5, nextUrl))
.then((delayedValue) => {
    console.log("The next url (delayed) is: ", delayedValue);
});

*/