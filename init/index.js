const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
   await mongoose.connect(MONGO_URL);
}

main().then((data) =>{
    console.log("connected succesfully");
    
})
.catch((err) =>{
    console.log(err);
});

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({
        ...obj, owner:"6968a9c9594889b0061e1f4e",
    }))
    await Listing.insertMany(initData.data);
    //  console.log(initData.data)
    console.log("Data was initialized");
};

initDB();