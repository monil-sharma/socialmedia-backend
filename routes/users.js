const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

//Update user
router.put("/:id", async (req, res) => {
  if (req.body.userID === req.params.id || req.user.isAdmin) {
    //update password then->
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    //update rest of user information
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    res.status(405).json("You can update YOUR account only!");
  }
});

//Delete user
//Get a user
//Follow a user
//Unfollow a user
module.exports = router;
