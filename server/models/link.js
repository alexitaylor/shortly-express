const crypto = require('crypto');
const Promise = require('bluebird');
const request = Promise.promisify(require('request'), { multiArgs: true });
const Model = require('./model');

class Links extends Model {
  constructor() {
    super('links');
    this.rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;
  }

  getUrlTitle(url) {
    return request(url).spread((response, html) => {
      let tag = /<title>(.*)<\/title>/;
      let match = response.body.match(tag);
      let title = match ? match[1] : url;
      return title;
    });
  }

  isValidUrl(url) {
    return url.match(this.rValidUrl);
  }

  create(link) {
    let shasum = crypto.createHash('sha1');
    shasum.update(link.url);
    link.code = shasum.digest('hex').slice(0, 5);

    return super.create.call(this, link);
  }
}

module.exports = new Links();