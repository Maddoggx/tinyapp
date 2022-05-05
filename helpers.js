
const getUserByEmail = function (email, database) {
  for (let id in database) {
    const user = database[id]
    if (user.email === email) {
      return user;
    }
  }
};

const urlsForUser = function (userID, database) {
  const urls = {};
  for (let id in database) {
    if (database[id].userID === userID) {
      
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