# Mirage - A Backbone Scaffolding Library

Mirage lets you generate an entire site from a single JSON structure describing the involved data.


## Properties

On the atomic scale, you are defining individual properties. In the code, such a definition is commonly 
referred to as a `propdef`. It looks like the following:


    propdef = {
    	name: "zipcode", // corresponds to the attr in the model
    	type: "text", // so far: text/bool/select
    	clickEvent: { // optional, will be bound to the value element
    		selector: ".item", // optional, will be used in delegation
    		callback: function(e) // will be bound to the click event
    	},

    	// for text-type
    	hintText: "enter your name", // will be set to the edit input element

    	// for bool-type props
    	trueText: "Indeed!", // for use in a value element if value is true (defaults to yes)
    	falseText: "nope", // for use in a value element if value is false (defaults to no)

    	// for select,multiselect,hasone,hasmany type props
    	makeSelectOption: function(opt), // optional, returns text to use for this option in dropdown
    	makeValue: function(opt), // optional, returns html for single option to use in value element.
    	valueProp: "id", // optional, the option prop to use for model attr (defaults to "val", or "id" for hasone/hasmany)
    	empty: "None", // displayed if value is empty (defaults to "-----")

    	// for select,multiselect type props
    	options: [opt,opt, ...], // array of options

    	// for hasone,hasmany type props
    	collection: Coll, // the backbone collection instance that we have a relation to
		modelClick: function(model) // optional, will be called with model when value element is clicked
    }

*WIP*

## Demos

In spite of fancy plans there aren't that much up and running yet, however a small demonstration can be found
[here](http://krawaller.github.com/mirage/dev/playground.html).

## Build process

As Mirage is a pure web library, there isn't much to the build process. We currently don't have a minified version,
so the only things you need to do when pushing a new version is to...

*  regenerate the annotade sourcecode by running `docco mirage.js` from the mirage.js folder.
*  regenerate index.html from README.md, for example using mdown: `cat README.md | mdown > index.html`

## Testing

Mirage is developed in a TDD/BDD-fashion using Jasmine. The testsuite can be run straight in the browser.
Here is [a GithubPages-hosted version](http://krawaller.github.com/mirage/test/testsuite.html) running the 
latest code.

Several external libraries are involved in the testing process:

*  [Jasmine](https://jasmine.github.io/)
*  [Sinon](http://sinonjs.org/docs/)
*  [Sinon matchers for Jasmine](https://github.com/froots/jasmine-sinon)
*  [jQuery matchers for Jasmine](https://github.com/velesin/jasmine-jquery)
