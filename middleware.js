const Listing = require("./models/listing.js");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req,res,next) => {
    if(! req.isAuthenticated ()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be looged in to create listing !");
         return res.redirect("/login");
}
next();
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl =  req.session.redirectUrl;

        
    }
    next();
};

module.exports.isOwner = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in first.");
        return res.redirect("/login");
    }
    Listing.findById(req.params.id).then((listing) => {
        if(!listing || !listing.owner || !listing.owner.equals(req.user._id)) {
            req.flash("error", "You do not have permission to do that.");
            return res.redirect(`/listings/${req.params.id}`);
        }
        next();
    }).catch(next);
};

module.exports.ValidateListing = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in first.");
        return res.redirect("/login");
    }
    next();
};

module.exports.isReviewAuthor = async(req,res,next) => {
    const review = await Review.findById(req.params.reviewId);
    if(!review || !review.author || !review.author.equals(req.user._id)) {
        req.flash("error", "You are not the author of this review.");
        return res.redirect(`/listings/${req.params.id}`);
    }
    next();
};