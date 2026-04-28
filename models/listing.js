const mongoose = require("mongoose");

// making Schema
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { string } = require("joi");

const listingSchema = new Schema({
    title:{
        type:String,
        require:true
    },
    description:String,
    image:{
         url:String,
         filename:String,          
    },
    price:Number,
    location:String,
    country:String,
    bedrooms:{
        type:Number,
        default:1,
        min:1,
    },
    beds:{
        type:Number,
        default:1,
        min:1,
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    category:{
        type:String,
        enum:["Trending", "Room", "Iconic cities", "Mountains","Natures", 
            "Castles", "Amazing Pools", "Camping", "Farms", 
            "Arctic", "Boats"]
    }
  //   geometry: {
  //   type: {
  //     type: String, // Don't do `{ location: { type: String } }`
  //     enum: ['Point'], // 'location.type' must be 'Point'
  //     required: true
  //   },
  //   coordinates: {
  //     type: [Number],
  //     required: true
  //   }
  // }
});

// post middleware
listingSchema.post("findOneAndDelete", async(listing) =>{
   if(listing){
     await Review.deleteMany({_id: {$in:listing.reviews}})
   }
});


// making model
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;




