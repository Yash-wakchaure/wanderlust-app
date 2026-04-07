if(process.env.NODE_ENV != "production"){
     require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride= require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressErrors.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/booking.js");
// const router = require('./routes/listing.js');

let store;

const dbUrl = process.env.ATLASDB_URL;
async function main() {
   await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
   });
}

main().then(() =>{
    console.log("connected succesfully");

    // console.log("DB URL =", dbUrl);
  store = MongoStore.create({
     client: mongoose.connection.getClient(),
     crypto: {
      secret:process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", (err) =>{
    console.log("Error in mongo session store", err);
});



}).catch((err) =>{
    console.log(err);
});

app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsmate);
app.use(express.static(path.join(__dirname, "/public")));



// using session and cookie
const sessionOption = {
    store:store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOption));
app.use(flash());

//using passport and theire LocalStrategy for authentication  
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
     res.locals.successmsg = req.flash("success");
     res.locals.errormsg = req.flash("error");
     res.locals.currUser = req.user;
     next();
});

// app.get("/demoUser", async(req, res) =>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"Delat-student"
//     })
//     let registerUser = await User.register(fakeUser, "helloworld");
//     res.send(registerUser);
// });

// Routes
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
const contactRouter = require("./routes/contact.js");
app.use("/", contactRouter);
app.use("/", bookingRouter);
app.use("/", userRouter);

// ERROR Handler middleware
// not working this 
app.all('/{*splat}', (req, res, next) =>{
    next(new ExpressError( 404 , "page not Found!"))       
});            

// Error Handler
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);   // 🔥 critical line
    }

    let {statusCode=500, message="somthing went wrong!"} =err;
    res.status(statusCode).render("error.ejs", {err});
    // res.status(statusCode).send(message);s
})

const port = process.env.PORT || 8080;

app.listen(port, () =>{
    console.log(`server is listening to port ${port}`);
});

