const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { json } = require("express");

//Update user
router.put("/:id", async (req, res) => {
  if (req.body.userID === req.params.id || req.body.isAdmin) {
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
router.delete("/:id", async (req, res) => {
  if (req.body.userID === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    res.status(405).json("You can delete YOUR account only!");
  }
});

//Get a user
router.get("/:id", async (req, res) => {
  if (req.body.userID === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findById(req.params.id);
      const { password, createdAt, updatedAt, __v, ...other } = user._doc; //here we filter out which fields we will display
      res.status(200).json(other);
    } catch (err) {
      return res(500).json(err);
    }
  }
});

//Follow a user
//Unfollow a user
module.exports = router;
