const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/expressError.js");

const { listingSchema } = require("../schema.js");

const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        throw new ExpressError(400, message);
    }
    next();
};

router.get("/", wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
  res.render("index.ejs", {allListings});
}));


// New routes
router.get("/new",isLoggedIn, (req, res) => {
  res.render("new.ejs");
});


//show routes
router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
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
}));

router.post("/", 
    validateListing, wrapAsync(async (req,res,next) => {
   if(!req.body.listing) {
    throw new ExpressError(400,"send valid data");
   }
    const newListing = new Listing(req.body.listing);
   newListing.owner = req.user._id;
       await newListing.save();
    req.flash("success","New Listing created !");  
     res.redirect("/listings");
}));


//edit routes
router.get("/:id/edit", isLoggedIn,wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
      if (!listing) {
        req.flash("error","listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("edit.ejs", { listing });
}));

//updates routes
router.put("/:id",isLoggedIn, validateListing, wrapAsync(async (req,res) => {
     if(!req.body.listing) {
    throw new ExpressError(400,"send valid data");
   }
    
    let {id} = req.params;
    
await Listing.findByIdAndUpdate(id,{...req.body.listing });
    req.flash("success","listing Update !");  

    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
 req.flash("success","Listing Deleted !");  

  res.redirect("/listings");
}));


module.exports = router;