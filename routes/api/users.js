var mongoose = require("mongoose");
var router = require("express").Router();
var passport = require("passport");
var User = mongoose.model("User");
var auth = require("../auth");

router.post("/users", async (req, res, next) => {
  var user = new User();
  user.username = req.body.user.username;
  user.email = req.body.user.email;

  await user.setPassword(req.body.user.password);

  if (typeof req.body.user.bio !== "undefined") {
    user.bio = req.body.user.bio;
  }
  if (typeof req.body.user.image !== "undefined") {
    user.image = req.body.user.image;
  }

  user
    .save()
    .then(() => {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

router.post("/users/journalist", async (req, res, next) => {
  var user = new User();
  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.role = "Journalist";

  await user.setPassword(req.body.user.password);

  if (typeof req.body.user.bio !== "undefined") {
    user.bio = req.body.user.bio;
  }
  if (typeof req.body.user.image !== "undefined") {
    user.image = req.body.user.image;
  }

  user
    .save()
    .then(() => {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

router.post("/users/login", function (req, res, next) {
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "Can't be blank" } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "Can't be blank" } });
  }

  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }

      if (user) {
        user.token = user.generateJWT();
        return res.json({ user: user.toAuthJSON() });
      } else {
        return res.status(422).json(info);
      }
    }
  )(req, res, next);
});

router.get("/user", auth.required, function (req, res, next) {
  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return res.json({ user: user.toAuthJSON() });
    })
    .catch(next);
});

router.get("/user/extra", auth.required, function (req, res, next) {
  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return res.json({ user: user.toAuthJSONextra() });
    })
    .catch(next);
});

router.put("/user", auth.required, function (req, res, next) {
  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== "undefined") {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.bio !== "undefined") {
        user.bio = req.body.user.bio;
      }
      if (typeof req.body.user.image !== "undefined") {
        user.image = req.body.user.image;
      }
      if (typeof req.body.user.password !== "undefined") {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(function () {
        return res.json({ user: user.toAuthJSON() });
      });
    })
    .catch(next);
});

module.exports = router;
