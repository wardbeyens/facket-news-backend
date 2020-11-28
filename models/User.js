var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var jwt = require("jsonwebtoken");
var secret = require("../config").secret;
var bcrypt = require("bcrypt");

var UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "Can not be empty!"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "Can not be empty!"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true,
    },
    role: {
      type: String,
      enum: ["User", "Journalist", "Admin"],
      default: "User",
    },
    bio: String,
    image: String,
    password: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
  },
  { timestamps: true }
);
UserSchema.plugin(uniqueValidator, { message: "is already taken." });

UserSchema.methods.setPassword = async function (password) {
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);
  this.password = hash;
};

UserSchema.methods.validPassword = function (candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};
UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      role: this.role,
      exp: parseInt(exp.getTime() / 1000),
    },
    secret
  );
};

UserSchema.methods.toProfileJSONFor = function (user) {
  return {
    username: this.username,
    bio: this.bio,
    role: this.role,
    image:
      this.image || "https://static.productionready.io/images/smiley-cyrus.jpg",
    following: user ? user.isFollowing(this._id) : false,
  };
};

UserSchema.methods.toAuthJSON = function () {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    role: this.role,
    image:
      this.image || "https://static.productionready.io/images/smiley-cyrus.jpg",
  };
};

UserSchema.methods.toAuthJSONextra = function () {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    role: this.role,
    image: this.image,
    favorites: this.favorites,
    following: this.following,
  };
};

UserSchema.methods.favorite = function (id) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites = this.favorites.concat([id]);
  }
  return this.save();
};

UserSchema.methods.unfavorite = function (id) {
  this.favorites.remove(id);
  return this.save();
};

UserSchema.methods.isFavorite = function (id) {
  return this.favorites.some(function (favoriteId) {
    return favoriteId.toString() === id.toString();
  });
};

UserSchema.methods.follow = function (id) {
  if (this.following.indexOf(id) === -1) {
    this.following = this.following.concat([id]);
  }

  return this.save();
};

UserSchema.methods.unfollow = function (id) {
  this.following.remove(id);
  return this.save();
};

UserSchema.methods.isFollowing = function (id) {
  return this.following.some(function (followId) {
    return followId.toString() === id.toString();
  });
};

mongoose.model("User", UserSchema);
