const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};



module.exports.signup =  async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            req.flash("error", "All fields are required");
            return res.redirect("/signup");
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            req.flash("error", "Username or email already exists");
            return res.redirect("/signup");
        }

        const newUser = new User({ username, email });
        newUser.setPassword(password);
        await newUser.save();

        req.login(newUser, (err) => {
            if (err) {
                                return next(err);
            }
                        req.flash("success", "Welcome to Wanderlust");
                        return res.redirect("/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login =  async (req, res) => {
        req.flash("success", "Welcome back!");
   let redirectUrl =   res.locals.redirectUrl || "listings";
        res.redirect(redirectUrl);
    };

    module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err) {
          return  next(err);
        }
        req.flash("success","you are logged out! ");
        res.redirect("/listings");
    });
    }