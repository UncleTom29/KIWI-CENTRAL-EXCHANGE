const express = require("express");
const supportController = require("../controllers/support.controller");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const support = await supportController.listByUser(req.session.user._id);
  let supportCount = support.length;
  res.render("app/market", {
	layout: "app/layout",
    user: req.session.user,
    supportCount: support.length,
    supports: support,
  });
});

module.exports = router;
