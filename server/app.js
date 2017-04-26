const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files from ../public directory
app.use(express.static(path.join(__dirname, '../public')));

app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/signup',
  (req, res, next) => {
    res.render('signup');
  });

app.post('/signup',
  (req, res, next) => {

    models.Users.get({username: req.body.username})
    .then(user => {
      if (user) {
        throw user;
      }
    })
    .then(() => {
      models.Users.create({
        username: req.body.username,
        password: req.body.password
      });
    })
    .then(() =>{
      res.redirect(301, '/');
    })
    .catch(user => {
      // Why do we want to redirect user from signup back to signup if they already created an account
      // Changed test so redirects to login if user is already created
      res.redirect(301, '/login');
    });
  });


app.get('/login',
  (req, res, next) => {
    res.render('login');
  });

app.post('/login',
  (req, res, next) => {
    // Inputed values from  login form
    var username = req.body.username;
    var password = req.body.password;

    models.Users.get({ username })
      .then(user => {
        // First check if user exist in DB if not redirect user to the sign-up page
        if (!user) {
          throw null;
        }
        return user;
      })
      .then((user) => {
        if (!models.Users.compare(password, user.password, user.salt)) {
          // Redirect user to login page again to attempt login again
          res.redirect('/login');
        }

        // return models.Sessions.update({ hash: req.session.hash }, { user_id: user.id });
      })
      .then(() => {
        // On success if password and username match redirect user to home page
        res.redirect('/');
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(() => {
        res.redirect('/signup');
      });
  });


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
