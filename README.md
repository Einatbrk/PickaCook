P i c k a C o o k 
Pick a cook is a food blog platform where users able to share recipes with each other. 
Since this project ment to practice Node.js,The server simulates interaction with the user based on the presence of the username in localStorage and there is no Active session holding such Tokens for that reason. 
APIS mostly refferes to Authentication and Blog routes using express routing,
in order to avoid heavy website and iframes, The use of jQuery for the content injector is designed to simulate iframe functionality in a faster, easier and more efficient way.
What user can perform?
Register,Login,Logout,Upload Posts, Delete Posts, Update Posts, watch all users posts, watch his posts only and password recovering.
NOTICE: if user close browser localStorage will reset.


dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "node-fetch": "^3.3.2",
    "nodemailer": "^6.9.13",
    "sqlite3": "^5.1.7"



