'use strict';

var users = require('../api/controllers/Users'),
		products = require('../api/controllers/Products'),
		categories = require('../api/controllers/Categories'),
		orders = require('../api/controllers/Orders'),
		auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */
// var articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];

/**
 * Expose routes
 */
module.exports = function (app, passport) {

	// apply using express.router
	// app.use('/', app.router);

	app.get('/', function(req, res) {
		res.render('index', { title: 'hello' });
	});

	// app.use('/api/products', require('./routes/products'));
	app.get('/api/products/:perPage/:page/:catId', products.loadAllProductsByCat);
	app.get('/api/products/:perPage/:page', products.loadAllProductsByCat);

	app.get('/api/categories', categories.loadAllCategories);
	app.post('/api/categories', categories.create);
	app.post('/api/orders', orders.create);

	// user routes
	app.get('/login', users.login);
	// app.get('/signup', users.signup);
	// app.get('/logout', users.logout);
	// app.post('/users', users.create);
	// app.post('/users/session',
	// 	passport.authenticate('local', {
	// 		successRedirect : '/users/show',
	// 		failureRedirect: '/login',
	// 		failureFlash: 'Invalid email or password.'
	// 	}), users.session);
	// app.get('/users/:userId', users.show);
	// app.param('userId', users.load);

	// home route
	// app.get('/', articles.index);

	app.get('/admin', function(req, res) {
		res.render('admin', { title: 'admin' });
	});

	app.get('*', function(req, res) {
		res.status(404).render('404');
	});

	/**
	 * Error handling
	 */
	app.use(function (err, req, res, next) {
		// treat as 404
		if (err.message &&
					(~err.message.indexOf('not found') ||
						(~err.message.indexOf('Cast to ObjectId failed')))) {
			return next();
		}
		console.error(err.stack);
		// error page
		res.status(500).render('500', { error: err.stack });
	});

	// assume 404 since no middleware responded
	app.use(function (req, res, next) {
		res.status(404).render('404', {
			url: req.originalUrl,
			error: 'Not found'
		});
	});
};
