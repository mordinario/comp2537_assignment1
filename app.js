/*
Goals:
- Simple website
- Node.js + MongoDB
- Express

- If user successfully authenticates
  (correct email and password),
  new session to store the user's info
  - A user is "logged in" if
    they have a valid session
- The encrypted session information is
  stored in a MongoDB session database 
  for 1 hour (and expires after)
  - If a user is not logged in,
    they can't see the members page
- We take in input from the user to
  capture account information and ask
  for log in
  - Properly deal with NoSQL injection
    attacks
- .env file to store encryption secrets
  and MongoDB database credentials
  - DO NOT STORE PASSWORDS IN THE GIT REPO
- Host the site on Render

User stories:
- As a user, I want to be able to 
  sign up for a new account so that 
  I can access the members only area. 
- As a user, I want to be able to
  sign in to my existing account so that
  I can access the members only area. 
- As a user, I want to be able to
  sign out of my account so that 
  nobody else can access it. 
- As a user, I want to see a home page 
  with the options to sign up or sign in
  if I am not currently logged in.
- As a user, I want to see a home page
  welcoming me and showing me the option
  to go to the members only area and sign
  out if I am currently logged in. 
- As a user, I want to be able to see a
  random image when I access the members
  only area so that it is more 
  visually interesting. 
- As a user, I want to be informed if the
  username or password I entered is
  incorrect when signing in so that I can
  correct the mistake.
*/

// Three things:
// - dependencies
// - port
// - app

// ----- Dependencies -----
// (also installed with "npm i ___")
const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');

// ----- Port -----
// (pick the first if it exists,
//  pick the second if it doesn't)
const port = process.env.PORT || 3000;

// ----- App -----
const app = express();

// Create temporary "database"
// (taken from COMP2537 example)
var users = [];

// Pick amount of hash rounds to
// hash the passwords
const saltRounds = 12;

// allows req.body parsing
app.use(express.urlencoded({extended: false}));
// Sets root folder
app.use(express.static(__dirname + "/public"));

// Returns true if a given username is
// in the "database", else false
function inDatabase(username, password)
{
    for(i = 0; i < users.length; i++)
    {
        if(users[i].username == username &&
           users[i].password == password)
        {
            return true;
        }
    }
    return false;
}

// App stuff
app.get('/', (req,res) => {
    // how it works in 1537
    let doc = fs.readFileSync("./public/html/main.html", "utf8");
    res.send(doc);
});

app.get('/login', (req,res) => {
    let doc = fs.readFileSync("./public/html/login.html", "utf8");
    res.send(doc);
});

// add user to "database"
// (taken from 2537)
app.post('/addUser', (req,res) => {
    // Get username and password
    var username = req.body.username;
    var password = req.body.password;
    // Create HTML page
    var pagehtml = "";
    var usershtml = "";

    // If username and password not in database,
    // add them
    if(!inDatabase(username, password))
    {
        // Hash password and
        // Push to "database"
        var hashedPassword = bcrypt.hashSync(password, saltRounds);
        users.push({username: username, password: hashedPassword});
        // State new account made
        pagehtml += "<p>New account!</p>"
    }
    // Else, log them in
    else
    {
        pagehtml += "<p>Logged in!</p>";
    }
    // Load every other user in the page,
    // showing username and (hashed) password
    for (i = 0; i < users.length; i++) {
        usershtml += "<li>";
        usershtml += users[i].username + ": " + users[i].password
        usershtml += "</li>";
    }
    pagehtml += "<ul>" + usershtml + "</ul>";
    res.send(pagehtml);
});

// At end of file
// (taken from express docs)
app.use((req, res) => {
    res.status(404).send("Page not found");
  });

// Listen
app.listen(port, () => {
    console.log("heyyy check out port " + port);
});