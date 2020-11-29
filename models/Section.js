var mongoose = require("mongoose");
var Article = mongoose.model("Article");

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
    createdAt: this.createdAt,
  };
};

SectionSchema.pre("remove", function (next) {
  // 'this' is the client being removed. Provide callbacks here if you want
  // to be notified of the calls' result.
  Article.remove({ section: this._id }).exec();
  next();
});

mongoose.model("Section", SectionSchema);
