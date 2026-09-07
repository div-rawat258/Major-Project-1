const Listing = require("../models/listing");
const mongoose = require("mongoose");

const isValidListingId = (id) => mongoose.isValidObjectId(id);
const ExpressError = require("../utils/expressError.js");
const geocodeLocation = require("../utils/geocode.js");
const defaultImage = "https://tse4.mm.bing.net/th/id/OIP.w6u0CxTFj5mf_C9Ya_RBbwHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3";

const normalizeImageUrl = (image) => {
    if (!image) return defaultImage;
    if (typeof image === "string") return image;
    if (image && typeof image === "object" && typeof image.url === "string") return image.url;
    return defaultImage;
};

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    const safeListings = allListings.map((listing) => {
        const item = listing.toObject ? listing.toObject() : listing;
        item.image = normalizeImageUrl(item.image);
        return item;
    });
  res.render("index.ejs", {allListings: safeListings});
}

module.exports.renderNewForm = (req, res) => {
  res.render("new.ejs");
};

module.exports.geocode = async (req, res) => {
    const { location, country } = req.query;
    if (!location || location.trim().length < 3) {
        return res.status(400).json({ error: "Enter a location first" });
    }

    try {
        res.json(await geocodeLocation(location, country));
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};


module.exports.showListing = async (req,res) => {
    let {id} = req.params;
  if (!isValidListingId(id)) {
    req.flash("error", "listing you requested for does not exist");
    return res.redirect("/listings");
  }
    const listing = await Listing.findById(id)
    .populate({path:"reviews", populate:{
        path:"author",
    },
})
    .populate("owner");
    if (!listing) {
        req.flash("error","listing you requested for does not exist");
        return res.redirect("/listings");
    }

    if (!listing.coordinates) {
        try {
            listing.coordinates = await geocodeLocation(listing.location, listing.country);
            await listing.save();
        } catch (error) {
            console.error(`Unable to map listing ${listing._id}: ${error.message}`);
        }
    }

    const safeListing = listing.toObject ? listing.toObject() : listing;
    safeListing.image = normalizeImageUrl(safeListing.image);
    res.render("shows.ejs", { listing: safeListing });
};


module.exports.createListing = async (req,res,next) => {

  if(!req.body || !req.body.listing) {
    throw new ExpressError(400,"send valid data");
   }

   const url = req.file ? req.file.path : req.body.listing.image;
   const filename = req.file ? req.file.filename : undefined;

   const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;

    try {
        newListing.coordinates = await geocodeLocation(newListing.location, newListing.country);
    } catch (error) {
        throw new ExpressError(400, `Map location error: ${error.message}`);
    }

   if (req.file) {
      newListing.image = { url, filename };
   }

   await newListing.save();
   req.flash("success","New Listing created !");
   res.redirect("/listings");
};

module.exports.renderEditform = async (req,res) => {
    let {id} = req.params;
    if (!isValidListingId(id)) {
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error","listing you requested for does not exist");
        return res.redirect("/listings");
    }

    const safeListing = listing.toObject ? listing.toObject() : listing;
    safeListing.image = normalizeImageUrl(safeListing.image);

    let originalImageUrl = normalizeImageUrl(safeListing.image);
    if (typeof originalImageUrl === "string") {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    }

    res.render("edit.ejs", {
        listing: safeListing,
        originalImageUrl: originalImageUrl || normalizeImageUrl(safeListing.image),
    });
};

module.exports.updateListing = async (req,res) => {
     if(!req.body || !req.body.listing) {
    throw new ExpressError(400,"send valid data");
   }

    let {id} = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "listing you requested for does not exist");
        return res.redirect("/listings");
    }

    listing.set(req.body.listing);

    const locationChanged = listing.isModified("location") || listing.isModified("country");
    if (locationChanged || !listing.coordinates) {
        try {
            listing.coordinates = await geocodeLocation(listing.location, listing.country);
        } catch (error) {
            throw new ExpressError(400, `Map location error: ${error.message}`);
        }
    }

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await listing.save();
    req.flash("success","listing Update !");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
 req.flash("success","Listing Deleted !");  

  res.redirect("/listings");
};