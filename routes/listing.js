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
const {storage} = require("../cloudconfig.js");
const upload = multer({ storage});

const normalizeListingBody = (req, res, next) => {
    if (!req.body || typeof req.body !== "object") {
        return next();
    }

    const normalized = req.body.listing && typeof req.body.listing === "object"
        ? { ...req.body.listing }
        : {};

    for (const [key, value] of Object.entries(req.body)) {
        const match = key.match(/^listing\[(.+)\]$/);
        if (match) {
            normalized[match[1]] = value;
        }
    }

    if (req.file) {
        normalized.image = {
            url: req.file.path || req.file.url || `/uploads/${req.file.filename}`,
            filename: req.file.filename || req.file.originalname || "listingimage"
        };
    } else if (req.body.image && typeof req.body.image === "object") {
        normalized.image = req.body.image;
    } else if (req.body.image && typeof req.body.image === "string") {
        normalized.image = req.body.image;
    }

    req.body.listing = normalized;
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
    normalizeListingBody,
    validateListing,
    wrapAsync(listingController.createListing)
);

// New routes
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, normalizeListingBody, validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));



//edit routes
router.get("/:id/edit",isOwner, isLoggedIn,wrapAsync(listingController.renderEditform));


module.exports = router;