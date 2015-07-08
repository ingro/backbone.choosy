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

describe('Model', function() {

	it('should init', function() {

		var model = new TestModel();

		assert.instanceOf(model, TestModel);

		assert.property(model, 'choose');
		assert.property(model, 'unchoose');
		assert.property(model, 'toggleChoose');
		assert.property(model, 'isChosen');

		assert.isFalse(model._chooser.chosen);
		assert.isFalse(model.get('chosen:'));
	});

	it ('should be choosable', function() {

		var model = new TestModel();

		model.choose();

		assert.isTrue(model.isChosen());
		assert.isTrue(model._chooser.chosen);
		assert.isTrue(model.get('chosen:'));
	});

	it ('should be unchoosable', function() {

		var model = new TestModel();

		model.choose();
		model.unchoose();

		assert.isFalse(model.isChosen());
		assert.isFalse(model._chooser.chosen);
		assert.isFalse(model.get('chosen:'));
	});

	it ('should be toggable', function() {

		var model = new TestModel();

		model.toggleChoose();

		assert.isTrue(model.isChosen());
		assert.isTrue(model._chooser.chosen);
		assert.isTrue(model.get('chosen:'));

		model.toggleChoose();

		assert.isFalse(model.isChosen());
		assert.isFalse(model._chooser.chosen);
		assert.isFalse(model.get('chosen:'));
	});

});