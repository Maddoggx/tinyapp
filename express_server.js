const generateRandomString = function () {
  let string = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    string += char.charAt(Math.random() * char.length)
  }
  return string;
};

const urlsForUser = function (userID) {
  const urls = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id].userID === userID) {
      // urls[id] creating a new key value pair
      urls[id] = urlDatabase[id];
    }
  }
  return urls;
}

//const saltRounds = 10;
//const plainTextPassword1 = "DFGh5546*%^__90";
const { getUserByEmail } = require('./helpers.js')
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.use(cookieSession({
  name: 'session',
  keys: ['hdhiovc'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};
// set the view engine to ejs
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const { cookie } = require("express/lib/response");

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) return res.redirect('/login');
  //status(401).send("Not logged in.");
  const urls = urlsForUser(user.id);

  // if (req.cookies) {const username = req.cookies.username}
  const templateVars = {
    urls,
    user
  };
  console.log(req.session["user_id"]);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) return res.redirect('/login');
  // res.status(401).send("You need to be logged in");
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // "?." The optional chaining operator (?.) enables you to read the value of a property located deep within a chain of connected objects without having to check that each reference in the chain is valid.
  const longURL = urlDatabase[shortURL]?.longURL;
  if (!longURL) {
    return res.status(400).send("Invalid URL!!!!");
  }
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) return res.redirect("/login")
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) return res.status(400).send("ShortURL does not exist.")
  if (user.id !== shortURL.userID) return res.status(401).send("NOT AUTHORIZED!!")
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
    user
  };
  res.render("urls_show", templateVars);
});

app.get('/login', (req, res) => {
  //const user = users[req.cookies.user_id];
  //if (user) return res.redirect('/urls')
  const templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  if (user) return res.redirect("/urls")
  const templateVars = {
    shortURL: req.params.shortURL, longURL: req.params.longURL,
    user: req.session.user_id ? users[req.session.user_id] : null
  };
  // res.render = to load the web page on the client end.
  res.render('register', templateVars);
});

app.post('/urls', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) return res.sendStatus(401);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user.id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`)
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) return res.redirect("/login")
  const shortURL = urlDatabase[req.params.id];
  if (!shortURL) return res.status(400).send("ShortURL does not exist.")
  if (user.id !== shortURL.userID) return res.status(401).send("NOT AUTHORIZED!!")
  urlDatabase[req.params.id].longURL = req.body.longURL;

  res.redirect("/urls")
});

app.post('/register', (req, res) => {
  //const { email, password } = req.body // destructerizing, requesting the email and password from the server.
  const { email, password } = req.body // destructerizing, requesting the email and password from the server.
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  
  if (!email || !password) return res.sendStatus(400);
  const user = getUserByEmail(email, users);
  if (user) return res.status(403).send('Account already exists.')

  const user_id = generateRandomString(); // creates random id for each user.
  // create new user / add new item to users object
  users[user_id] = {
    id: user_id,
    email: email,
    password: hashedPassword
  }
  // setting a cookie that will contain the user's newly generated ID
  req.session.user_id = user_id;
  console.log(users);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  const user = getUserByEmail(email, user);
  if (!email || !password) return res.sendStatus(400)

  if (!user) return res.sendStatus(403)

  //if (password !== user.password) return res.sendStatus(401)
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).send("invalid password");

  req.session.user_id = user_id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id];
  const shortID = req.params.id;
  if (!user) return res.sendStatus(401);
  const shortURL = urlDatabase[req.params.id];
  if (!shortURL) return res.status(400).send("ShortURL does not exist.")
  if (user.id !== shortURL.userID) return res.status(401).send("NOT AUTHORIZED!!")
  delete urlDatabase[shortID];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/*
app.post("/urls", (req, res) => {
  //console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
    // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);      
   //res.send("Ok")// Respond with 'Ok' (we will replace this)
});
*/