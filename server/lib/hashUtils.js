const crypto = require('crypto');

/************************************************************/
// Add any hashing utility functions below
/************************************************************/

exports.createHash = (data, salt) => {
  let shasum = crypto.createHash('sha256');
  shasum.update(data + salt);
  return shasum.digest('hex');
};

exports.compareHash = (attempted, stored, salt) => {
  return stored === this.createHash(attempted, salt);
};

exports.createSalt = () => {
  return crypto.randomBytes(32).toString('hex');
};