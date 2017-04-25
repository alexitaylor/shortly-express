const utils = require('../lib/hashUtils');
const Model = require('./model');

const Users = require('./user');
// Write you session database model methods here

class Sessions extends Model {
  constructor() {
    super('sessions');
  }

  isLoggedIn(session) {
    return !!session.username;
  }

  compare(agent, hash, salt) {
    return utils.compareHash(agent, hash, salt);
  }

  get(options) {
    return super.get.call(this, options)
      .then(session => {
        if (!session || !session.user_id) {
          return session;
        }

        return Users.get({ id: session.user_id }).then(user => {
          session.username = user.username;
          return session;
        });
      });
  }

  create({ agent }) {
    var salt = utils.createSalt();
    var hash = utils.createHash(agent, salt);

    return super.create.call(this, { hash, salt });
  }
}

module.exports = new Sessions();