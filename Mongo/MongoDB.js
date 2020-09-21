module.exports = (URLMONGODB) => {return new MongoDB(URLMONGODB);}; 

const mongoose = require('mongoose');
const Building = require('../models/building')

var url = 'mongodb://localhost:27017/scrapy';

class MongoDB{
    urlMongo;

    constructor(URLMONGODB){
        this.urlMongo = URLMONGODB || "mongodb://localhost:27017/scrapy";
    }

    connect(){
        mongoose.connect(this.urlMongo,  {keepAlive: true, useNewUrlParser: true}).then(() => {
        console.log("La conexión a la base de datos se ha realizado correctamente")
        })
        .catch(err => console.log(err));
    }

    disconnect(){
        mongoose.connection.disconnect();
    }

    open(){
        mongoose.connection.on('error', console.error.bind(console, 'connection error:')); // enlaza el track de error a la consola (proceso actual)
        mongoose.connection.once('open', () => {
          console.log('connected'); // si esta todo ok, imprime esto
        });
    }

    ParserBuilding(building){
        self.building = new Building({
            Id : building.itemId,
            Description : building.itemDescription,
            Geolocation : building.itemGeolocation,
            Address : building.itemAddress,
            AddressLocation : building.itemAddressLocation,
            SurfaceRange : building.itemSurfaceRange,
            RoomsRange : building.itemRoomsRange,
            BathroomsRange : building.itemBathroomsRange,
            Status : building.itemStatus,
            CompletionDate : building.itemCompletionDate,
            PublicationCode : building.itemPublicationCode,
            PublicationDate : building.itemPublicationDate,
            ContractorData : building.itemContractorData,
            PhotoList : building.itemPhotoList,
            ModelList : building.itemModelList,
            PublicationNumber : building.itemPublicationNumber,
            ReportLink : building.itemReportLink
        }); 
    }

    SaveBuilding(building){
        try{
            this.ParserBuilding(building);
            this.connect();
            self.building.save((error, tok) => {
                if (error) {
                    responseb.error = false;
                    responseb.codigo = 400;
                    responseb.mensaje = error;
                    res.status(400).send(responseb)
                } else {
                    responseb.error = false;
                    responseb.codigo = 200;
                    responseb.mensaje = tok._id;
                    res.status(201).send(responseb)
                }
            });
        }catch(error){
            //mensaje error
            return 'error'
        }
        this.disconnect();
        return 'OK'
    }


}