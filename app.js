const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride= require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressErrors.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// ERROR Handler middleware
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
