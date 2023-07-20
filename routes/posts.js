const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //find post by post ID
    if (post.userID === req.body.userID) {
      //in above condition check whether the userID in post and the userID of the user match
      await post.updateOne({ $set: req.body }); //update post
      res.status(200).json("Update successfull");
    } else {
      res.status(403).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //find post by post ID
    if (post.userID === req.body.userID) {
      //in above condition check whether the userID in post and the userID of the user match
      await post.deleteOne(); //delete the post
      res.status(200).json("Post successfully deleted");
    } else {
      res.status(403).json("You can delete only YOUR post!");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});
// like a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //find post by ID
    if (!post.likes.includes(req.body.userID)) {
      await post.updateOne({ $push: { likes: req.body.userID } }); //push ID of user in likes array of post
      res.status(200).json("Liked the post");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userID } });
      res.status(200).json("Unliked the post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
// get timeline posts where we will get all posts of the users that are being followed
router.get("/timeline/all", async (req, res) => {
  // let postArray = [];
  try {
    console.log("a1a");
    const currentUser = await User.findById(req.body.userID);
    console.log("b2b");
    const userPosts = await Post.find({ userID: currentUser._id }); //find all post by the current user
    console.log("c3c");
    const friendPosts = await Promise.all(
      //find all the users in followings of current user and find all those users' posts
      currentUser.followings.map((friendID) => {
        console.log("d4d");
        return Post.find({ userID: friendID });
      })
    );
    console.log("e5e");
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
