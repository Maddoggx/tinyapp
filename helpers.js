const getUserByEmail = function (email, users) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id].id;
    }
  }
  return undefined;
};


module.exports = { getUserByEmail };