const mongoose=require("mongoose");

const courseschema=mongoose.Schema(
    {
        name: String,
        duration: Number
    }
);

module.exports= mongoose.model('Course', courseschema);