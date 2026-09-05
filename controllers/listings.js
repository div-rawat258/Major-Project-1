const Listing = require("../models/listing");
const mongoose = require("mongoose");

const isValidListingId = (id) => mongoose.isValidObjectId(id);
const ExpressError = require("../utils/expressError.js");

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
  res.render("index.ejs", {allListings});
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
    console.log(listing);
    res.render("shows.ejs", { listing });
};


module.exports.createListing = async (req,res,next) => {
   if(!req.body.listing) {
    throw new ExpressError(400,"send valid data");
   }
    const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;
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
    res.render("edit.ejs", { listing });
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