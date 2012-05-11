this.Mirage = (function(){

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
		// Called from initialize with viewkind (label/value/edit) as argument.
		// Will call &lt;viewkind&gt;Html to create content, and pass along to elementWrapper
		buildElement: function(viewkind){
			var o = this.propdef,
				val = this.model.attributes[o.name],
				content = this[viewkind+"Html"](o,val);
			if (viewkind === "value"){
				this.model.on("change:"+o.name,this.updateValueElement);
			}
			return this.elementWrapper(viewkind,o.type,content);
		},
		// Used in buildElement. Responsible for wrapping content in span (if needed),
		// and adding relevant css classes.
		elementWrapper: function(viewkind,proptype,content){
			var $c = $(content),
				$el = $c.length == 1 && viewkind !== "value" ? $c : $("<span>"+content+"</span>");
			return $el.addClass("prop-"+viewkind).addClass("prop-"+proptype+"-"+viewkind);
		},
		// The callback used to update a value propview when the model attribute changes.
		// This default implementation will simply repopulate the element with a new
		// call to valueHtml.
		updateValueElement: function(){
			this.$el.html(this.valueHtml(this.propdef,this.model.attributes[this.propdef.name]));
		},
		// Default implementation of generating content for a label element. Will simply use the name
		// of the property, or the 'label' property of the propdef if one is provided.
		labelHtml: function(propdef){
			return propdef.label||propdef.name;
		},
		// Default implementation of generating content for a value element. Will simply pass along
		// the current value of the relevant model attribute, which is supplied as the second 
		// argument to all html generator functions.
		valueHtml: function(o,val){
			return val;
		},
		// Returns the current value of the edit element control. Used in the Mirage ModelView to 
		// collect all entered values upon form submission.
		getValue: function(){
			return this.$("input.prop-edit-ctrl").val();
		},
		// The initialize function needs a propdef (Property definition) and a kind (one of label,
		// value or edit). It will store the propdef on the instance for later access, and build
		// the correct element depending on the kind.
		initialize: function(opts){
			this.propdef = opts.propdef;
			this.setElement(this.buildElement(opts.kind));
			this.$el.addClass("prop-"+opts.propdef.type);
		}
	});
	var PropertyTextView = PropertyBaseView.extend({
		editHtml: function(o){
			return "<input name='"+o.name+"' type='text' class='prop-edit-ctrl' value='"+o.val+"'></input>";
		}
	});
	var PropertyBoolView = PropertyBaseView.extend({
		editHtml: function(o){
			return "<input name='"+o.name+"' type='checkbox' class='prop-edit-ctrl' value='"+o.name+"' "+(o.val?"checked='checked'":"")+"></input>";
		},
		valueHtml: function(o,val){
			return "<span class='prop-bool-"+(val?'true':'false')+"'>"+(val ? o.truetext || "yes" : o.falsetext || "no")+"</span>";
		}
	});
	var PropertySelectView = PropertyBaseView.extend({
		editHtml: function(o){ // o has name,val,options
			var optstr = "", opts = o.options;
			for(var i=0,l=opts.length;i<l;i++){
				var opt = opts[i];
				optstr += "<option value='"+opt.val+"'"+(opt.val===o.val?" selected='selected'":"")+">"+opt.text+"</option>";
			}
			return "<select class='prop-edit-ctrl' name='"+o.name+"'>"+optstr+"</select>";
		},
		valueHtml: function(o,val){
			var opt, opts = o.options;
			for(var i=0,l=opts.length;i<l;i++){
				if (val === opts[i].val){
					opt = opts[i];
					break;
				}
			}
			return opt.text;
		}
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
			SelectView: PropertySelectView
		}
	};
}());