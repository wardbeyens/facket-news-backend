var mongoose = require("mongoose");

var SectionSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true }
);

// Requires population of author
SectionSchema.methods.toJSONFor = function () {
  return {
    id: this._id,
    name: this.name,
  };
};

mongoose.model("Section", SectionSchema);
