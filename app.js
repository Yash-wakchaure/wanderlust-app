const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");

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
app.get("/listings",wrapAsync( async (req, res) =>{
    const allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings}); 
}));

// New route for adding new listing 
app.get("/listings/new",wrapAsync(async(req, res, next) =>{
   
    res.render("listings/new.ejs"); 
}));

// show rout which shows the all details about the list
app.get("/listings/:id", wrapAsync(async (req, res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

// create  rout 
app.post("/listings", wrapAsync(async(req, res, next)=>{
      // let {title, description, image, price, location, country} = req.body; 
    // let newListing = new Listing({
    //   title:title,
    //   description:description,
    //   image:image,
    //   price:price,
    //    location:location,
    //    country:country
    // });
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
   
}));

// Edit rout
app.get("/listings/:id/edit", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// update rout 
app.put("/listings/:id", wrapAsync(async (req, res) => {
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// delete rout
app.delete("/listings/:id", wrapAsync(async (req, res) =>{
   let {id} = req.params;
   let deleteListing = await Listing.findByIdAndDelete(id);
   console.log(deleteListing);
   res.redirect("/listings");
}));

// not working this 
app.all('/{*splat}', (req, res, next) =>{
    next(new ExpressError( 404 , "page not Found!"))       
});            

app.use((err, req, res, next) => {
    let {statusCode=500, message="somthing went wrong!"} =err;
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);s
})


app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});
