/*
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
*/

const getUserByEmail = function (email, database) {
  for (let id in database) {
    const user = database[id]
    if (user.email === email) {
      return user;
    }
  }
  // return undefined;
};

const urlsForUser = function (userID, database) {
  const urls = {};
  for (let id in database) {
    if (database[id].userID === userID) {
      // urls[id] creating a new key value pair
      urls[id] = database[id];
    }
  }
  return urls;
};

const generateRandomString = function () {
  let string = '';
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    string += char.charAt(Math.random() * char.length);
  }
  return string;
};



module.exports = { getUserByEmail, urlsForUser, generateRandomString };