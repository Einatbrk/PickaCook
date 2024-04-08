const express = require("express");
const router = express.Router();
const db = require("../dataBase/dataBase.js");
const functions = require("../helper/functions.js");


router.post("/uploadPost", functions.uploadPostMiddleware, (req, res) => {
  const timestamp = new Date().toISOString();
  const { username, title, ingredients, recipe, checkboxMarks } =
  req.body;

  functions
    .insertPost(title, ingredients, recipe, username, timestamp, checkboxMarks)
    .then((result) => {
      res.status(201).json({
        postData: {
          postId: result.postId,
          checkboxMarks: result.checkboxMarks,
          message: "Post uploaded successfully",
        },
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
});
router.get("/posts", (req, res) => {
  // Query the database to get all posts
  db.all("SELECT * FROM posts", (err, posts) => {
    if (err) {
      console.error("Error retrieving posts:", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } else {
      res.status(200).json({ success: true, posts: posts });
    }
  });
});
router.get("/allPosts", (req, res) => {
  // Query the database to get all posts from all users
  db.all(
    "SELECT posts.*, GROUP_CONCAT(checkbox_marks.mark_value) as checkboxes FROM posts INNER JOIN checkbox_marks ON posts.postId = checkbox_marks.postId GROUP BY posts.postId;",
    (err, posts) => {
      if (err) {
        console.error("Error retrieving posts:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else {
        res.status(200).json({
          success: true,
          posts: posts.map((p) => ({
            ...p,
            checkboxes: p.checkboxes.split(","),
          })),
        });
      }
    }
  );
});


router.get("/posts/:username", (req, res) => {
  // Query the database to get all posts
  const username = req.params.username;
  db.all(
    "SELECT posts.*, GROUP_CONCAT(checkbox_marks.mark_value) as checkboxes FROM posts, checkbox_marks WHERE posts.author = ? AND posts.postId = checkbox_marks.postId GROUP BY posts.postId;",
    [username],
    (err, posts) => {
      if (err) {
        console.error("Error retrieving posts:", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      } else {
        res.status(200).json({
          success: true,
          posts: posts.map((p) => ({
            ...p,
            checkboxes: p.checkboxes.split(","),
          })),
        });
      }
    }
  );
});

router.put("/posts/:postId", (req, res) => {
  const { postId } = req.params;
  const { title, ingredients, recipe, username, timestamp, checkboxMarks } =
    req.body;

  functions
    .updatePost(postId,title, ingredients, recipe, username, timestamp, checkboxMarks)
    .then((result) => {
      res.status(201).json({
        postData: {
          postId: result.postId,
          checkboxMarks: result.checkboxMarks,
          message: "Post uploaded successfully",
        },
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
});

router.delete("/posts/:postId", (req, res) => {
  const postId = req.params.postId;
  if (!postId) {
    return res.status(400).json({ error: "No postId provided" });
  }

  const sql = `DELETE FROM posts WHERE postId IN (SELECT postId FROM checkbox_marks WHERE postId = ?);
  DELETE FROM checkbox_marks WHERE postId = ?;`;

  db.run(sql, [postId], (err) => {
    if (err) {
      console.log("err", err);
      res.status(500).json({ success: false, err });
    } else {
      res.status(200).json({ success: true });
    }
  });
});
module.exports = router;
