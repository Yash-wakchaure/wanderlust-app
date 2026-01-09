const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsmate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressErrors.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

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

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    }else{
        next();
    }
};

const validateReview = (req, res, next) =>{
     let {error} = reviewSchema.validate(req.body);
     if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
     }else{
        next();
     }
};

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
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

// create  rout 
app.post("/listings", validateListing , wrapAsync(async(req, res, next)=>{
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
   
}));

// Edit rout
app.get("/listings/:id/edit", wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

// update rout 
app.put("/listings/:id", validateListing , wrapAsync(async (req, res) => {
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

// Review
// Post review Rout
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) =>{
     let listing = await Listing.findById(req.params.id);
     let newReview = new Review(req.body.review);

     listing.reviews.push(newReview);

     await newReview.save();
     await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

// delete review route
app.delete("/listing/:id/reviews/:reviewId", wrapAsync(async(req, res) =>{
    let { id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

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







// listingSchema.Post("findOneAndDelete", async(listing) =>{
//     if(listing.reviews.length){
//         let res=await Review.deleteMany({_id:{$in:listing.reviews}})
//         console.log(res);
//     }
// });

// const del = async() =>{
//     await listing.findByIdAndDelete('68ff5525ed97ade34973dc88')
// };

// del();
