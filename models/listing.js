const mongoose = require("mongoose");
// making Schema
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        require:true
    },
    description:String,
    image:{
        type:String,
        default:"https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464",
        set: (v) =>
             v === ""
        ? "https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=464" 
        : v, //same as the the if else condtion 
    },
    price:Number,
    location:String,
    country:String,
});

// making model
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;




