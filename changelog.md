### v1.1.1

#### Fixes

* Fix override of `Backbone.Model.Save` method to keep data sent as `application/json`

### v1.1.0

#### BREAKING

* The internal model attribute `chosen:` has been renamed to `_chosen`

### v1.0.0

#### Features

* Moved the method `chooseNone` to the `BaseChooser`, so you can use it also in the `SingleChooser`

#### Fixes

* Fix events trigghered in `MultiChooser` for empty collections
* The model's attribute `chosen:` is correctly removed from the attributes hash when the model is saved to the server

#### Misc

* Due to a wrong versioning of the previous releases I decided to bump to 1.0.0 instead to restart fresh
