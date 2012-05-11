# Mirage - A Backbone Scaffolding Library

Mirage lets you generate an entire site from a single JSON structure describing the involved data.

## Properties

On the atomic scale, you are defining individual properties. In the code, they are commonly referred to
as `propdef`. It looks like the following:


    propdef = {
    	name: "zipcode", // corresponds to the attr in the model
    	type: "text", // so far: text/bool/select

    	// for bool-type props
    	truetext: "Indeed!", // for use in a value element if value is true (defaults to yes)
    	falsetext: "nope", // for use in a value element if value is false (defaults to no)

    	// for select and multiselect type props
    	options: [opt,opt, ...], // array of options
    	makeSelectOption: function(opt), // optional, returns text to use for this option in dropdown
    	makeValue: function(opt), // optional, returns html to use in value element
    	valueProp: "id", // optional, the option prop to use for model attr (defaults to "val")
    	empty: "None", // displayed if value is empty (defaults to "-----")
    }

*WIP*
