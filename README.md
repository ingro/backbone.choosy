# Backbone.Choosy

## Synopsis

This plugins is in fact a simply port written in ES6 of the excellent (but not maintained lately) [Backbone.Chooser](https://github.com/brian-mann/Backbone.Chooser) by Brian Mann. I forked his work primarily to add the support for UMD since I needed it to work both with AMD and CommonJS modules, but if I have time I will also look at the open issues and pull requests of the original plugin and try to integrate them, if it makes sense.

## Main difference from Backbone.Chooser

* Unit tests added (even if I'm not very expert at writing them, PR are welcome!);
* The model's attribute **chosen:** is removed from the attributes hash when the model is saved to the server;
* Fix events in *MultiChooser* for empty collections (thanks to [this PR](https://github.com/brian-mann/Backbone.Chooser/pull/13));
* Moved the method **chooseNone** to the *BaseChooser*, so you can use it also in the *SingleChooser* (thanks mainly to [this PR](https://github.com/brian-mann/Backbone.Chooser/pull/5));