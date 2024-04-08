const express = require("express");
const router = express.Router();
const db = require("../dataBase/dataBase.js");
const functions = require("../helper/functions.js");
const { transporter } = require("../app.js");
// const { OAuth2Client } = require('google-auth-library');
// router.get('/google/callback', (req, res) => {
//   const authCode = req.query.code;

//   if (!authCode) {
//     return res.status(400).json({ error: 'Authorization code not provided' });
//   }

//   const CLIENT_ID = '920321232954-i49u0udl1v0rshs25rqefm91nc5lo98j.apps.googleusercontent.com'; 
//   const CLIENT_SECRET = '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';
//   const REDIRECT_URI = 'http://localhost:3000/auth/google/callback'; 

//   const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  
//   oauth2Client.getToken(authCode)
//     .then(tokens => {
//       const accessToken = tokens.credentials.access_token;
//       // Use the access token to fetch user information from Google APIs
//       // Once user information is obtained, you can proceed with authentication logic
//       // For example:
//       // const userDetails = await getUserDetails(accessToken);
//       // const user = await findOrCreateUser(userDetails);

//       // Redirect the user after successful authentication
//       res.redirect('/dashboard');
//     })
//     .catch(err => {
//       console.error('Error exchanging authorization code for tokens:', err);
//       res.status(500).json({ error: 'Failed to exchange authorization code for tokens' });
//     });
// });

router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const usernameExists = await functions.userNameExists(username, db);
    if (usernameExists) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const emailExists = await functions.checkEmailExists(email, db);
    if (emailExists) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const userId = await functions.insertNewUser(username, email, password, db);
    res.json({ success: true, userId });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post(
  "/check-username",
  functions.checkUsernameMiddleware,
  (req, res) => {
    const { username } = req.body;
    console.log(`Checking username ${username}`);

    functions
      .userNameExists(username, db)
      .then((result) => {
        // Process the result (check if username exists) and send a response
        if (result) {
          res.json({ exists: true });
        } else {
          // Username does not exist, you can perform additional actions here
          // For example, send a success message
          res.json({ exists: false, message: "Username does not exist" });
        }
      })
      .catch((error) => {
        console.error("Error checking username:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  }
);
router.post("/check-email", functions.checkEmailMiddleware, (req, res) => {
  const { email } = req.body;
  functions
    .checkEmailExists(email, db)
    .then((result) => {
      res.json({ exists: !!result });
    })
    .catch((error) => {
      console.error("Error checking email:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});
router.post("/send-email", async (req, res) => {
  const userEmail = req.body.email;

  try {
    console.log(`Auth API starting userEmail: ${userEmail}`);
    // Check if the email exists in the database
    const emailExists = await functions.checkEmailExists(userEmail, db);
    if (!emailExists) {
      return res.status(404).send("Email not found");
    }
    // Fetch username based on email
    const username = await functions.getUsername(userEmail);
    if (!username) {
      return res.status(404).json({success: false})
    }

    const password = await functions.getUserPassword(userEmail);
    console.log(`authAPI user password: ${password}`);
    if (password) {
      const mailOptions = {
        from: "einatexpressproject@gmail.com",
        to: userEmail,
        subject: "Pick-a-cook Password Recovery",
        text: `Dear ${username},\n\nYour password is ${password}`,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.error("Error occurred: ", err);
          res.status(500).json({success: false})
        } else {
          console.log("Email sent successfully: ", info.response);
          res.status(200).json({ success: true });;
        }
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error occurred: ", error);
    res.status(500).send("Password recovery failed");
  }
});




router.delete("/delete-user", (req, res) => {
  const { username } = req.body;

  // Validate the username (you may want to add more validation)
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }

  functions
    .deleteUser(username, db)
    .then((rowsAffected) => {
      res.json({ message: `${rowsAffected} row(s) deleted.` });
    })
    .catch((error) => {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});
router.post("/recover-password-username", (req, res) => {
  const { username } = req.body;

  // Fetch user's email based on the provided username
  getUserEmail(username)
    .then((email) => {
      // Check if the email is found
      if (email) {
        // TODO: Implement password recovery logic based on the user's email
        // You can use Nodemailer to send a recovery email here

        // For now, simulate success
        res.json({ success: true });
      } else {
        // If the email is not found, return an error
        res.status(404).json({ success: false, error: "User not found" });
      }
    })
    .catch((error) => {
      console.error("Error fetching user email:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    });
});
router.post("/recover-password-email", (req, res) => {
  const { email } = req.body;

  // Fetch user's email based on the provided username
  checkEmailExists(email, db)
    .then((result) => {
      if (result) {
        const mailOptions = {
          from: "einatexpressproject@gmail.com",
          to: email,
          subject: "Password Recovery",
          text: "Your password recovery link: http://your-recovery-link",
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            res
              .status(500)
              .json({ success: false, error: "Internal server error" });
          } else {
            console.log("Email sent: " + info.response);
            res.json({
              success: true,
              message: "Recovery email sent successfully",
            });
          }
        });
      } else {
        res.status(404).json({ success: false, error: "Email not found" });
      }
    })
    .catch((error) => {
      console.error("Error checking email:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { isCorrect, user } = await functions.isCorrectPassword(
      username,
      password
    );

    if (isCorrect) {
      console.log("Received login request:", req.body);
      delete user.password;
      res.json({ success: true, username: req.body.username, user });
      console.log("Login response sent.");
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
