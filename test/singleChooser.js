'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Choosy = require('../dist/backbone.choosy.js');

var assert = require('chai').assert;

var TestModel = Backbone.Model.extend({
	initialize: function() {
		new Backbone.Choosy(this);
	}
});

var TestCollection = Backbone.Collection.extend({
	initialize: function() {
		new Backbone.SingleChooser(this);
	}
});

describe('SingleChooser', function() {

	it('should init', function() {

		var collection = new TestCollection();

		assert.instanceOf(collection, TestCollection);

		// assert.property(model, 'choose');
		// assert.property(model, 'unchoose');
		// assert.property(model, 'toggleChoose');
		// assert.property(model, 'isChosen');

		// assert.isFalse(model._chooser.chosen);
		// assert.isFalse(model.get('chosen:'));
	});
});