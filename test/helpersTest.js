const { assert } = require('chai');

const { checkUser } = require('../helpers.js');

const testUsers = {
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
};

describe('checkUser', function() {
  it('should return a user with valid email', function() {
    const user = checkUser("user@example.com",null, testUsers)
    const expectedUserID = "err1";
   
  });
});