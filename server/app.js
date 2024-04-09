const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "einatexpressproject@gmail.com",
    pass: "krji ttgm uxwr uvjm",
  },
});
module.exports.transporter = transporter;


const PORT = process.env.PORT || 3000;



const corsOptions = {
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "../client")));

// Authentication routes
app.use("/auth", require("./router/authApi.js"));
// blog routes
app.use("/blog", require("./router/blogApi.js"));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});