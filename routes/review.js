const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { reviewSchema } = require("../schema.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, message);
    }
    next();
};


//post Review route

router.post(
    "/",
    validateReview,
    wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);     
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","New Review created !");  

    res.redirect(`/listings/${listing._id}`);
}));

//DELETE REVIEW route
router.delete("/reviews/:reviewId", 
wrapAsync(async (req, res) => {
let{ id,reviewId} = req.params;


await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
 await Review.findByIdAndDelete(reviewId);
    req.flash("success","New Review created !");  

 res.redirect(`/listings/${id}`);
})
);

module.exports = router;
// module.exports = { validateReview , wrapAsync};
