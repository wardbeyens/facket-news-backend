var router = require("express").Router();
var mongoose = require("mongoose");
var Section = mongoose.model("Section");
var auth = require("../auth");

// Preload article objects on routes with ':article'
router.param("section", function (req, res, next, sectionname) {
  Section.findOne({ name: sectionname })
    .then(function (sect) {
      if (!sect) {
        return res.sendStatus(404);
      }
      req.sect = sect;
      return next();
    })
    .catch(next);
});

router.get("/", auth.optional, function (req, res, next) {
  Section.find()
    .then(function (sections) {
      return res.json({ sections: sections });
    })
    .catch(next);
});

// return a article
router.get("/:section", auth.required, function (req, res, next) {
  return res.json({ section: req.sect.toJSONFor() });
});

router.post("/", auth.required, function (req, res, next) {
  User.findById(req.payload.id)
    .then(function (user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var section = new Section(req.body.section);

      return section.save().then(function () {
        return res.json({ section: section.toJSONFor() });
      });
    })
    .catch(next);
});

module.exports = router;
