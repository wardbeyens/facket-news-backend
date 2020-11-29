var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var slug = require("slug");

var User = mongoose.model("User");

var ArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, lowercase: true, unique: true },
    title: String,
    description: String,
    body: String,
    favoritesCount: { type: Number, default: 0 },
    tagList: [{ type: String }],
    status: {
      type: String,
      enum: ["review", "published", "draft"],
      default: "draft",
    },
    type: {
      type: String,
      enum: ["text", "markdown", "html"],
      default: "text",
    },
    picture: String,
    // section: {
    //   type: String,
    //   enum: [
    //     "artanddesign",
    //     "books",
    //     "business",
    //     "culture",
    //     "education",
    //     "environment",
    //     "fashion",
    //     "food",
    //     "games",
    //     "globaldevelopment",
    //     "law",
    //     "lifeandstyle",
    //     "media",
    //     "money",
    //     "music",
    //     "politics",
    //     "science",
    //     "society",
    //     "sport",
    //     "technology",
    //     "travel",
    //     "other",
    //   ],
    //   default: "other",
    // },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

ArticleSchema.plugin(uniqueValidator, { message: "Is already taken!" });

ArticleSchema.methods.slugify = function () {
  this.slug =
    slug(this.title) +
    "-" +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};

ArticleSchema.pre("validate", function (next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

ArticleSchema.methods.publish = function () {
  this.status = "published";
  return this.save();
};

ArticleSchema.methods.unpublish = function () {
  this.status = "review";
  return this.save();
};

ArticleSchema.methods.updateFavoriteCount = function () {
  var article = this;

  return User.count({ favorites: { $in: [article._id] } }).then(function (
    count
  ) {
    article.favoritesCount = count;

    return article.save();
  });
};

ArticleSchema.methods.toJSONFor = function (user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    section: this.section,
    type: this.type,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    status: this.status,
    picture:
      this.picture ||
      "https://media.istockphoto.com/vectors/breaking-news-newspaper-vector-id540113610",
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user),
  };
};

mongoose.model("Article", ArticleSchema);
