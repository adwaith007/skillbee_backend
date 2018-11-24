const mongoose=require("mongoose");

const itischema=mongoose.Schema(
    {
        name: String,
        image: String
    }
);

module.exports= mongoose.model('Iti', itischema);