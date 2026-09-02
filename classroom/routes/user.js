const express = require("express");
const router =  express.Router();



router.get("/", (req,res) =>  {
    res.send("Get for show users");
});

//show - user
router.get("/:id", (req,res) =>  {
    res.send("Get for show users");
});

//post 
router.post("/", (req,res) =>  {
    res.send("POST for show users");
});

//DELETE 
router.delete("/:id", (req,res) =>  {
    res.send("Delete for show users");
});

module.exports = router;