# Backbone.Choosy

## Synopsis

This plugins is in fact a simply port written in ES6 of the excellent (but not maintained lately) [Backbone.Chooser](https://github.com/brian-mann/Backbone.Chooser) by Brian Mann. I forked his work primarily to add the support for UMD since I needed it to work both with AMD and CommonJS modules, but if I have time I will also look at the open issues and pull requests of the original plugin and try to integrate them, if it makes sense.

## Main difference from Backbone.Chooser

* Unit tests added (even if I'm not very expert at writing them, PR are welcome!);
* The model's attribute **chosen:** is removed from the attributes hash when the model is saved to the server;
* Fix events in *MultiChooser* for empty collections (thanks to [this PR](https://github.com/brian-mann/Backbone.Chooser/pull/13));
* Moved the method **chooseNone** to the *BaseChooser*, so you can use it also in the *SingleChooser* (thanks mainly to [this PR](https://github.com/brian-mann/Backbone.Chooser/pull/5));

## Documentation

### Model usage

Initialize Backbone.Choosy into your model definition:

```javascript
var Model = Backbone.Model.extend({
  initialize: {
    new Backbone.Choosy(this);
  }
});
```
Backbone.Choosy will now give your models access to the following methods:

#### model.choose([options])
Chooses the model
* Sets the `chosen` attribute on the model to `true`.
* Triggers a custom `model:chosen` event. Pass `{silent: true}` to supress this.
* If this belongs to a collection, the collection will automatically be notified

#### model.unchoose([options])
Unchooses the model
* Sets the `chosen` attribute on the model to `false`
* Triggers a `model:unchosen` event. Pass `{silent: true}` to supress this.
* If this belongs to a collection, the collection will automatically be notified

#### model.isChosen()
returns boolean whether or not your model has been chosen

```javascript
model.isChosen(); // return false
model.choose();
model.isChosen(); // return true
```

#### model.toggleChoose()
Toggles between chosen and unchosen

```javascript
model.toggleChoose();
model.isChosen(); // return true
model.toggleChoose();
model.isChosen(); // return false
```

#### Model - Catalog of Events
Backbone.Choosy fires events in an easy to use order:

```javascript
model.on("all", function (event) { console.log(event); });

model.choose();
// change:chosen
// change
// model:chosen

model.choose({silent: true});
// ...crickets...
```

#### Notes
* If the model is already chosen or unchosen and you call the same method, this will result in a noop and will not fire any events.
* If the model is part of a collection, then the collection will be notified and also fire its own events. Read #collection catalog of events

### Collection Usage

Collections can support either single choice or multi choice.

#### Single Choice Usage

```javascript
var Collection = Backbone.Collection.extend({
  initialize: function() {
    new Backbone.SingleChooser(this);
  }
});
```
A single choice collection will only ever hold 1 chosen model at the same time. Choosing a different model will thus unchoose the first.

#### collection.choose(model, [options])
Chooses the model - silence all events by passing {silent: true} as options
* First removes any currently `chosen` model by calling model.unchoose()
* Next it calls the `choose` method directly on the passed in model
* This stores the model internally as the currently `chosen` model
* Fires a `collection:chose:one` event, passing the model as the event argument

#### collection.unchoose(model, [options])
Unchooses the model - silence all events by passing {silent: true} as options
* Calls `unchosen` directly on the model
* Fires a `collection:unchose:one` event

#### collection.getChosen()
This will return an **array** of chosen models, even though a SingleChoice collection will only ever store one model.  As weird as this sounds, it makes your life much easier.  Your controllers / views won't have to know whether your collection is single or multi - you can always expect back an array.

#### collection.getFirstChosen()
This will return the first chosen model instead of an array.

#### collection.chooseById(id, [options])
* Finds the model by its id and calls `model.choose()` on it
* Convenience method so you don't have to have a direct reference to your model

#### collection.chooseNone([options])
Automatically unchooses all of the chosen models
* Calls the `unchoose` method directly on each of the passed in models
* Fires a single `collection:unchose:one` event, pass `{silent: true}` to suppress

### Single Choice Collection - Catalog of Events
Backbone.Choosy fires events in a logical order.

```javascript
collection.on("all", function(event, arg) { console.log(event, arg); });

collection.choose(model);
// change:chosen
// change
// model:chosen
// collection:chose:one, model

collection.choose(model, {silent: true});
// ...crickets...

collection.on("collection:chose:one", function(model) {
  // receive the model that was chosen
  console.log("model was chosen: ", model);

  // the collections internal reference to the
  // chosen model is accurate as well
  console.log(collection.getFirstChosen() === model); // true
});
```

* Event order is key here - make sure you're listening to collection events instead of model events
* Model change events will trigger prior to the collection having internally changed its reference to the chosen model
* This means if you listen to the model on "change:chosen" and then ask the collection which model is chosen, you'll get a different model

#### Notes
* Intelligent no-op's will occur when you try to `choose` an already chosen model, or `unchoose` a model that isn't chosen
* Why do the collections receive the events from the model? [Backbone Collections](http://backbonejs.org/#Collection) do by design.

#### Multi Choice Usage

```javascript
var Collection = Backbone.Collection.extend({
  initialize: function() {
    new Backbone.MultiChooser(this);
  }
});
```

A multi choice collection has the ability to hold a reference to multiple chosen models.

#### collection.choose(models, [options])
Will choose all of the passed in models - silence all events by passing {silent: true} as options

Supports an array of models or unlimited arguments, and is intelligent enough to figure out if options are present or not

```javascript
  // passing multiple arguments with options
  collection.choose(model1, model2, model, {silent: true});

  // passing an array of models without options
  collection.choose([model1, model, model3]);
```

* Calls the `choose` method directly on each of the passed in models
* Fires a single `collection:chose:all` event if **all** of the models in the collection are also chosen
* Fires a single `collection:chose:some` event if only a portion of the models are chosen
* Passes an array of the currently chosen models as the event argument

#### collection.unchoose(models, [options])
Will unchoose all of the passed in models - silence all events by passing {silent: true} as options

Supports an array of models or unlimited arguments, and is intelligent enough to figure out if options are present or not

```javascript
  // passing multiple arguments with options
  collection.unchoose(model1, model2, model, {silent: true});

  // passing an array of models without options
  collection.unchoose([model1, model, model3]);
```

* Calls the `unchoose` method directly on each of the passed in models
* Fires a single `collection:unchose:none` event if no models are chosen
* Fires a single `collection:unchose:some` event if only a portion of the models are chosen

#### collection.chooseAll([options])
Automatically chooses all of the models in the collection
* Calls the `choose` method directly on each of the passed in models
* Fires a single `collection:chose:all` event, pass {silent: true} to suppress
* Passes an array of the currently chosen models as the event argument

#### collection.chooseNone([options])
Automatically unchooses all of the chosen models
* Calls the `unchoose` method directly on each of the passed in models
* Fires a single `collection:chose:none` event, pass `{silent: true}` to suppress

#### collection.chooseByIds(ids, [options])
Accepts an **array** of ids only!
* Loops through each id, finds the model by its id, and calls `choose` on it directly
* Passing `{chooseNone: true}` will first remove all chosen models, and then choose them by each id

#### collection.getChosen()
This will return an **array** of the chosen models.

#### collection.getFirstChosen()
This will return the first chosen model instead of the full array.

### Multi Choice Collection - Catalog of Events
This follows the same event pattern as single chooser with one notable difference.

```javascript
// all 3 of these events return an array of chosen models
// TODO: add a "collection:chose:any" event which fires regardless of the number of chosen models
collection.on("collection:chose:none collection:chose:some collection:chose:all", function(models) {
  // the multi chooser will return an array
  // of chosen models instead of just the first
  console.log("all of the chosen models are: ", models);
});
```

#### Notes
* Same intelligent no-ops and event triggering as SingleChooser

## Builiding

* npm install -g gulp
* npm install
* gulp build

## Tests

* npm install -g mocha
* npm install
* npm test