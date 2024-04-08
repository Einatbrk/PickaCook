PickaCook

PickaCook is a food blog platform where users can share recipes with each other. This project is primarily designed to practice Node.js. The server simulates interaction with the user based on the presence of the username in localStorage, as there is no active session holding such tokens.

Features: Authentication, Register, Login, Logout,Password Recovery, Blog Management, Upload Posts, Delete Posts, Update Posts, View all users' posts, View user-specific posts.

Technologies Used:

Node.js: The primary backend framework used for server-side development.
Express.js: Used for routing and handling HTTP requests.
jQuery: Utilized for content injection, simulating iframe functionality in a faster and more efficient manner.
SQLite3: Database management system for storing user data and blog posts.
Nodemailer: Module used for sending email for password recovery.

Installation
To install the necessary dependencies, run:

Copy code
npm install

Usage:
Register an account or login if you already have one.
Explore the platform by viewing all users' posts or filtering posts by the logged-in user.
Upload your own posts, update or delete existing ones.
Log out when done. Note that if the browser is closed, localStorage will be reset.
Try to get to my posts page when you are not logged in to your user account...
Also, find out what wil happen when you try to login while you are connected..

Dependencies
cors: Version 2.8.5
express: Version 4.18.2
node-fetch: Version 3.3.2
nodemailer: Version 6.9.13
sqlite3: Version 5.1.7
