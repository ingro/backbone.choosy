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
        new Backbone.SingleChooser(this);
    }
});

describe('SingleChooser', function() {

    it('should init', function() {

        var collection = new TestCollection();

        assert.instanceOf(collection, TestCollection);

        assert.property(collection, 'choose');
        assert.property(collection, 'unchoose');
        assert.property(collection, 'getChosen');
        assert.property(collection, 'getFirstChosen');
        assert.property(collection, 'chooseById');
        assert.property(collection, 'chooseNone');

        assert.isObject(collection._chooser.chosen);
        assert.strictEqual(collection.getChosen().length, 0);
    });

    it('should choose only a single model at time', function() {

        var modelA = new TestModel({id: 1, name: 'foo'});
        var modelB = new TestModel({id: 2, name: 'bar'});

        var collection = new TestCollection([modelA, modelB]);

        collection.chooseById(1);

        assert.strictEqual(collection.getChosen().length, 1);
        assert.strictEqual(collection.getFirstChosen(), modelA);

        collection.choose(modelB);

        assert.strictEqual(collection.getChosen().length, 1);
        assert.strictEqual(collection.getFirstChosen(), modelB);

        collection.unchoose(modelB);

        assert.strictEqual(collection.getChosen().length, 0);
        assert.strictEqual(collection.getFirstChosen(), undefined);

        collection.choose(modelB);
        collection.chooseNone();

        assert.strictEqual(collection.getChosen().length, 0);
        assert.strictEqual(collection.getFirstChosen(), undefined);
    });

    it('triggers the right events', function() {

        var modelA = new TestModel({id: 1, name: 'foo'});
        var modelB = new TestModel({id: 2, name: 'bar'});

        var collection = new TestCollection([modelA, modelB]);

        var triggerSpy = sinon.spy(collection, 'trigger');

        collection.chooseById(1);

        expect(triggerSpy).to.have.been.calledWith('collection:choose:one', modelA);

        triggerSpy.reset();

        collection.chooseById(1);

        expect(triggerSpy).to.have.not.been.called;

        collection.unchoose(modelA);

        expect(triggerSpy).to.have.been.calledWith('collection:unchoose:one', undefined);

        triggerSpy.reset();

        collection.unchoose(modelB);

        expect(triggerSpy).to.have.not.been.called;

        collection.choose(modelA);
        collection.chooseNone();

        expect(triggerSpy).to.have.been.calledWith('collection:unchoose:one', undefined);

        triggerSpy.reset();

        collection.chooseNone();

        expect(triggerSpy).to.have.not.been.called;
    })
});