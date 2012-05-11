# Mirage - A Backbone Scaffolding Library

Mirage lets you generate an entire site from a single JSON structure describing the involved data.

## Properties

On the atomic scale, you are defining individual properties. In the code, they are commonly referred to
as `propdef`. It looks like the following:


    propdef = {
    	name: "zipcode", // corresponds to the attr in the model
    	type: "text", // so far: text/bool/select
    	clickevent: { // optional, will be bound to the value element
    		selector: ".item", // optional, will be used in delegation
    		callback: function(e) // will be bound to the click event
    	},

    	// for bool-type props
    	truetext: "Indeed!", // for use in a value element if value is true (defaults to yes)
    	falsetext: "nope", // for use in a value element if value is false (defaults to no)

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
