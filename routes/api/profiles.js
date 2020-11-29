var router = require("express").Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var auth = require("../auth");

router.param("username", function (req, res, next, username) {
  User.findOne({ username: username })
    .then(function (user) {
      if (!user) {
        return res.sendStatus(404);
      }
      req.profile = user;

      return next();
    })
    .catch(next);
});

router.get("/:username", auth.optional, function (req, res, next) {
  if (req.payload) {
    User.findById(req.payload.id).then(function (user) {
      if (!user) {
        return res.json({ profile: req.profile.toProfileJSONFor(false) });
      }

      return res.json({ profile: req.profile.toProfileJSONFor(user) });
    });
  } else {
    return res.json({ profile: req.profile.toProfileJSONFor(false) });
  }
});

router.post("/:username/follow", auth.required, function (req, res, next) {
  var profileId = req.profile._id;

  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.follow(profileId).then(function () {
        return res.json({ profile: req.profile.toProfileJSONFor(user) });
      });
    })
    .catch(next);
});

router.delete("/:username/follow", auth.required, function (req, res, next) {
  var profileId = req.profile._id;

  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.unfollow(profileId).then(function () {
        return res.json({ profile: req.profile.toProfileJSONFor(user) });
      });
    })
    .catch(next);
});

router.delete("/:username", auth.required, function (req, res, next) {
  User.findById(req.payload.id)
    .then(function (user) {
      if (!user || user.role !== "Admin") {
        return res.sendStatus(401);
      }

      if (req.profile.role === "Journalist") {
        return req.profile.softdelete().then(function () {
          return res.sendStatus(204);
        });
      } else {
        return res.sendStatus(403);
      }
    })
    .catch(next);
});

router.get("/", auth.required, function (req, res, next) {
  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      Promise.all([
        User.find({ role: { $in: "Journalist" } }).exec(),
        User.count({ role: { $in: "Journalist" } }),
      ]).then(function (results) {
        var profiles = results[0];
        var profilesCount = results[1];

        return res.json({
          profiles: profiles.map(function (profile) {
            return profile.toProfileJSONForALL();
          }),
          profilesCount: profilesCount,
        });
      });
    })
    .catch(next);
});

module.exports = router;
