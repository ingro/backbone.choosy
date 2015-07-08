'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Choosy = require('../dist/backbone.choosy.js');

// Overrides this to avoid a call to $.ajax that is undefined on node
Backbone.ajax = function() {
    //
};

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var assert = chai.assert;
var expect = chai.expect;
chai.use(sinonChai);

var TestModel = Backbone.Model.extend({
    url: 'api/user',

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

    it('should be choosable', function() {

        var model = new TestModel();

        model.choose();

        assert.isTrue(model.isChosen());
        assert.isTrue(model._chooser.chosen);
        assert.isTrue(model.get('chosen:'));
    });

    it('should be unchoosable', function() {

        var model = new TestModel();

        model.choose();
        model.unchoose();

        assert.isFalse(model.isChosen());
        assert.isFalse(model._chooser.chosen);
        assert.isFalse(model.get('chosen:'));
    });

    it('should be toggable', function() {

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

    it('triggers the right events', function() {

        var model = new TestModel();

        var triggerSpy = sinon.spy(model, 'trigger');

        model.choose();

        expect(triggerSpy).to.have.been.calledWith('model:chosen', model);

        triggerSpy.reset();

        model.unchoose();

        expect(triggerSpy).to.have.been.calledWith('model:unchosen', model);
    });

    it('should save stripping the chosen: attribute', function() {

        var spy = sinon.spy(Backbone, 'ajax');

        var model = new TestModel({ name: 'Bot', email: 'foo@example.com' });

        model.save();

        assert.isTrue(spy.calledOnce, 'Backbone.Sync is called once');
        assert.equal(spy.getCall(0).args[0].data, JSON.stringify({ name: 'Bot', email: 'foo@example.com' }));

        model.set('email', 'bar@example.com');

        model.save(model.changedAttributes(), { patch: true });

        assert.equal(spy.getCall(1).args[0].data, JSON.stringify({ email: 'bar@example.com' }));
    });
});