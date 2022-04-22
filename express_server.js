const generateRandomString = function() {
  let string = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   for (let i = 0; i < 6; i++) {
     string += char.charAt(Math.random() * char.length)
   }
    return string; 
};


const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// set the view engine to ejs
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
const { cookie } = require("express/lib/response");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
 // if (req.cookies) {const username = req.cookies.username}
  const templateVars = { urls: urlDatabase,
    username: req.cookies ? req.cookies.username : null };
    console.log(req.cookies["username"]);

  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase,
    username: req.cookies ? req.cookies.username : "", };
    res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
    // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`);      
   res.send("Ok")// Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect("/urls")
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL,
    username: req.cookies ? req.cookies.username : "", };
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
res.cookie('username', req.body.username)
res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie('username', {path: '/'});
    res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
