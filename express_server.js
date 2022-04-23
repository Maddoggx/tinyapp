const generateRandomString = function() {
  let string = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   for (let i = 0; i < 6; i++) {
     string += char.charAt(Math.random() * char.length)
   }
    return string; 
};
 const getUserByEmail = function(email) {
  for (let id in users) {
 if (users[id].email === email) {
   return users[id]
 }
}
return null;
 }
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.use(cookieParser());

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
  "b2xVn2": {
 longURL:"http://www.lighthouselabs.ca",
  },
  
  "9sm5xK": {
    longURL: "http://www.google.com"
}
};
// set the view engine to ejs
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const { cookie } = require("express/lib/response");

app.get("/urls", (req, res) => {
 // if (req.cookies) {const username = req.cookies.username}
  const templateVars = { urls: urlDatabase,
    user: req.cookies.user_id ? users[req.cookies.user_id] : null };
    console.log(req.cookies["user_id"]);

  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase,
    user: req.cookies.user_id ? users[req.cookies.user_id] : null };
    res.render("urls_new", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  
  res.redirect("/urls")
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL,
    user: req.cookies.user_id ? users[req.cookies.user_id] : null };
    res.render("urls_show", templateVars);
  });
  app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  });
  app.get('/login', (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL,
      user: req.cookies.user_id ? users[req.cookies.user_id] : null };
    res.render('login', templateVars);
  });
  
  app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = getUserByEmail(email);
    if (!email || !password) return res.sendStatus(400)

    if (!user) return res.sendStatus(403)
  
    if (password !== user.password) return res.sendStatus(401)
    
    res.cookie('user_id', user.id)
    res.redirect("/urls");
  });
  
  app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect('/urls');
  });
  app.get('/register', (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL,
      user: req.cookies.user_id ? users[req.cookies.user_id] : null };
      // res.render = to load the web page on the client end.
      res.render('register', templateVars);
    });
    app.post('/register', (req, res) => {
      const { email, password } = req.body // destructerizing, requesting the email and password from the server.
      if (!email || !password) {
        return res.sendStatus(400);
      }
      const user = getUserByEmail(email);

      if (user) {
        return res.status(400).send('Account already exists.')
      }
      
      const user_id = generateRandomString(); // creates random id for each user.
      // create new user / add new item to users object
      users[user_id] = {
        id: user_id,
        email: email,
        password: password
      }
      // setting a cookie that will contain the user's newly generated ID
      res.cookie('user_id', user_id);
      console.log(users);
      res.redirect('/urls');
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