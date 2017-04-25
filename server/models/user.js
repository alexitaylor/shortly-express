const utils = require('../lib/hashUtils');
const Model = require('./model');
const crypto = require('crypto');

// Write you user database model methods here
class Users extends Model {
  constructor() {
    super('users');
  }

  create(user) {
  	console.log("Inside of create User: ", user);
    let passwordShasum = crypto.createHash('sha1');
    passwordShasum.update(user.password);
    user.password = passwordShasum.digest('hex');

    return super.create.call(this, user);
  }

}

module.exports = new Users();

