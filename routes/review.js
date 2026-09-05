const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");

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

const reviewController = require("../controllers/reviews.js");

//post Review route

router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync( reviewController.createReview ));

//DELETE REVIEW route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor,
wrapAsync(reviewController.destroyReview)
);

module.exports = router;
// module.exports = { validateReview , wrapAsync};
