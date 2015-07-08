'use strict';

var _get = function get(_x13, _x14, _x15) { var _again = true; _function: while (_again) { var object = _x13, property = _x14, receiver = _x15; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x13 = parent; _x14 = property; _x15 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['underscore', 'backbone'], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        module.exports = factory(require('underscore'), require('backbone'));
    } else {
        // Browser globals
        factory(_, Backbone);
    }
})(function (_, Backbone) {

    var _save = function _save(attrs) {
        var options = arguments[1] === undefined ? {} : arguments[1];

        attrs || (attrs = _.clone(this.attributes));

        delete attrs['chosen:'];

        options.data = JSON.stringify(attrs);

        return Backbone.Model.prototype.save.call(this, attrs, options);
    };

    var Choosy = (function () {
        function Choosy(model) {
            var _this = this;

            _classCallCheck(this, Choosy);

            this.model = model;
            this.model._chooser = this;

            this.model.save = _save;

            _.each(this._publicMethoods(), function (method) {
                _this.model[method] = _.bind(_this[method], _this);
            });

            this.chosen = false;
            this.model.set('chosen:', false);
        }

        _createClass(Choosy, [{
            key: '_publicMethoods',
            value: function _publicMethoods() {
                return ['choose', 'unchoose', 'toggleChoose', 'isChosen'];
            }
        }, {
            key: 'isChosen',
            value: function isChosen() {
                return !!this.chosen;
            }
        }, {
            key: 'choose',
            value: function choose() {
                var options = arguments[0] === undefined ? {} : arguments[0];

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
        }, {
            key: 'unchoose',
            value: function unchoose() {
                var options = arguments[0] === undefined ? {} : arguments[0];

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
        }, {
            key: 'toggleChoose',
            value: function toggleChoose() {
                if (this.isChosen()) {
                    this.unchoose();
                } else {
                    this.choose();
                }
            }
        }]);

        return Choosy;
    })();

    var BaseChooser = (function () {
        function BaseChooser(collection) {
            var _this2 = this;

            _classCallCheck(this, BaseChooser);

            this.collection = collection;

            this.collection._chooser = this;
            this.collection._chooser.chosen = {};

            _.each(this._publicMethoods(), function (method) {
                _this2.collection[method] = _.bind(_this2[method], _this2);
            });
        }

        _createClass(BaseChooser, [{
            key: '_publicMethoods',
            value: function _publicMethoods() {
                return ['choose', 'unchoose', 'getChosen', 'getFirstChosen', 'chooseById', 'chooseNone'];
            }
        }, {
            key: 'getChosen',
            value: function getChosen() {
                return _.toArray(this.chosen);
            }
        }, {
            key: 'getFirstChosen',
            value: function getFirstChosen() {
                return this.getChosen()[0];
            }
        }, {
            key: 'modelInChosen',
            value: function modelInChosen(model) {
                return _.contains(_.keys(this.chosen), model.cid);
            }
        }, {
            key: 'chooseNone',
            value: function chooseNone() {
                var options = arguments[0] === undefined ? {} : arguments[0];

                if (this.getChosen().length === 0) {
                    return;
                }

                this.removeModels();

                this.triggerEvent(false, options);
            }
        }, {
            key: 'addModel',
            value: function addModel(model) {
                var options = arguments[1] === undefined ? {} : arguments[1];

                this.chosen[model.cid] = model;

                if (model.choose) {
                    model.choose(options);
                }
            }
        }, {
            key: 'removeModels',
            value: function removeModels() {
                var _this3 = this;

                var model = arguments[0] === undefined ? false : arguments[0];

                var models = model ? model : this.getChosen();

                _.each(_.flatten([models]), function (model) {
                    delete _this3.chosen[model.cid];

                    if (model.unchoose) {
                        model.unchoose();
                    }
                });
            }
        }, {
            key: 'triggerEvent',
            value: function triggerEvent() {
                var event = arguments[0] === undefined ? false : arguments[0];
                var options = arguments[1] === undefined ? {} : arguments[1];

                _.defaults(options, { silent: false });

                if (options.silent === true) {
                    return;
                }

                event || (event = this._getEvent());

                this.collection.trigger(event, this._eventArg());
            }
        }, {
            key: 'chooseById',
            value: function chooseById(id) {
                var options = arguments[1] === undefined ? {} : arguments[1];

                var model = this.collection.get(id);

                if (model) {
                    this.choose(model, options);
                }
            }
        }]);

        return BaseChooser;
    })();

    var SingleChooser = (function (_BaseChooser) {
        function SingleChooser() {
            _classCallCheck(this, SingleChooser);

            _get(Object.getPrototypeOf(SingleChooser.prototype), 'constructor', this).apply(this, arguments);
        }

        _inherits(SingleChooser, _BaseChooser);

        _createClass(SingleChooser, [{
            key: '_eventArg',
            value: function _eventArg() {
                return this.getFirstChosen();
            }
        }, {
            key: 'choose',
            value: function choose(model, options) {
                if (this.modelInChosen(model)) {
                    return;
                }

                this.removeModels();

                this.addModel(model);

                this.triggerEvent('collection:choose:one', options);
            }
        }, {
            key: 'unchoose',
            value: function unchoose(model, options) {
                if (!this.modelInChosen(model)) {
                    return;
                }

                this.removeModels(model);

                this.triggerEvent('collection:unchoose:one', options);
            }
        }, {
            key: '_getEvent',
            value: function _getEvent() {
                if (this.getChosen().length === 0) {
                    return 'collection:unchoose:one';
                }

                return 'collection:choose:one';
            }
        }]);

        return SingleChooser;
    })(BaseChooser);

    var MultiChooser = (function (_BaseChooser2) {
        function MultiChooser(collection) {
            var _this4 = this;

            _classCallCheck(this, MultiChooser);

            _get(Object.getPrototypeOf(MultiChooser.prototype), 'constructor', this).call(this, collection);

            var additionalMethods = ['chooseAll', 'chooseByIds'];

            _.each(additionalMethods, function (method) {
                _this4.collection[method] = _.bind(_this4[method], _this4);
            });
        }

        _inherits(MultiChooser, _BaseChooser2);

        _createClass(MultiChooser, [{
            key: '_eventArg',
            value: function _eventArg() {
                return this.getChosen();
            }
        }, {
            key: 'choose',
            value: function choose() {
                var _this5 = this;

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                var options = !(_.chain(args).flatten().last().value() instanceof Backbone.Model) ? args.pop() : {};

                var eventShouldTrigger = false;

                _.each(_.chain([args]).flatten().value(), function (model) {
                    if (_this5.modelInChosen(model)) {
                        // Check if this continue the cycle
                        return true;
                    }

                    eventShouldTrigger || (eventShouldTrigger = true);

                    _this5.addModel(model, options);
                });

                if (eventShouldTrigger) {
                    this.triggerEvent(false, options);
                }
            }
        }, {
            key: 'unchoose',
            value: function unchoose() {
                var _this6 = this;

                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                var options = !(_.chain(args).flatten().last().value() instanceof Backbone.Model) ? args.pop() : {};

                var eventShouldTrigger = false;

                _.each(_.chain([args]).flatten().value(), function (model) {
                    if (!_this6.modelInChosen(model)) {
                        // Check if this continue the cycle
                        return true;
                    }

                    eventShouldTrigger || (eventShouldTrigger = true);

                    _this6.removeModels(model, options);
                });

                if (eventShouldTrigger) {
                    this.triggerEvent(false, options);
                }
            }
        }, {
            key: 'chooseAll',
            value: function chooseAll() {
                var _this7 = this;

                var options = arguments[0] === undefined ? {} : arguments[0];

                if (!_.difference(this.collection.models, this.getChosen()).length) {
                    return;
                }

                _.each(this.collection.models, function (model) {
                    _this7.addModel(model);
                });

                this.triggerEvent(false, options);
            }
        }, {
            key: 'chooseByIds',

            /*chooseNone(options = {}) {
                if (this.getChosen().length === 0) {
                    return;
                }
                  this.removeModels();
                  this.triggerEvent(false, options);
            }*/

            value: function chooseByIds() {
                var _this8 = this;

                var ids = arguments[0] === undefined ? [] : arguments[0];
                var options = arguments[1] === undefined ? {} : arguments[1];

                _.defaults(options, { chooseNone: true });

                if (options.chooseNone) {
                    this.chooseNone(options);
                }

                _.each(_.chain([ids]).flatten().value(), function (id) {
                    _this8.chooseById(id, options);
                });
            }
        }, {
            key: '_getEvent',
            value: function _getEvent() {
                if (this.getChosen().length === 0) {
                    return 'collection:chose:none';
                }

                if (this.collection.length === this.getChosen().length) {
                    return 'collection:chose:all';
                }

                return 'collection:chose:some';
            }
        }]);

        return MultiChooser;
    })(BaseChooser);

    Backbone.Choosy = Choosy;
    Backbone.SingleChooser = SingleChooser;
    Backbone.MultiChooser = MultiChooser;

    return Backbone.Choosy;
});