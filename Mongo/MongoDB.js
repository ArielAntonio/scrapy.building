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
        //this.client = MongoClient;
        this.client = new MongoClient(this.urlMongo, { useUnifiedTopology: true });
    }

    

    async connect(){
        // Due a bug the connection has to be created every time it gets disconnect
        // https://jira.mongodb.org/browse/NODE-2544
        // Based on this, maybe the db is the previous cache db, so that is closed
        // http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html
        //this.client = new MongoClient(this.urlMongo, { useUnifiedTopology: true });
        if(! this.client.isConnected())
            await this.client.connect();

        return await this.client.db(dbName, {returnNonCachedInstance : true});

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

    async SaveBuilding(building){
        try{
            
            let db = await this.connect();
            var modelBuilding = this.ParserBuilding(building);

            // Insert only if it is new (TODO: check updates? )
            // console.log(await db.collection(dbCollection).findOne({Id : modelBuilding.Id}));
            if(await db.collection(dbCollection).findOne({Id : modelBuilding.Id}) === null) {
                await db.collection(dbCollection).insertOne(modelBuilding);
            }
            await this.client.close();
            return 'OK';

        }catch(error){
            //mensaje error
            await this.client.close();
            return error;
        }

    }


}
