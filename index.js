const cheerio = require('cheerio');
const fs = require('fs');
const fetch = require('node-fetch');

// JSON.stringify(json, null, 4)

const CACHE_FOLDER = "cache";
const URL_REFERER = "";
const DEFAULT_WAITING_TIME = 10;
const URL_MONGODB = "mongodb://10.0.3.105:27017"

const common = require("./Common")(fs, fetch, CACHE_FOLDER, URL_REFERER, DEFAULT_WAITING_TIME, false);
const PortalResults = require("./portal-inmobiliario/PortalResults")(cheerio, common);
const PortalItem = require("./portal-inmobiliario/PortalItem")(cheerio, common);

/* BD Mongo */
// TODO: Use just One Connection Pool, and closed at the end
const USE_MONGO = false;
const Mongodb = {
    enabled : USE_MONGO,
    adapter : require("./Mongo/MongoDB")(URL_MONGODB)
};

const PortalScrapy = require("./portal-inmobiliario/PortalScrapy")(cheerio, common, Mongodb, PortalItem, PortalResults);


const ChilePropiedadesResult = require("./chile-propiedades/ChilePropiedadesResult")(cheerio, common);
const ChilePropiedadesItem = require("./chile-propiedades/ChilePropiedadesItem")(cheerio, common);
const ChilePropiedadesScrapy = require("./chile-propiedades/ChilePropiedadesScrapy")(cheerio, common, Mongodb, ChilePropiedadesItem, ChilePropiedadesResult);

const YapoResult = require("./yapo.cl/YapoResult")(cheerio, common);
const YapoItem = undefined;
const YapoScrapy = require("./yapo.cl/YapoScrapy")(cheerio, common, Mongodb, YapoItem, YapoResult);

/* ******** */

// TODO: Añadir config para habilitar proveedores de busqueda
( async () => {
    // TODO: Open DB connection Pool

  // Yapo inmobiliario scrap site
  try{
    await YapoScrapy.scrap();
    console.log("Found buildings :");
    YapoScrapy.resultClass.buildingList.forEach((item) => {
      console.log(item.buildingDetail);
    });
  }catch(err){
    console.log(err);
  }


  // Chile Propiedades
  try{
    await ChilePropiedadesScrapy.scrap();
    console.log("Found buildings :");
    ChilePropiedadesScrapy.resultClass.buildingList.forEach((item) => {
      //console.log(item);
    }); 
  }
  catch(err){
    console.log(err);
  }
  return;
  // Portal inmobiliario scrap site
  try{
  await PortalScrapy.scrap();
    console.log("Found buildings :");
    PortalScrapy.resultClass.buildingList.forEach((item) => {
      console.log(item.buildingDetail);
    });
  }
  catch(err){
    console.log(err);
  }


  // TODO: Close DB Connection Pool
})();


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
// TODO: Buscar en http://www.remax.cl/
// TODO: Buscar en http://www.propiedades.emol.com/
// TODO: Buscar en https://www.procasa.cl/
// TODO: http://www.elinmobiliario.cl/
// TODO: Buscar en (Concentrador) https://casas.mitula.cl/casas/casa

// TODO: Buscar en ? https://www.casasenremate.com/

// Relacionado? https://www.minvu.cl/beneficios/vivienda/
