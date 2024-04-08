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

const winston = require("winston");

const logger=winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports:[
    new winston.transports.File({filename:'server.log', create:true})
  ]
});


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
app.use((req, res, next) => {
  const logData = {
    type: 'incoming',
    route: req.originalUrl,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body
  };
  logger.info(logData);
  const originalSend = res.send;
  const originalJson = res.json;

  // Override the response.send function to log outgoing response
  res.send = function (...args) {
    const outgoingLogData = {
      type: 'outgoing',
      route: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      response: args[0]
    };
    logger.info(outgoingLogData);
    return originalSend.apply(res, args);
  };

  // Override the response.json function to log outgoing response
  res.json = function (...args) {
    const outgoingLogData = {
      type: 'outgoing',
      route: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      response: args[0]
    };
    logger.info(outgoingLogData);
    return originalJson.apply(res, args);
  };
  next();
});
// Authentication routes
app.use("/auth", require("./router/authApi.js"));
// blog routes
app.use("/blog", require("./router/blogApi.js"));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});