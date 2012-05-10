this.Mirage = (function(){
	
	var PropertyBaseView = Backbone.View.extend({
		tagName: "span",
		LabelElement: function(){
			var o = this.propdef;
			return $("<span class='prop-label prop-"+o.type+"-label'>"+(o.label||o.name)+"</span>");
		},
		ValueElement: function(){
			var o = this.propdef;
			return $("<span class='prop-val prop-"+o.type+"-val'>"+o.val+"</span>");
		},
		getValue: function(){ // for edit mode
			return this.$("input.prop-edit").val();
		},
		initialize: function(opts){ // must have a propdef
			this.propdef = opts.propdef;
			this.$el.addClass("prop-"+opts.propdef.type);
		}
	});
	var PropertyTextView = PropertyBaseView.extend({
		EditElement: function(){
			var o = this.propdef;
			return $("<input name='"+o.name+"' type='text' class='prop-edit prop-text-edit' value='"+o.val+"'></input>");
		}
	});
	var PropertyBoolView = PropertyBaseView.extend({
		EditElement: function(o){
			var o = this.propdef;
			return $("<input name='"+o.name+"' type='checkbox' class='prop-edit prop-checkbox-edit' value='"+o.name+"' "+(o.val?"checked='checked'":"")+"></input>");
		},
		ValueElement: function(o){
			var o = this.propdef, txt = o.val ? o.truetext || "&radic;" : o.falsetext || "X";
			return $("<span class='prop-val prop-checkbox-val'>"+txt+"</span>");
		}
	});
	var PropertySelectView = PropertyBaseView.extend({
		EditElement: function(o){ // o has name,val,options
			var o = this.propdef, optstr = "", opts = o.options;
			for(var i=0,l=opts.length;i<l;i++){
				var opt = opts[i];
				optstr += "<option value='"+opt.val+"'"+(opt.val===o.val?" selected='selected'":"")+">"+opt.text+"</option>";
			}
			return $("<select class='prop-edit prop-select-edit' name='"+o.name+"'>"+optstr+"</select>");
		},
		ValueElement: function(o){
			var o = this.propdef, opt, opts = o.options;
			for(var i=0,l=opts.length;i<l;i++){
				if (o.val === opts[i].val){
					opt = opts[i];
					break;
				}
			}
			return $("<span class='prop-val prop-select-val'>"+opt.text+"</span>");
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
		MirageModelView: MirageModelView,
		PropertyBaseView: PropertyBaseView,
		PropertyTextView: PropertyTextView,
		PropertyBoolView: PropertyBoolView,
		PropertySelectView: PropertySelectView
	};
}());