const User = require("../models/user.js");

module.exports.renderSignupForm =  (req, res)=>{
   return res.render("users/signup.ejs");
};

module.exports.signup= async(req, res, next) =>{
    try{ 
        let {username, email, password} = req.body;
        const newUser = new User({email, username}); 
        const registerUser = await User.register(newUser, password);

        req.login(registerUser, (err) =>{
        if(err){
                return next(err);
            }
            req.flash("success", "Welcome to wanderlust!");
            return res.redirect("/listings")  
        });
    } catch (e) {
        req.flash("error", e.message);
        return res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res)=>{
   return res.render("users/login.ejs");
};

module.exports.login = async(req, res) =>{
       req.flash("success", " wellcome back to wanderlust!");
       let redirectUrl = res.locals.redirectUrl || "/listings";
       return res.redirect( redirectUrl );
};

module.exports.logout = (req, res, next) =>{
    req.logout();
    req.flash("success", "You are logout now");
    res.redirect("/listings");
};
