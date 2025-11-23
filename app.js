const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsmate = require("ejs-mate");

const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
   await mongoose.connect(MONGO_URL);
}

main().then(() =>{
    console.log("connected succesfully");
})
.catch((err) =>{
    console.log(err);
});

app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
   res.send("Hi- I am root");
});

// app.get("/testListing", async (req, res)=>{
//    let sampleListing = new Listing ({
//       title:"My name is Villa",
//       description:"By New Villa",
//       price:1200,
//       location:"calangute, Goa",
//       country:"India",
//    });
//    await sampleListing.save();
//    console.log("Sample was save");
//    res.send("succesful testing");
// })

// index rout to list allListings
app.get("/listings", async (req, res) =>{
    const allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings}); 
});

// New route for adding new listing 
app.get("/listings/new", async(req, res) =>{
    res.render("listings/new.ejs");
});

// show rout which shows the all details about the list
app.get("/listings/:id", async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});

// create  rout 
app.post("/listings", async(req, res)=>{
    // let {title, description, image, price, location, country} = req.body; 
    // let newListing = new Listing({
    //   title:title,
    //   description:description,
    //   image:image,
    //   price:price,
    //    location:location,
    //    country:country
    // });
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

// Edit rout
app.get("/listings/:id/edit", async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

// update rout 
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

// delete rout
app.delete("/listings/:id", async (req, res) =>{
   let {id} = req.params;
   let deleteListing = await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
   res.redirect("/listings");
});


app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});
