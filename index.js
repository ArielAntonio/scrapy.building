const cheerio = require('cheerio');
const fs = require('fs');
const fetch = require('node-fetch');

// JSON.stringify(json, null, 4)

const CACHE_FOLDER = "cache";
const URL_REFERER = "";
const DEFAULT_WAITING_TIME = 10;
const URL_MONGODB = "mongodb://localhost:27017/scrapy"

const common = require("./Common")(fs, fetch, CACHE_FOLDER, URL_REFERER, DEFAULT_WAITING_TIME, false);
const PortalResults = require("./portal-inmobiliario/PortalResults")(cheerio, common);
const PortalItem = require("./portal-inmobiliario/PortalItem")(cheerio, common);

/* BD Mongo */
const USE_MONGO = true;
const Mongodb = {
    enabled : USE_MONGO,
    adapter : require("./Mongo/MongoDB")(URL_MONGODB)
};

const PortalScrapy = require("./portal-inmobiliario/PortalScrapy")(cheerio, common, Mongodb, PortalItem, PortalResults);

const ChilePropiedadesResult = require("./chile-propiedades/ChilePropiedadesResult")(cheerio, common);
const ChilePropiedadesItem = undefined;
const ChilePropiedadesScrapy = require("./chile-propiedades/ChilePropiedadesScrapy")(cheerio, common, Mongodb, ChilePropiedadesItem, ChilePropiedadesResult);
/* ******** */

// Chile Propiedades
( async () => {
    await ChilePropiedadesScrapy.scrap();
    console.log("Found buildings :");
    ChilePropiedadesScrapy.resultClass.buildingList.forEach((item) => {
      console.log(item);
    });
    
  })();

return;

// Portal inmobiliario scrap site
( async () => {
    await PortalScrapy.scrap();
    console.log("Found buildings :");
    PortalScrapy.resultClass.buildingList.forEach((item) => {
      console.log(item.buildingDetail);
    });
    
  })();


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