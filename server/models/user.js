const utils = require('../lib/hashUtils');
const Model = require('./model');
const crypto = require('crypto');

// Write you user database model methods here
class Users extends Model {
  constructor() {
    super('users');
  }

  compare(attempted, password, salt) {
    return utils.compareHash(attempted, password, salt);
  }

  create({ username, password }) {
    let timestamp = Date.now();
    let salt = utils.createSalt(timestamp);

    let newUser = {
      username,
      salt,
      password: utils.createHash(password, salt)
    };

    return super.create.call(this, newUser);
  }

  // create(user) {
  //   let passwordShasum = crypto.createHash('sha1');
  //   passwordShasum.update(user.password);
  //   user.password = passwordShasum.digest('hex');

  //   return super.create.call(this, user);
  // }

  // hashPassword(user) {
  //   let passwordShasum = crypto.createHash('sha1');
  //   passwordShasum.update(user.password);
  //   user.password = passwordShasum.digest('hex');
  //   return user;
  // }

}

module.exports = new Users();
