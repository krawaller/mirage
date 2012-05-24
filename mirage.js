this.Mirage = (function(){

	// ### Property functionality
	// These views are used to display a single model property. 
	// Each property type will have its own view (text,boolean,selectlist,etc). Each such type-specific
	// view will be able to render label, value and edit html for that propery.

	// #### Property base view
	// An abstract baseclass, inherited by all Property views
	
	var PropertyBaseView = Backbone.View.extend({
		
		tagName: "span",
		
		// The initialize function takes an option object containing:
		// * `propdef`: a property definition object
		// * `value`: the current value of the property (TODO: or?)
		// * `[editing]`: set to true if edit control should be displayed instead of value
		// * `[labelPosition]`: set to "before" or "after" if you want a label rendered
		initialize: function(opts){
			this.preInit && this.preInit(opts);
			var o = opts.propdef, click = o.clickEvent;
			this.propdef = o;
			this.value = opts.value;
			this.setElement(this.buildElement(opts));
			//his.$el.addClass("prop-"+o.type);
		},
		
		// Used in `buildElement`. Responsible for wrapping content in tag (if needed),
		// and adding relevant attributes and css classes.
		elementWrapper: function(o){
			o = _.defaults(o||{},{
				tag: "span",
				classes: "prop prop-"+o.kind+" prop-"+o.type+"-"+o.kind
			});
			var $el = $(o.content);
			if (o.force || $el.length !== 1){
				var tag = o.tag || "span";
				$el = $("<"+tag+">"+o.content+"</"+tag+">");
			}
			if (o.attributes){
				$el.attr(o.attributes);
			}
			if (o.name){
				$el.attr("prop-name",o.name);
			}
			if (o.classes){
				$el.addClass(o.classes);
			}
			return $el;
		},
		
		
		// Called from `initialize`, passing the whole parameter object.
		// Will call `&lt;viewkind&gt;Html` to create content, and pass along to `elementWrapper`
		buildElement: function(o){
			var content = this[(o.editing?"edit":"value")+"Html"](o.propdef,o.value);
			if (o.showlabel || o.editing){
				var lbl = this.labelHtml(o.propdef,o.value);
				if (o.editing){
					lbl = "<label for='"+o.propdef.name+"'>"+lbl+"</label>";
				}
				content = lbl + content;
			}
			return this.elementWrapper({
				content: content,
				name: o.propdef.name,
				force: !o.editing
			});
		},
		
		// Called from the parent model view.
		// This default implementation will simply repopulate the element with a new
		// call to `valueHtml`.
		updateValueElement: function(newval){
			this.$el.find(".prop-value").html(this.valueHtml(this.propdef,newval));
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
	// Sets a 'key' attribute on the value view, so we can see which was clicked
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
			var sel = [], ret = "", opts = o.options, valprop = o.valueProp || "val", me = this;
			for(var i=0,l=opts.length;i<l;i++){
				if (_.indexOf(val,opts[i][valprop]) !== -1){
					sel.push(opts[i]);
				}
			}
			_.each(sel,function(opt){
				ret += me.elementWrapper({
					content: o.makeValue ? o.makeValue(opt) : opt.text,
					classes: "prop-multi",
					attributes: {
						key: opt[valprop]
					}
				})[0].outerHTML;
			});
			return ret;
		}
	});
	
	// #### HasOne and HasMany property view
	// Inherits from select/multiselect. Needs a `collection`, will use that as options.
	// If a `modelClick` callback is given, a clickhandler will be set on the value element.
	
	// The HasOne view, inheriting from SelectView
	var PropertyHasOneView = PropertySelectView.extend({
		type: "hasone",
		preInit: function(opts){
			this.valueProp = opts.valueProp || "id";
			this.options = opts.collection.models;
		}
	});
	
	// The HasMany view, inheriting from MultiSelectView
	var PropertyHasManyView = PropertyMultiSelectView.extend({
		type: "hasmany",
		preInit: PropertyHasOneView.prototype.preInit
	});

	
	var viewconstrpackage = {
		base: PropertyBaseView,
		text: PropertyTextView,
		bool: PropertyBoolView,
		select: PropertySelectView,
		multiselect: PropertyMultiSelectView,
		hasone: PropertyHasOneView,
		hasmany: PropertyHasManyView
	};
	
	
	// ### Model functionality
	
	// #### Model base view
	var ModelBaseView = Backbone.View.extend({
		// An object with links to all property view constructors, accessed by type key. Used in 
		// `buildElemenent` function to instantiate individual property views.
		propviewconstructors: viewconstrpackage,
		
		
		events: {
			"click .prop": "propClickHandler"
		},
		
		// Model view inititialization. Sets change listener.
		initialize: function(opts){
			opts.model.on("change",this.propUpdateHandler,this);
		},
		
		// callback for changes in `model`, will update each propertyview
		propUpdateHandler: function(props){
			for(var prop in props){
				this.views[prop] && this.views[prop].updateValueElement(props[prop]);
			}
		},

		// Called from `initialize` with same arguments. Responsible for setting the clickhandler
		// that will fire a normalized event when a property view is clicked.
		propClickHandler: function(e){
			var key = $(e.target).closest(".prop-multi").attr("key"),
				name = $(e.target).closest(".prop").attr("prop-name"),
				opts = this.options,
				type = opts.propdef.type,
				o = {
					propdef: opts.propdef,
					model: opts.model,
					key: key,
					name: name
				};
			// TODO: watch html bits. are we really always clicking within key & name?
			this.trigger("propclick",o);
			this.trigger("propclick:"+type,o);
			this.trigger("propclick:"+type+":"+name,o);
		},
		
		// Called from `initialize` with same arguments. Responsible for setting the clickhandler
		// that will fire a normalized event when a property view is clicked.
		setPropClickHandler: function(e){
			var me = this;
			this.$el.on("click",".prop",function(e){
				var key = $(e.target).closest(".prop-multi").attr("key"),
					name = $(e.target).closest(".prop").attr("prop-name"),
					opts = this.options,
					type = opts.propdef.type,
					o = {
						propdef: opts.propdef,
						model: opts.model,
						key: key,
						name: name
					};
				this.trigger("propclick",o);
				this.trigger("propclick:"+type,o);
				this.trigger("propclick:"+type+":"+name,o);
			});
		},
		// Loops the property views stored in the `views` context property, and calls `getInputValue`
		// for each. Returns an object property names and values. Used to collect all data from a
		// model edit form.
		getInputValues: function(){
			var ret = {};
			for(var name in this.views){
				ret[name] = this.views[name].getInputValue();
			}
			return ret;
		},
		
		// Called from `initialize`, with same arguments. Will look at the `render` instruction, and
		// create a view for each property listed there, using the definition found in `props` option.
		// The views will be supplied with the current value for the property, collected from `model`.
		// All used views are stored in a `views` property on the context for later access.
		// If no `render` instruction is provided, all properties are shown, with labels.
		buildElement: function(opts){
			var $el = $("<div>").addClass("model model-"+opts.type);
			if (!opts.render){
				opts.render = {
					props: _.keys(opts.props),
					showlabel: true
				};
			}
			var props = opts.props,
				torender = opts.render.props;
			this.views = {};
			for(var i = 0, l=torender.length; i<l; i++){
				var key = torender[i];
				var prop = props[key];
				var view = new this.propviewconstructors[prop.type]({
					propdef: prop,
					value: opts.model.attributes[prop.name],
					editing: opts.editing,
					showlabel: opts.render.showlabel
				});
				this.views[prop.name] = view;
				$el.append(view.$el);
			}
			return $el;
		}
	});
	
	return {
		Property: viewconstrpackage,
		Model: {
			Base: ModelBaseView
		}
	};
}());