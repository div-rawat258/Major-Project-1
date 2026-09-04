const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema ({
    title: {
        type: String,
        required: [true, "Title is required"],
        minlength: [5, "Title must be at least 5 characters long"],
        maxlength: [100, "Title cannot exceed 100 characters"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minlength: [10, "Description must be at least 10 characters long"],
        maxlength: [1000, "Description cannot exceed 1000 characters"],
        trim: true
    },
    image: {
        type: String,
        default: "https://tse4.mm.bing.net/th/id/OIP.w6u0CxTFj5mf_C9Ya_RBbwHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
        set: (v) => v === "" ? "https://tse4.mm.bing.net/th/id/OIP.w6u0CxTFj5mf_C9Ya_RBbwHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" : v,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+\..+/.test(v);
            },
            message: "Image must be a valid URL"
        }
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [1, "Price must be greater than 0"],
        max: [1000000, "Price cannot exceed 1000000"]
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        minlength: [3, "Location must be at least 3 characters long"],
        maxlength: [100, "Location cannot exceed 100 characters"],
        trim: true
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        minlength: [3, "Country must be at least 3 characters long"],
        maxlength: [100, "Country cannot exceed 100 characters"],
        trim: true
    },
    reviews: [{
        type:Schema.Types.ObjectId,
        ref:"Review",
    },
    ],
        owner: {
            type: Schema.Types.ObjectId,
            ref:"User",
        },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        const Review = require("./review.js");
        await Review.deleteMany({_id :  {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema)
module.exports = Listing;
