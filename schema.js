const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().min(5).max(100).required(),
        description: Joi.string().trim().min(10).max(1000).required(),
        image: Joi.string().uri().allow(""),
        price: Joi.number().min(1).max(1000000).required(),
        location: Joi.string().trim().min(3).max(100).required(),
        country: Joi.string().trim().min(3).max(100).required(),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().trim().min(1).max(1000).required(),
    }).required(),
});