const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.resolve(__dirname, "blog_platform.db");
const dbInstance = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the database.");
  }
});

dbInstance.serialize(() => {
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY,
      username TEXT,
      email TEXT,
      password TEXT
    )`);

  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS posts (
      postId INTEGER PRIMARY KEY,
      title TEXT,
      ingredients TEXT,
      recipe TEXT,
      author TEXT,
      date TEXT,
      FOREIGN KEY (author) REFERENCES users(userId)
    )`);
  dbInstance.run(`
  CREATE TABLE IF NOT EXISTS checkbox_marks (
    mark_id INTEGER PRIMARY KEY,
    postId INTEGER,
    mark_value TEXT,
    author INTEGER,
    FOREIGN KEY (postId) REFERENCES posts(postId),
    FOREIGN KEY (author) REFERENCES users(userId)
);
  `);
});
module.exports = dbInstance;
