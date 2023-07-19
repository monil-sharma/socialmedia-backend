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
router.put("/:id/follow", async (req, res) => {
  if (req.body.userID !== req.params.id) {
    //checking if the target and current user are not same
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userID);
      if (!user.followers.includes(req.body.userID)) {
        await user.updateOne({ $push: { followers: req.body.userID } }); //current user added as follower of target user
        await currentUser.updateOne({ $push: { followings: req.params.id } }); //target user is added in followings of the current user
        res.status(200).json("Started to follow user");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot follow yourself!");
  }
});
//Unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userID !== req.params.id) {
    //checking if the target and current user are not same
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userID);
      if (user.followers.includes(req.body.userID)) {
        //above condition checks if current user follows target user
        await user.updateOne({ $pull: { followers: req.body.userID } }); //current user removed from follower of target user
        await currentUser.updateOne({ $pull: { followings: req.params.id } }); //target user is removed from followings of the current user
        res.status(200).json("Unfollowed user");
      } else {
        res.status(403).json("You don't follow this user in the first place");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot unfollow yourself!");
  }
});
module.exports = router;
