const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");

const { listingSchema } = require("../schema.js");

const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const upload = multer({ dest: path.join(__dirname, "../public/uploads") });

const setUploadedImage = (req, res, next) => {
    if (req.file) {
        req.body.listing = req.body.listing || {};
        req.body.listing.image = `/uploads/${req.file.filename}`;
    }
    next();
};


const validateListing = (req, res, next) => {
    const { error, value } = listingSchema.validate(req.body, { convert: true });
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, message);
    }
    req.body = value;
    next();
};

router
.route("/")
.get(wrapAsync(listingController.index))
.post(
    isLoggedIn,
    upload.single("listing[image]"),
    setUploadedImage,
    validateListing,
    wrapAsync(listingController.createListing)
);

// New routes
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



//edit routes
router.get("/:id/edit",isOwner, isLoggedIn,wrapAsync(listingController.renderEditform));


module.exports = router;