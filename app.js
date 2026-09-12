// const  express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const dotenv = require("dotenv");

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: path.join(__dirname, ".env") });
}

const  express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/expressError.js");
// const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const Listing = require("./models/listing.js");
const sampleListings = require("./init/data.js");

const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

// const MONGO_URL = process.env.ATLASTDB_URL;
const dbUrl = process.env.ATLASDB_URL;
main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
 await mongoose.connect(dbUrl);
}

mongoose.set("bufferCommands", true);

async function seedListings() {
    const count = await Listing.countDocuments();
    if (count === 0) {
        await Listing.insertMany(sampleListings.data);
        console.log("Seeded default listings");
    } else {
        console.log(`Listings already exist (${count} records found)`);
    }
}


// async function main() {
//     try {
//         await mongoose.connect( dbUrl, {
//             serverSelectionTimeoutMS: 5000,
//             socketTimeoutMS: 45000,
//         });
//         console.log("connected to DB");
//         await seedListings();
//     } catch (err) {
//         console.error(" mongoose Connection Error:", err.message);
//         throw err;
//     }
// }

app.set("view engine","ejs");
app.set("views", path.join(__dirname , "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
    secret: process.env.SECRET || "mysupersecretcode",
    resave:false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7* 24 * 60 * 60 * 1000,
        maxAge:7* 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) {
                return done(null, false, { message: "Incorrect username" });
            }
            const valid = user.validatePassword(password);
            if (!valid) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});


app.use((req,res,next) => {
res.locals.success = req.flash("success");
res.locals.error = req.flash("error");
res.locals.currUser = req.user;
next();
});


// app.get("/demouser",async(req,res) => {
//     let fakeUser = new User({
// email:"divyanshu@gmail.com",
// username:"delta-student",
//     });

//     let registeredUser = await User.register(fakeUser,"helloworld");
//  res.send("registeredUser");
// })

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.use((req,res,next) => {
    next(new ExpressError(404,"page is not found !"));
});

app.use((err,req,res,next) => {
    let {statusCode=500, message="something went wrong "} = err;
   
    res.status(statusCode).render("error.ejs", 
        { err: {statusCode, message} });
});

main()
    .then(() => {
        app.listen(8080, () => {
            console.log("server is listing to port 8080");
        });
    })
    .catch((err) => {
        console.error("DB startup failed:", err.message);
        process.exit(1);
    });