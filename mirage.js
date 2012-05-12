this.Mirage = (function(){

	// ### Utils

	// Utility function to wrap htmlstring if not exactly 1 tag. Also adds attr and classes.
	var elementWrapper = function(o){
		var $el = $(o.content);
		if (o.force || $el.length !== 1){
			var tag = o.tag || "span";
			$el = $("<"+tag+">"+o.content+"</"+tag+">");
		}
		if (o.attributes){
			$el.attr(o.attributes);
		}
		if (o.classes){
			$el.addClass(o.classes);
		}
		return $el;
	};
	

	// ### Property views
	// These views are used to display a single model property. There are 3 different flavours of display:
	//
	//*   *label*: will show the name of the property
	//*   *value*: will show the value of the property
	//*   *edit*: will show a control to edit the value of the property
	//
	// Each property type will have its own view (text,boolean,selectlist,etc), and each such type-specific
	// view will be able to render the property in those three flavours.

	// #### Property base view
	// An abstract baseclass, inherited by all Property views
	
	var PropertyBaseView = Backbone.View.extend({
		
		tagName: "span",
		
		// The initialize function needs a propdef (Property definition) and a kind (one of label,
		// value or edit). It will store the propdef on the instance for later access, and build
		// the correct element depending on the kind. If a `clickEvent` was supplied, we bind that
		// to the element.
		initialize: function(opts){
			var o = opts.propdef, click = o.clickEvent;
			this.propdef = o;
			this.setElement(this.buildElement(opts.kind));
			this.$el.addClass("prop-"+o.type);
			if (o.labelPosition){
				this.$el[o.labelPosition==="before"?"prepend":"append"](this.buildElement("label",opts.kind!=="edit"?{}:{
					tag: "label",
					attributes: {
						"for": "prop-"+o.type+"-edit-"+o.name
					}
				}));
			}
			if (click){
				this.$el.on.apply(this.$el,click.selector?["click",click.selector,click.callback]:["click",click.callback]);
			}
		},
		
		// Called from `initialize` with viewkind (label/value/edit) as argument.
		// Will call &lt;viewkind&gt;Html to create content, and pass along to elementWrapper
		buildElement: function(viewkind,instr){
			var o = this.propdef,
				val = this.model.attributes[o.name],
				content = this[viewkind+"Html"](o,val),
				label;
			if (viewkind === "value"){
				this.model.on("change:"+o.name,this.updateValueElement);
			}
			return this.elementWrapper(viewkind,o.type,content,instr);
		},
		
		// Used in `buildElement`. Responsible for wrapping content in span (if needed),
		// and adding relevant css classes.
		elementWrapper: function(viewkind,proptype,content,instr){
			return elementWrapper(_.defaults(instr||{},{
				force: viewkind === "value",
				classes: "prop-"+viewkind+" prop-"+proptype+"-"+viewkind,
				content: content
			}));
		},
		
		// The callback used to update a value propview when the model attribute changes.
		// This default implementation will simply repopulate the element with a new
		// call to `valueHtml`.
		updateValueElement: function(){ // TODO - make this more clever, so u don't remove label!
			this.$el.html(this.valueHtml(this.propdef,this.model.attributes[this.propdef.name]));
		},
		
		// Default implementation of generating content for a label element. Will simply use the name
		// of the property, or the `label` property of the `propdef` if one is provided.
		labelHtml: function(propdef){
			return propdef.label||propdef.name;
		},
		
		// Default implementation of generating content for a value element. Will simply pass along
		// the current value of the relevant model attribute, which is supplied as the second 
		// argument to all html generator functions.
		valueHtml: function(o,val){
			return val;
		},
		
		
		// Generates html for the edit control. Must be overridden in inheriting class.
		editHtml: function(o,val){
			return val;
		},
		
		// Returns the current value of the edit element control. Used in the Mirage ModelView to 
		// collect all entered values upon form submission.
		getInputValue: function(){
			return this.$(".prop-edit-ctrl").val();
		},
		
		// We don't need to do anything here, as the `initialize` function took care of building the 
		// element. The only flavour that might need to change is *value*, and that is done through
		// an event listener on the model. So `render` is a noop.
		render: function(){
			return this;
		}
	});
	
	// #### Text property view
	// Uses the default implementation for *label* and *value*, and provides a textfield for *edit*.
	var PropertyTextView = PropertyBaseView.extend({
		editHtml: function(o,val){
			return "<input name='"+o.name+"' type='text' class='prop-edit-ctrl' value='"+val+"'></input>";
		}
	});
	
	// #### Boolean property view
	// For *value*, will render `trueText`/`falseText` from `propdef` (or default yes/no). For *edit* a
	// simple checkbox is shown.
	var PropertyBoolView = PropertyBaseView.extend({
		editHtml: function(o){
			return "<input name='"+o.name+"' type='checkbox' class='prop-edit-ctrl' value='"+o.name+"' "+(o.val?"checked='checked'":"")+"></input>";
		},
		valueHtml: function(o,val){
			return "<span class='prop-bool-"+(val?'true':'false')+"'>"+(val ? o.trueText || "yes" : o.falseText || "no")+"</span>";
		}
	});
	
	// #### Selection property view
	// Used for properties where the value is one of a predefined list. This is list is supplied as an
	// `options` array in the `propdef`. You can also specify the `valueProp` to be used, defaulting to *val*.
	var PropertySelectView = PropertyBaseView.extend({
		
		// For *edit*, a select control is shown. If a `makeSelectOption` is supplied in the `propdef`,
		// that will be used to generate text for the dropdown. Otherwise the option's `text` property
		// is used.
		editHtml: function(o,val){
			var optstr = "", opts = o.options, valprop = o.valueProp || "val";
			for(var i=0,l=opts.length;i<l;i++){
				var opt = opts[i],
					str = o.makeSelectOption ? o.makeSelectOption(opt) : opt.text;
				optstr += "<option value='"+opt[valprop]+"'"+(opt[valprop]===val?" selected='selected'":"")+">"+str+"</option>";
			}
			return "<select class='prop-edit-ctrl' name='"+o.name+"'>"+optstr+"</select>";
		},
		
		// The *value* renderer will find the correct option depending on
		// the model's current value and display it. If a `makeValue` function is supplied in the `propdef`,
		// that will be used to build the output from the option. Otherwise the option's `text` property
		// is used.
		valueHtml: function(o,val){
			if (!val){
				return o.empty || "-----";
			}
			var opt, opts = o.options, valprop = o.valueProp || "val";
			for(var i=0,l=opts.length;i<l;i++){
				if (val === opts[i][valprop]){
					opt = opts[i];
					break;
				}
			}
			if (!opt){
				opt = opts[0];
			}
			return o.makeValue ? o.makeValue(opt) : opt.text;
		}
	});

	// #### MultiSelect property view
	// Same as select, but allows multiple values. Exact same API.
	var PropertyMultiSelectView = PropertyBaseView.extend({
		editHtml: function(o,val){
			var optstr = "", opts = o.options, valprop = o.valueProp || "val";
			for(var i=0,l=opts.length;i<l;i++){
				var opt = opts[i],
					str = o.makeSelectOption ? o.makeSelectOption(opt) : opt.text;
				optstr += "<option value='"+opt[valprop]+"'"+(_.indexOf(val,opt[valprop]) !== -1 ?" selected='selected'":"")+">"+str+"</option>";
			}
			return "<select class='prop-edit-ctrl' name='"+o.name+"' multiple='multiple'>"+optstr+"</select>";
		},
		valueHtml: function(o,val){
			if (!val || !val.length){
				return o.empty || "-----";
			}
			var sel = [], ret = "", opts = o.options, valprop = o.valueProp || "val";
			for(var i=0,l=opts.length;i<l;i++){
				if (_.indexOf(val,opts[i][valprop]) !== -1){
					sel.push(opts[i]);
				}
			}
			_.each(sel,function(opt){
				ret += elementWrapper({
					content: o.makeValue ? o.makeValue(opt) : opt.text,
					attributes: {
						key: opt[valprop]
					}
				})[0].outerHTML; //"<span key='"+opt[valprop]+"'>"+(o.makeValue ? o.makeValue(opt) : opt.text)+"</span>";
			});
			return ret;
		}
	});
	
	// #### HasOne and HasMany property view
	// Inherits from select/multiselect. Needs a `collection`, will use that as options.
	// If a `modelClick` callback is given, a clickhandler will be set on the value element.
	
	// Initialization function used in both hasone and hasmany.
	var relationInitialize = function(opts){
		var p = opts.propdef;
		opts.propdef = _.defaults({
			options: p.collection.models,
			type: this.type,
			valueProp: "id" || p.valueProp,
			makeValue: function(model){
				var str = p.makeValue ? p.makeValue(model) : model.attributes.text;
				return "<span class='prop-model' key='"+(model.id || model.cid)+"'>"+str+"</span>";
			}
		},p);
		if (p.modelClick){
			opts.propdef.clickEvent = {
				selector: ".prop-model",
				callback: function(e){
					var id = $(e.target).attr("key");
					p.modelClick(p.collection.get(id)||p.collection.getByCid(id));
				}
			};
		}
		this.constructor.__super__.initialize.call(this,opts);
	};
	
	// The HasOne view, inheriting from SelectView
	var PropertyHasOneView = PropertySelectView.extend({
		type: "hasone",
		initialize: relationInitialize
	});
	
	// The HasMany view, inheriting from MultiSelectView
	var PropertyHasManyView = PropertyMultiSelectView.extend({
		type: "hasmany",
		initialize: relationInitialize
	});


	var PROPVIEWS = {
		text: PropertyTextView
	};
	var MirageModelView = Backbone.View.extend({
		/*
show: array (optional) of props to show
kind: naked/label/edit
model
callback: for edit mode, 

		*/
		initialize: function(opts){
			if (!opts.show){
				var arr = [];
				for (var p in opts.model.attributes){
					arr.push(p);
				}
				opts.show = arr;
			}
			this.kind = opts.kind;
			this.show = opts.show;
			this.props = opts.props;
			this.callback = opts.callback;
		},
		events: {
			"click .savebtn": function(){
				this.callback(this.getvalue());
			}
		},
		render: function(){
			var props = this.attributes, propviews = [];
			this.$el.empty();
			_.each(this.show,function(pname){
				var prop = props[pname], view = new PROPVIEWS[prop.type]({
					kind: this.kind,
					propdef: prop
				});
				this.$el.append(view.render().el);
				propviews.push(view);
			});
			this.propviews = propviews;
			if (this.kind === "edit"){
				this.$el.append("<div><input type='button' class='savebtn'>Save</input></div>");
			}
		},
		getValue: function(){
			var o, views = this.propviews;
			_.each(views,function(view){
				o[view.name] = view.getValue();
			});
			return o;
		}
	});
	
	
	return {
		Property: {
			BaseView: PropertyBaseView,
			TextView: PropertyTextView,
			BoolView: PropertyBoolView,
			SelectView: PropertySelectView,
			MultiSelectView: PropertyMultiSelectView,
			HasOneView: PropertyHasOneView,
			HasManyView: PropertyHasManyView
		}
	};
}());