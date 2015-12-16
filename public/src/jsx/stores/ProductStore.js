'use strict';

var AppConstants = require('./../constants/AppConstants'),
		AppDispatcher = require('./../dispatcher/AppDispatcher'),
		EventEmitter = require('events').EventEmitter,
		_ = require('lodash');

var CHANGE_EVENT = 'change';

var _products = [], _cats = [],
		_currentCat = '', _pages = 1,
		_perPage = 5, _currentPage = 1;

var ProductStore = _.extend({}, EventEmitter.prototype, {

	_getState: function() {
		return {
			categories: _cats,
			products: _products,
			currentCat: _currentCat,
			pages: _pages,
			currentPage: _currentPage,
			perPage: _perPage
		};
	},

	getPageSizes: function() {
		return [
			{ key: 5, value: 5 },
			{ key: 10, value: 10 },
			{ key: 15, value: 15 },
			{ key: 20, value: 20 },
			{ key: 25, value: 25 }
		];
	},

	onReceiveCategories: function(data) {
		_cats = data.categories;
		_cats.splice(0, 0, { _id: '', categoryName: 'All' });
	},

	onReceiveProducts: function(data) {
		_products = data.products;
		_pages = data.pages;
		_perPage = data.perPage;
		_currentPage = data.page;
		_currentCat = data.catId;
		this.emitChange();
	},

	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},

	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},

	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	},

	getCategories: function() {
		return _cats;
	},

	getProducts: function() {
		return _products;
	}

});

AppDispatcher.register(function(payload) {
	var action = payload.action;

	switch (action.actionType) {

		case AppConstants.GET_CATS_FROM_SERVER:
			ProductStore.onReceiveCategories(action.data);
			break;

		case AppConstants.GET_PRODUCTS_FROM_SERVER:
			ProductStore.onReceiveProducts(action.data);
			break;

		default:
			return true;
			// throw new Error('No handler found');
	}

	return true;

});

module.exports = ProductStore;
