module.exports = (URLMONGODB) => {return new MongoDB(URLMONGODB);}; 

const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { db } = require('../models/building');
const Building = require('../models/building')


const dbName = 'Scrapy';
const dbCollection = 'building';
const url = 'mongodb://localhost:27017';

class MongoDB{
    urlMongo;
    Modelbuilding;
    client;

    constructor(URLMONGODB){
        this.urlMongo = URLMONGODB || url;
    }

    

    connect(){
        this.client = new MongoClient(url, {useUnifiedTopology: true});
        this.client.connect();
        return this.client.db(dbName);

        /*mongoose.connect(this.urlMongo,  {keepalive:true, useUnifiedTopology: true, useNewUrlParser: true}).then(() => {
        console.log("La conexión OK")
        })
        .catch(err => console.log(err));*/
    }

    disconnect(){
        mongoose.connection.close();
    }

    open(){
        mongoose.connection.on('error', console.error.bind(console, 'connection error:')); // enlaza el track de error a la consola (proceso actual)
        mongoose.connection.once('open', () => {
            console.log('connected'); // si esta todo ok, imprime esto
        });
    }

    ParserBuilding(building){
        var Modelbuilding = new Building({
            Id : building.itemId,
            Description : building.itemDescription,
            Geolocation : '',//building.itemGeolocation,
            Address : building.itemAddress,
            AddressLocation : building.itemAddressLocation,
            SurfaceRange : building.itemSurfaceRange,
            RoomsRange : building.itemRoomsRange,
            BathroomsRange : building.itemBathroomsRange,
            Status : building.itemStatus,
            CompletionDate : building.itemCompletionDate,
            PublicationCode : building.itemPublicationCode,
            PublicationDate : building.itemPublicationDate,
            ContractorData : '',//building.itemContractorData,
            PhotoList : '',//building.itemPhotoList,
            ModelList : '',//building.itemModelList,
            PublicationNumber : building.itemPublicationNumber,
            ReportLink : building.itemReportLink
        });
        return Modelbuilding; 
    }

    SaveBuilding(building){
        try{
            db = await this.connect();
            var building = this.ParserBuilding(building);
            await db.collection(dbCollection).insertOne({
                building
            });

            //var building = this.ParserBuilding(building);
            //building.save(function (err, build) {
            //    if (err) return console.error(err);
            //    console.log("saved collection.");
            //});
            
        }catch(error){
            //mensaje error
            return 'error'
        }
        //this.disconnect();
        return 'OK'
    }


}