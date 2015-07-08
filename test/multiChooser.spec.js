'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Choosy = require('../dist/backbone.choosy.js');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var assert = chai.assert;
var expect = chai.expect;
chai.use(sinonChai);

var TestModel = Backbone.Model.extend({
    initialize: function() {
        new Backbone.Choosy(this);
    }
});

var TestCollection = Backbone.Collection.extend({
    initialize: function() {
        new Backbone.MultiChooser(this);
    }
});

describe('MultiChooser', function() {

    it('should init', function() {

        var collection = new TestCollection();

        assert.instanceOf(collection, TestCollection);

        assert.property(collection, 'choose');
        assert.property(collection, 'unchoose');
        assert.property(collection, 'getChosen');
        assert.property(collection, 'getFirstChosen');
        assert.property(collection, 'chooseById');
        assert.property(collection, 'chooseAll');
        assert.property(collection, 'chooseNone');
        assert.property(collection, 'chooseByIds');

        assert.isObject(collection._chooser.chosen);
        assert.strictEqual(collection.getChosen().length, 0);
    });

    it('should choose multiple models', function() {

        var modelA = new TestModel({id: 1, name: 'foo'});
        var modelB = new TestModel({id: 2, name: 'bar'});
        var modelC = new TestModel({id: 3, name: 'baz'});

        var collection = new TestCollection([modelA, modelB, modelC]);

        // TODO: cover ALL the cases with choose and unchoose (model, [model], [model, model], model, model);

        // Choose a model directly
        collection.choose(modelA);

        assert.strictEqual(collection.getChosen().length, 1);
        assert.strictEqual(collection.getFirstChosen(), modelA);

        // Choose multiple models directly
        collection.choose([modelB, modelA]);

        assert.strictEqual(collection.getChosen().length, 2);
        assert.strictEqual(collection.getFirstChosen(), modelA);

        // Unchoose a single model
        collection.unchoose([modelA]);

        assert.strictEqual(collection.getChosen().length, 1);
        assert.strictEqual(collection.getFirstChosen(), modelB);

        // Unchoose multiple models
        collection.unchoose(modelA, modelB);

        assert.strictEqual(collection.getChosen().length, 0);
        assert.strictEqual(collection.getFirstChosen(), undefined);

        // Select all the models
        collection.chooseAll();

        assert.strictEqual(collection.getChosen().length, 3);
        assert.strictEqual(collection.getFirstChosen(), modelA);

        // Unselect all the models
        collection.chooseNone();

        assert.strictEqual(collection.getChosen().length, 0);
        assert.strictEqual(collection.getFirstChosen(), undefined);

        // Choose some by ids
        collection.chooseByIds([3,2]);

        assert.strictEqual(collection.getChosen().length, 2);
        assert.strictEqual(collection.getFirstChosen(), modelC);
    });

    it('should triggers the right events', function() {

        var modelA = new TestModel({id: 1, name: 'foo'});
        var modelB = new TestModel({id: 2, name: 'bar'});
        var modelC = new TestModel({id: 3, name: 'baz'});

        var collection = new TestCollection([modelA, modelB, modelC]);

        var triggerSpy = sinon.spy(collection, 'trigger');

        collection.choose(modelA);

        // 3 calls for each model chosen/unchosen

        assert.equal(triggerSpy.getCall(3).args[0], 'collection:chose:some');

        collection.chooseAll();

        assert.equal(triggerSpy.getCall(10).args[0], 'collection:chose:all');

        collection.chooseNone();

        assert.equal(triggerSpy.getCall(20).args[0], 'collection:chose:none');
    });
});