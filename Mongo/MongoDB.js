module.exports = (URLMONGODB) => {return new MongoDB(URLMONGODB);}; 

const mongoose = require('mongoose');
const Building = require('../models/building')

const db = 'building';
const url = 'mongodb://localhost:27017/scrapy';

class MongoDB{
    urlMongo;
    Modelbuilding;

    constructor(URLMONGODB){
        this.urlMongo = URLMONGODB || "mongodb://localhost:27017/scrapy";
        this.connect();
        this.open();
    }

    connect(){
        mongoose.connect(this.urlMongo,  {keepalive:true, useUnifiedTopology: true, useNewUrlParser: true}).then(() => {
        console.log("La conexión OK")
        })
        .catch(err => console.log(err));
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
            var building = this.ParserBuilding(building);
            building.save(function (err, book) {
                if (err) return console.error(err);
                console.log("saved collection.");
            });
            
        }catch(error){
            //mensaje error
            return 'error'
        }
        //this.disconnect();
        return 'OK'
    }


}