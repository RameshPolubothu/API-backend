const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    place :String,
    temp : Number,
    wind : Number,
    feelslike : Number,
    description : String
});

const DataModel = mongoose.model('Data',DataSchema);

module.exports = DataModel;