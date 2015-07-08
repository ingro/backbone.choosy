(function(factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['underscore', 'backbone'], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        module.exports = factory(
            require('underscore'),
            require('backbone')
        );
    } else {
        // Browser globals
        factory(_, Backbone);
    }
}(function(_, Backbone) {

    const _save = function(attrs, options = {}) {

        attrs || (attrs = _.clone(this.attributes));

        delete attrs['chosen:'];

        options.data = JSON.stringify(attrs);

        return Backbone.Model.prototype.save.call(this, attrs, options);
    };

    class Choosy {

        constructor(model) {
            this.model = model;
            this.model._chooser = this;

            this.model.save = _save;

            _.each(this._publicMethoods(), (method) => {
                this.model[method] = _.bind(this[method], this);
            });

            this.chosen = false;
            this.model.set('chosen:', false);
        }

        _publicMethoods() {
            return ['choose', 'unchoose', 'toggleChoose', 'isChosen'];
        }

        isChosen() {
            return !!this.chosen;
        }

        choose(options = {}) {
            if (this.isChosen()) {
                return;
            }

            this.chosen = true;
            this.model.set('chosen:', true, options);

            if (options.silent != true) {
                this.model.trigger('model:chosen', this.model);
            }

            if (this.model.collection != null) {
                if (typeof this.model.collection.choose === 'function') {
                    this.model.collection.choose(this.model, options);
                }
            }
        }

        unchoose(options = {}) {
            if (!this.isChosen()) {
                return;
            }

            this.chosen = false;
            this.model.set('chosen:', false, options);

            if (options.silent != true) {
                this.model.trigger('model:unchosen', this.model);
            }

            if (this.model.collection != null) {
                if (typeof this.model.collection.unchoose === 'function') {
                    this.model.collection.unchoose(this.model, options);
                }
            }
        }

        toggleChoose() {
            if (this.isChosen()) {
                this.unchoose();
            } else {
                this.choose();
            }
        }
    }

    class BaseChooser {

        constructor(collection) {
            this.collection = collection;

            this.collection._chooser = this;
            this.collection._chooser.chosen = {};

            _.each(this._publicMethoods(), (method) => {
                this.collection[method] = _.bind(this[method], this);
            });
        }

        _publicMethoods() {
            return ['choose', 'unchoose', 'getChosen', 'getFirstChosen', 'chooseById', 'chooseNone'];
        }

        getChosen() {
            return _.toArray(this.chosen);
        }

        getFirstChosen() {
            return this.getChosen()[0];
        }

        modelInChosen(model) {
            return _.contains(_.keys(this.chosen), model.cid);
        }

        chooseNone(options = {}) {
            if (this.getChosen().length === 0) {
                return;
            }

            this.removeModels();

            this.triggerEvent(false, options);
        }

        addModel(model, options = {}) {
            this.chosen[model.cid] = model;

            if (model.choose) {
                model.choose(options);
            }
        }

        removeModels(model = false) {
            let models = (model) ? model : this.getChosen();

            _.each(_.flatten([models]), (model) => {
                delete this.chosen[model.cid];

                if (model.unchoose) {
                    model.unchoose();
                }
            });
        }

        triggerEvent(event = false, options = {}) {
            _.defaults(options, { silent: false });

            if (options.silent === true) {
                return;
            }

            event || (event = this._getEvent());

            this.collection.trigger(event, this._eventArg());
        }

        chooseById(id, options = {}) {
            let model = this.collection.get(id);

            if (model) {
                this.choose(model, options);
            }
        }
    }

    class SingleChooser extends BaseChooser {

        _eventArg() {
            return this.getFirstChosen();
        }

        choose(model, options) {
            if (this.modelInChosen(model)) {
                return;
            }

            this.removeModels();

            this.addModel(model);

            this.triggerEvent('collection:choose:one', options);
        }

        unchoose(model, options) {
            if (!this.modelInChosen(model)) {
                return;
            }

            this.removeModels(model);

            this.triggerEvent('collection:unchoose:one', options);
        }

        _getEvent() {
            if (this.getChosen().length === 0) {
                return 'collection:unchoose:one';
            }

            return 'collection:choose:one';
        }
    }

    class MultiChooser extends BaseChooser {

        constructor(collection) {
            super(collection);

            const additionalMethods = ['chooseAll', 'chooseByIds'];

            _.each(additionalMethods, (method) => {
                this.collection[method] = _.bind(this[method], this);
            });
        }

        _eventArg() {
            return this.getChosen();
        }

        choose(...args) {
            let options = (! (_.chain(args).flatten().last().value() instanceof Backbone.Model)) ? args.pop() : {};

            let eventShouldTrigger = false;

            _.each(_.chain([args]).flatten().value(), (model) => {
                if (this.modelInChosen(model)) {
                    // Check if this continue the cycle
                    return true;
                }

                eventShouldTrigger || (eventShouldTrigger = true);

                this.addModel(model, options);
            });

            if (eventShouldTrigger) {
                this.triggerEvent(false, options);
            }
        }

        unchoose(...args) {
            let options = (! (_.chain(args).flatten().last().value() instanceof Backbone.Model)) ? args.pop() : {};

            let eventShouldTrigger = false;

            _.each(_.chain([args]).flatten().value(), (model) => {
                if (! this.modelInChosen(model)) {
                    // Check if this continue the cycle
                    return true;
                }

                eventShouldTrigger || (eventShouldTrigger = true);

                this.removeModels(model, options);
            });

            if (eventShouldTrigger) {
                this.triggerEvent(false, options);
            }
        }

        chooseAll(options = {}) {
            if (!_.difference(this.collection.models, this.getChosen()).length) {
                return;
            }

            _.each(this.collection.models, (model) => {
                this.addModel(model);
            });

            this.triggerEvent(false, options);
        }

        /*chooseNone(options = {}) {
            if (this.getChosen().length === 0) {
                return;
            }

            this.removeModels();

            this.triggerEvent(false, options);
        }*/

        chooseByIds(ids = [], options = {}) {
            _.defaults(options, { chooseNone: true });

            if (options.chooseNone) {
                this.chooseNone(options);
            }

            _.each(_.chain([ids]).flatten().value(), (id) => {
                this.chooseById(id, options);
            });
        }

        _getEvent() {
            if (this.getChosen().length === 0) {
                return 'collection:chose:none';
            }

            if (this.collection.length === this.getChosen().length) {
                return 'collection:chose:all';
            }

            return 'collection:chose:some';
        }
    }

    Backbone.Choosy = Choosy;
    Backbone.SingleChooser = SingleChooser;
    Backbone.MultiChooser = MultiChooser;

    return Backbone.Choosy;
}));