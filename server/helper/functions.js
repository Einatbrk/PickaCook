var db = require("../dataBase/dataBase.js");
const fetch = import("node-fetch");

function checkEmailExists(email, db) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function userNameExists(username, db) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}
function insertNewUser(username, email, password, db) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO users (username, email, password) VALUES (?,?,?)";
    db.run(sql, [username, email, password], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}
function checkUsernameMiddleware(req, res, next) {
  const { username } = req.body;
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }
  functions
    .userNameExists(username, db)
    .then((result) => {
      if (result) {
        return res.status(409).json({ error: "Username already exists" });
      }

      next();
    })
    .catch((error) => {
      console.error("Error checking username:", error);
      return res.status(500).json({ error: "Internal server error" });
    });
}

function uploadPostMiddleware(req, res, next) {
  const { username, title, ingredients, recipe, checkboxMarks } = req.body;
  const timestamp = new Date().toISOString();

  if (!username) {
    return res.status(400).json({ error: "Username is missing" });
  }

  req.postData = {
    username,
    title,
    ingredients,
    recipe,
    checkboxMarks: checkboxMarks || [],
    timestamp,
  };
  next();
}
function checkEmailMiddleware(req, res, next) {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email" });
  }

  functions
    .checkEmailExists(email, db)
    .then((result) => {
      if (result) {
        return res.status(409).json({ error: "Email already exists" });
      }
      next();
    })
    .catch((error) => {
      console.error("Error checking email:", error);
      return res.status(500).json({ error: "Internal server error" });
    });
}

function isCorrectPassword(username, password) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.get(sql, [username, password], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve({ isCorrect: !!row, user: row });
      }
    });
  });
}

function getUserEmail(username) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT email FROM users WHERE username = ?";
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.email : null);
      }
    });
  });
}
function getUsername(email) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT username FROM users WHERE email=?";
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.username : null);
      }
    });
  });
}

function getUserPassword(email) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT password FROM users WHERE email=?";
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.password : null);
      }
    });
  });
}


function insertPost(
  title,
  ingredients,
  recipe,
  username,
  timestamp,
  checkboxMarks
) {
  const data = {
    title,
    ingredients,
    recipe,
    username,
    timestamp,
    checkboxMarks,
  };

  return new Promise((resolve, reject) => {
    const insertPostQuery =
      "INSERT INTO posts (title, ingredients, recipe, author, date) VALUES (?, ?, ?, ?, ?)";
    const CB = checkboxMarks;
    db.run(
      insertPostQuery,
      [title, ingredients, recipe, username, timestamp],
      function (err) {
        if (err) {
          reject(err);
          console.error("Error inserting post:", err);
        } else {
          const postId = this.lastID;

          if (
            checkboxMarks &&
            Array.isArray(checkboxMarks) &&
            checkboxMarks.length > 0
          ) {
            const marksInsertQuery =
              "INSERT INTO checkbox_marks (postId, mark_value, author) VALUES (?, ?, ?)";
            checkboxMarks.forEach((mark) => {
              db.run(marksInsertQuery, [postId, mark], function (err) {
                if (err) {
                  reject(err);
                  console.error("Error inserting array post:", err);
                } else {
                  console.log("PostId and mark: ", postId, mark);
                }
              });
            });
          }

          resolve({ postId, checkboxMarks });
        }
      }
    );
  });
}

function updatePost(
  postId,
  title,
  ingredients,
  recipe,
  username,
  timestamp,
  checkboxMarks
) {
  return new Promise((resolve, reject) => {
    const updatePostQuery =
      "UPDATE posts SET title=?, ingredients=?, recipe=?, author=?, date=? WHERE postId = ?";
    db.run(
      updatePostQuery,
      [title, ingredients, recipe, username, timestamp, postId],
      function (err) {
        if (err) {
          console.error("Error updating post:", err);
          reject(err);
        } else {
          resolve({ postId, checkboxMarks });
        }
      }
    );
  });
}


module.exports = {
  insertNewUser,
  checkUsernameMiddleware,
  checkEmailMiddleware,
  userNameExists,
  checkEmailExists,
  getUsername,
  getUserEmail,
  isCorrectPassword,
  insertPost,
  uploadPostMiddleware,
  updatePost,
  getUserPassword
};
