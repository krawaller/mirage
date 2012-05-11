this.Mirage = (function(){
	
	var PropertyBaseView = Backbone.View.extend({
		tagName: "span",
		buildElement: function(viewkind){
			var o = this.propdef,
				val = this.model.attributes[o.name],
				content = this[viewkind+"Html"](o,val);
			if (viewkind === "value"){
				this.model.on("change:"+o.name,this.updateValueElement);
			}
			return this.elementWrapper(viewkind,o.type,content);
		},
		elementWrapper: function(viewkind,proptype,content){
			var $c = $(content),
				$el = $c.length == 1 && viewkind !== "value" ? $c : $("<span>"+content+"</span>");
			return $el.addClass("prop-"+viewkind).addClass("prop-"+proptype+"-"+viewkind);
		},
		updateValueElement: function(){
			this.$el.html(this.valueHtml(this.propdef,this.model.attributes[this.propdef.name]));
		},
		labelHtml: function(o){
			return o.label||o.name;
		},
		valueHtml: function(o,val){
			return val;
		},
		getValue: function(){
			return this.$("input.prop-edit-ctrl").val();
		},
		initialize: function(opts){ // must have a propdef
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