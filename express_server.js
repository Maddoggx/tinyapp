
const { getUserByEmail } = require('./helpers.js');
const { generateRandomString } = require('./helpers.js');
const express = require("express");
const app = express();
const { urlsForUser } = require('./helpers.js');
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const PORT = 8080; 



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

app.use(cookieSession({
  name: 'session',
  keys: ['hdhiovc'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
// set the view engine to ejs
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req,res) => {
  const user = users[req.session.userID];
  const loggedInUser = users[user];
  if (!loggedInUser) return res.redirect("/login");
  if (loggedInUser) return res.redirect("/urls")
})

app.get("/urls", (req, res) => {
  const user = users[req.session.userID];
  if (!user) return res.status(401).send("PLEASE LOGIN");
  const urls = urlsForUser(user.id, urlDatabase);
  
  const templateVars = {
    urls,
    user
  };
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const user = req.session.userID;
  if (!user) return res.sendStatus(401);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user
  };
 console.log(req.session);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.userID];
  if (!user) return res.redirect('/login');
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]?.longURL;
  if (!longURL) {
    return res.status(400).send("Invalid URL!!!!");
  }
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(userID, urlDatabase);
  
  const templateVars = {
    shortURL, urlDatabase, userUrls,
    user: users[userID],
    longURL: urlDatabase[shortURL].longURL
  }
  if (!userID) res.redirect('/login');

  if (!urlDatabase[shortURL]) {
    res.status(404).send('urldatabase not found')
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get('/login', (req, res) => {
  const user = req.session.userID;
  if (user) {
    res.redirect("/urls")
  return;
} 
  const templateVars = { user: users[req.session.userID] };
  res.render('login', templateVars);
});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) return res.status(404).send("USER NOT FOUND");
  const user = getUserByEmail(email, users);
  if (!user) return res.status(401).send("User Not Found");
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userID = user.id;
  res.redirect("/urls");
  } else {
    return res.status(401).send("Wrong Password");

  }
});

app.get('/register', (req, res) => {
  const user = users[req.session.userID];
  if (user) return res.redirect("/urls");
  const templateVars = {
    shortURL: req.params.shortURL, longURL: req.params.longURL,
    user: req.session.userID ? users[req.session.userID] : null
  };
  // res.render = to load the web page on the client end.
  res.render('register', templateVars);
});
app.post('/register', (req, res) => {
 
  const { email, password } = req.body // destructerizing, requesting the email and password from the server.
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) return res.status(401).send("Please Register");
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
  req.session.userID = user_id;
  res.redirect('/urls');
});
app.get("/u/:id", (req, res) => {

})
app.post("/urls/:id", (req, res) => {
  const user = req.session.userID;
  const shortURL = req.params.id;
  if (user.id !== shortURL.userID) return res.status(401).send("NOT AUTHORIZED!!")
  if (!user) return res.redirect("/login")
  if (!shortURL) return res.status(400).send("ShortURL does not exist.");
  urlDatabase[req.params.id].longURL = req.body.longURL;

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.userID];
  const shortID = req.params.id;
  const shortURL = urlDatabase[req.params.id];

  if (!user) return res.sendStatus(401);
  if (!shortURL) return res.status(400).send("ShortURL does not exist.");
  if (user.id !== shortURL.userID) return res.status(401).send("NOT AUTHORIZED!!");
  delete urlDatabase[shortID];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
