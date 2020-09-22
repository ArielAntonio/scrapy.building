'use strict'
var mongoose =  require('mongoose');
var Schema = mongoose.Schema;

var buildingSchema = mongoose.Schema({
    Id : String,
    Description : String,
    Geolocation : String,
    Address : String,
    AddressLocation : String,
    SurfaceRange : String,
    RoomsRange : String,
    BathroomsRange : String,
    Status : String,
    CompletionDate : String,
    PublicationCode : String,
    PublicationDate : String,
    ContractorData : String,
    PhotoList : String,
    ModelList : String,
    PublicationNumber : String,
    ReportLink : String
});
module.exports = mongoose.model('Modelbuilding', buildingSchema);