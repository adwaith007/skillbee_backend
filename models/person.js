const mongoose=require("mongoose");

const personschema=mongoose.Schema(
    {
        name: String,
        picture: String,
        experience: Number,
        year:Number,
        course: {type: mongoose.Schema.Types.ObjectId, ref: "Course"},
        iti: {type: mongoose.Schema.Types.ObjectId, ref: "Iti"},
        job: String
    }
);

module.exports= mongoose.model('person', personschema);