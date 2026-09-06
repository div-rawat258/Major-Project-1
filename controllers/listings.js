const Listing = require("../models/listing");
const mongoose = require("mongoose");

const isValidListingId = (id) => mongoose.isValidObjectId(id);
const ExpressError = require("../utils/expressError.js");
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
    const safeListing = listing.toObject ? listing.toObject() : listing;
    safeListing.image = normalizeImageUrl(safeListing.image);
    res.render("shows.ejs", { listing: safeListing });
};


module.exports.createListing = async (req,res,next) => {

  if(!req.body.listing) {
    throw new ExpressError(400,"send valid data");
   }
let url = req.file.path;
let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;
    newListing.image = {url,filename};
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
    res.render("edit.ejs", { listing: safeListing });
};

module.exports.updateListing = async (req,res) => {
     if(!req.body.listing) {
    throw new ExpressError(400,"send valid data");
   }
    
    let {id} = req.params;
    
await Listing.findByIdAndUpdate(id,{...req.body.listing });
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