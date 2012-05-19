describe("the Mirage object", function() {

	it("is defined", function() {
		expect(Mirage).toBeAnObject();
	});
	
	describe("the Property functionality", function() {
		
		describe("the PropertyBaseView", function() {
			var PropBaseView = Mirage.Property.BaseView;
			it("is defined", function() {
				expect(Mirage).toBeAFunction();
			});
			describe("the initialize function", function() {
				var arg, context;
				context = {
					preInit: jasmine.createSpy(),
					setElement: function(el) {
						this.mynewelement = el;
					},
					buildElement: function(o) {
						return o.editing + o.propdef + "FFS";
					}
				};
				arg = {
					editing: false,
					propdef: "FOO",
					value: "wee"
				};
				PropBaseView.prototype.initialize.call(context,arg);
				it("should set propdef to context",function(){
					expect(context.propdef).toEqual(arg.propdef);
				});
				it("should set value to context",function(){
					expect(context.value).toEqual(arg.value);
				});
				it("should call setElement with result from calling buildElement with args",function(){
					expect(context.mynewelement).toEqual("falseFOOFFS");
				});
				it("should call preInit if exist in context, passing whole option obj",function(){
					expect(context.preInit).toHaveBeenCalledWith(arg);
				});
			});
			describe("the elementWrapper function",function(){
				var wrapper = PropBaseView.prototype.elementWrapper;
				it("should return jQuery object, wrapped and processed with defaults",function(){
					var $el = wrapper({content: "test",type:"text",kind:"value",name:"somename"});
					expect($el).toBeA(jQuery);
					expect($el).toBe("span");
					expect($el.length).toEqual(1);
					expect($el).toHaveHtml("test");
					expect($el).toHaveClass("prop-value");
					expect($el).toHaveClass("prop-text-value");
					expect($el).toHaveAttr("prop-name","somename");
				});
				it("should wrap with given tag",function(){
					var $el = wrapper({content: "test",type:"text",kind:"value",tag:"div"});
					expect($el).toBe("div");
					expect($el.length).toEqual(1);
					expect($el).toHaveHtml("test");
				});
				it("should not wrap if content is exactly 1 tag",function(){
					var $el = wrapper({content: "<p>test</p>",type:"text",kind:"value"});
					expect($el).toBe("p");
					expect($el.length).toEqual(1);
					expect($el).toHaveHtml("test");
				});
				it("should wrap 1-tag content if force is true",function(){
					var $el = wrapper({content: "<p>test</p>",type:"text",kind:"value",force:"true"});
					expect($el).toBe("span");
					expect($el).toHaveHtml("<p>test</p>");
				});
				it("should set given attributes",function(){
					var $el = wrapper({content: "test",type:"text",kind:"value",attributes:{foo:"bar"}});
					expect($el).toHaveAttr("foo","bar");
				});
				it("should set given classes",function(){
					var $el = wrapper({content: "test",type:"text",kind:"value",classes:"foo bar"});
					expect($el).toHaveClass("foo");
					expect($el).toHaveClass("bar");
					expect($el).not.toHaveClass("prop-value");
				});
			});
			
			describe("the buildElement function", function(){
				var build = PropBaseView.prototype.buildElement;
				describe("when not editing",function(){
					var context, valspy, wrapspy, result, arg;
					valspy = jasmine.createSpy("valueHtml");
					wrapspy = jasmine.createSpy("elementWrapper");
					context = {
						valueHtml: function(propdef,val){
							valspy(propdef,val);
							return "bin";
						},
						elementWrapper: function(o){
							wrapspy(o);
							return "baz";
						},
						editHtml: jasmine.createSpy(),
						labelHtml: jasmine.createSpy()
					};
					arg = {
						value: "bar",
						propdef: {
							name: "somename"
						}
					};
					result = build.call(context,arg);
					it("should call valueHtml with propdef and value",function(){
						expect(valspy).toHaveBeenCalledWith(arg.propdef, arg.value);
					});
					it("should elementwrapper with correct args ",function(){
						expect(wrapspy).toHaveBeenCalledWith({
							content: "bin",
							name: "somename",
							force: true
						});
					});
					it("should return the result from the elwrap call",function(){
						expect(result).toEqual("baz");
					});
					it("should not call unneeded html funcs",function(){
						expect(context.editHtml).not.toHaveBeenCalled();
						expect(context.labelHtml).not.toHaveBeenCalled();
					});
				});
				describe("when editing",function(){
					var context, html, wrapspy, result, arg;
					htmlspy = jasmine.createSpy("editHtml");
					wrapspy = jasmine.createSpy("elementWrapper");
					context = {
						editHtml: function(propdef,val){
							htmlspy(propdef,val);
							return "boo";
						},
						elementWrapper: function(o){
							wrapspy(o);
							return "baz";
						},
						valueHtml: jasmine.createSpy()
					};
					arg = {
						value: "bar",
						propdef: "foo",
						editing: true
					};
					result = build.call(context,arg);
					it("should call editHtml with propdef and value",function(){
						expect(htmlspy).toHaveBeenCalledWith(arg.propdef, arg.value);
					});
					it("should elementwrapper with correct args ",function(){
						expect(wrapspy).toHaveBeenCalledWith({
							content: "boo",
							force: false
						});
					});
					it("should not call unneeded html func",function(){
						expect(context.valueHtml).not.toHaveBeenCalled();
					});
				});
				describe("when labelposition is before",function(){
					var context, valspy, wrapspy, labelspy, result, arg;
					valspy = jasmine.createSpy("valueHtml");
					labelspy = jasmine.createSpy("labelHtml");
					wrapspy = jasmine.createSpy("elementWrapper");
					context = {
						valueHtml: function(propdef,val){
							valspy(propdef,val);
							return "bin";
						},
						labelHtml: function(propdef,val){
							labelspy(propdef,val);
							return "label";
						},
						elementWrapper: function(o){
							wrapspy(o);
							return "baz";
						}
					};
					arg = {
						value: "bar",
						propdef: "foo",
						labelPosition: "before"
					};
					result = build.call(context,arg);
					it("should call valueHtml as usual with propdef and value",function(){
						expect(valspy).toHaveBeenCalledWith(arg.propdef, arg.value);
					});
					it("should call labelHtml too with propdef and value",function(){
						expect(labelspy).toHaveBeenCalledWith(arg.propdef, arg.value);
					});
					it("should call elementwrapper with content having label first",function(){
						expect(wrapspy).toHaveBeenCalledWith({
							content: "labelbin",
							force: true
						});
					});
				});
				describe("when labelposition is after",function(){
					var context, valspy, wrapspy, labelspy, result, arg;
					valspy = jasmine.createSpy("valueHtml");
					labelspy = jasmine.createSpy("labelHtml");
					wrapspy = jasmine.createSpy("elementWrapper");
					context = {
						valueHtml: function(propdef,val){
							valspy(propdef,val);
							return "bin";
						},
						labelHtml: function(propdef,val){
							labelspy(propdef,val);
							return "label";
						},
						elementWrapper: function(o){
							wrapspy(o);
							return "baz";
						}
					};
					arg = {
						value: "bar",
						propdef: "foo",
						labelPosition: "after"
					};
					result = build.call(context,arg);
					it("should call valueHtml as usual with propdef and value",function(){
						expect(valspy).toHaveBeenCalledWith(arg.propdef, arg.value);
					});
					it("should call labelHtml too with propdef and value",function(){
						expect(labelspy).toHaveBeenCalledWith(arg.propdef, arg.value);
					});
					it("should call elementwrapper with content having label second",function(){
						expect(wrapspy).toHaveBeenCalledWith({
							content: "binlabel",
							force: true
						});
					});
				});
				describe("when editing and we have label",function(){
					var context, valspy, wrapspy, labelspy, result, arg;
					valspy = jasmine.createSpy("valueHtml");
					labelspy = jasmine.createSpy("labelHtml");
					wrapspy = jasmine.createSpy("elementWrapper");
					context = {
						editHtml: function(propdef,val){
							return "bin";
						},
						labelHtml: function(propdef,val){
							return "label";
						},
						elementWrapper: function(o){
							wrapspy(o);
							return $("<p>"+o.content+"</p>");
						}
					};
					arg = {
						value: "bar",
						editing: true,
						propdef: {
							name: "NAME"
						},
						labelPosition: "before"
					};
					result = build.call(context,arg);
					it("should use the correct html",function(){
						expect(result).toHaveHtml("<label for='NAME'>label</label>bin");
					});
				});
			});
			
			describe("the updateValueElement function", function() {
				var htmlspy = jasmine.createSpy(),
					context = {
					$el: {
						html: htmlspy
					},
					propdef: {
						name: "foo"
					},
					model: {
						attributes: {
							foo: "BAR"
						}
					},
					valueHtml: function(o, val) {
						return o.name + val;
					}
				};
				PropBaseView.prototype.updateValueElement.call(context);
				it("should set the elements html to result from valueHtml call",function(){
					expect(htmlspy).toHaveBeenCalledWith("fooBAR");
				});
			});
			describe("the label html maker", function() {
				var mkr = PropBaseView.prototype.labelHtml;
				it("is defined", function() {
					expect(mkr).toBeDefined();
				});
				it("returns the correct value", function() {
					var label = mkr({
						name: "somename"
					});
					expect(label).toEqual("somename");
				});
				it("should use label if provided", function() {
					var label = mkr({
						name: "somename",
						label: "Some Name"
					});
					expect(label).toEqual("Some Name");
				});
			});
			describe("the value html maker", function() {
				var mkr = PropBaseView.prototype.valueHtml;
				it("is defined", function() {
					expect(mkr).toBeDefined();
				});
				it("returns the correct value", function() {
					var label = mkr({
						val: "someval"
					},
					"woo"); // 2nd arg is current val from model, should use that!
					expect(label).toEqual("woo");
				});
			});
			describe("the getInputValue function", function() {
				var flag1, flag2;
				PropBaseView.prototype.getInputValue.call({
					$: function(arg){
						flag1=arg;
						return {
							val: function(){
								flag2=true;
							}
						};
					}
				});
				it("selects elements with correct class", function() {
					expect(flag1).toEqual(".prop-edit-ctrl");
				});
				it("calls val() on the resulting jQuery set",function(){
					expect(flag2).toBeTrue;
				});
			});
			describe("the render function", function() {
				var obj = {foo:"bar"};
				it("should return the instance", function() {
					expect(PropBaseView.prototype.render.call(obj)).toEqual(obj);
				});
			});

		});

		describe("the PropertyTextView", function() {
			var PropertyTextView = Mirage.Property.TextView;
			it("is defined", function() {
				expect(typeof Mirage).toBeAFunction();
			});
			it("should inherit from PropBaseView",function(){
				expect(PropertyTextView.__super__).toBe(Mirage.Property.BaseView.prototype);
			});
			describe("the edit html maker", function() {
				var mkr = PropertyTextView.prototype.editHtml;
				it("is defined", function() {
					expect(mkr).toBeDefined();
				});
				it("returns the correct value", function() {
					var label = $(mkr({
						name: "foo",
						val: "baz"
					},
					"WOO"));
					expect(label).toBe("input");
					expect(label).toHaveAttr("type", "text");
					expect(label).toHaveAttr("name", "foo");
					expect(label).toHaveValue("WOO");
					expect(label).toHaveClass("prop-edit-ctrl");
				});
			});
			describe("the produced instance", function() {
				var view = new PropertyTextView({
					propdef: {
						name: "foo",
						type: "text"
					},
					model: {
						attributes: {
							foo: "bar"
						}
					},
					kind: "label"
				});
				it("is a PropBaseView-produced backbone view instance", function() {
					expect(view).toBeA(PropertyTextView);
					expect(view).toBeA(Mirage.Property.BaseView);
					expect(view).toBeA(Backbone.View);
				});
			});
		});

		describe("the PropertyBoolView", function() {
			var PropertyBoolView = Mirage.Property.BoolView;
			it("is defined", function() {
				expect(typeof Mirage).toBeAFunction();
			});
			it("should inherit from PropBaseView",function(){
				expect(PropertyBoolView.__super__).toBe(Mirage.Property.BaseView.prototype);
			});
			describe("the edit element maker", function() {
				var mkr = PropertyBoolView.prototype.editHtml;
				it("is defined", function() {
					expect(mkr).toBeDefined();
				});
				it("returns the correct value", function() {
					var label = $(mkr({
						name: "foo",
						val: true
					}));
					expect(label).toBeA($);
					expect(label).toBe("input");
					expect(label).toHaveAttr("type", "checkbox");
					expect(label).toHaveAttr("name", "foo");
					expect(label).toHaveAttr("checked", "checked");
					expect(label).toHaveValue("foo");
					expect(label).toHaveClass("prop-edit-ctrl");
				});
				it("doesnt have checked attr if val is false", function() {
					var label = $(mkr({
						name: "foo",
						val: false
					}));
					expect(label).not.toHaveAttr("checked", "checked");
				});
			});
			describe("the value element maker", function() {
				var mkr = PropertyBoolView.prototype.valueHtml;
				it("returns the correct value", function() {
					var label = $(mkr({},
					true));
					expect(label.text()).toEqual("yes"); // root sign, affirmative sign
					expect(label).toHaveClass("prop-bool-true");
				});
				it("has X for text when value is false", function() {
					var label = $(mkr({},
					false));
					expect(label).toHaveText("no");
					expect(label).toHaveClass("prop-bool-false");
				});
				it("uses give falseText for false", function() {
					var label = $(mkr({
						falseText: "nej",
						trueText: "ja"
					},
					false));
					expect(label).toHaveText("nej");
				});
				it("uses give trueText for true", function() {
					var label = $(mkr({
						falseText: "nej",
						trueText: "ja"
					},
					true));
					expect(label).toHaveText("ja");
				});
			});
			describe("the produced instance", function() {
				var view = new PropertyBoolView({
					propdef: {
						name: "foo",
						type: "bool"
					},
					model: {
						attributes: {
							foo: true
						}
					},
					kind: "label"
				});
				it("is a PropBaseView-produced backbone view instance", function() {
					expect(view).toBeA(PropertyBoolView);
					expect(view).toBeA(Mirage.Property.BaseView);
					expect(view).toBeA(Backbone.View);
				});
			});
		});

		describe("the PropertySelectView", function() {
			var PropertySelectView = Mirage.Property.SelectView;
			it("is defined", function() {
				expect(PropertySelectView).toBeAFunction();
			});
			it("should inherit from PropBaseView",function(){
				expect(PropertySelectView.__super__).toBe(Mirage.Property.BaseView.prototype);
			});
			describe("the value html maker", function() {
				var mkr = PropertySelectView.prototype.valueHtml;
				it("returns the correct element", function() {
					var el = mkr({
						name: "foo",
						options: [{
							text: 'one',
							val: 1
						},
						{
							text: 'two',
							val: 2
						},
						{
							text: 'three',
							val: 3
						}]
					},
					3);
					expect(el).toEqual("three");
				});
				it("should use makeValue function if supplied, and use valueProp", function() {
					var el = mkr({
						name: "foo",
						valueProp: "num",
						options: [{
							text: 'one',
							num: 1
						},
						{
							text: 'two',
							num: 2
						},
						{
							text: 'three',
							num: 3
						}],
						makeValue: function(opt) {
							return opt.text + "FFS";
						}
					},
					2);
					expect(el).toEqual("twoFFS");
				});
				it("should default to ----- if val is empty", function() {
					var el = mkr({
						name: "foo",
						options: []
					});
					expect(el).toEqual("-----");
				});
				it("should use 'empty' prop if val is empty", function() {
					var el = mkr({
						name: "foo",
						options: [],
						empty: "None"
					});
					expect(el).toEqual("None");
				});
			});
			describe("the edit html maker", function() {
				var mkr = PropertySelectView.prototype.editHtml;
				it("is defined", function() {
					expect(mkr).toBeDefined();
				});
				it("returns the correct value", function() {
					var el = mkr({
						name: "foo",
						options: [{
							text: 'one',
							val: 1
						},
						{
							text: 'two',
							val: 2
						},
						{
							text: 'three',
							val: 3
						}]
					},
					2),
						$el = $(el);
					expect($el).toBe("select");
					expect($el).toHaveAttr("name", "foo");
					expect($el).toHaveHtml("<option value='1'>one</option><option value='2' selected='selected'>two</option><option value='3'>three</option>");
					expect($el).toHaveClass("prop-edit-ctrl");
				});
				it("should use makeSelectOption function if supplied, and use valueProp", function() {
					var el = mkr({
						name: "foo",
						valueProp: "id",
						options: [{
							text: 'one',
							id: 1
						},
						{
							text: 'two',
							id: 2
						},
						{
							text: 'three',
							id: 3
						}],
						makeSelectOption: function(opt) {
							return opt.text + "FFS";
						}
					},
					1),
						$el = $(el);
					expect($el).toBe("select");
					expect($el).toHaveAttr("name", "foo");
					expect($el).toHaveHtml("<option value='1' selected='selected'>oneFFS</option><option value='2'>twoFFS</option><option value='3'>threeFFS</option>");
					expect($el).toHaveClass("prop-edit-ctrl");
				});
			});
			describe("the produced instance", function() {
				var view = new PropertySelectView({
					propdef: {
						name: "foo",
						options: [{
							text: 'one',
							val: 1
						},
						{
							text: 'two',
							val: 2
						},
						{
							text: 'three',
							val: 3
						}]
					},
					kind: "label",
					model: {
						attributes: {
							foo: 3
						}
					}
				});
				it("is a PropBaseView-produced backbone view instance", function() {
					expect(view).toBeA(PropertySelectView);
					expect(view).toBeA(Mirage.Property.BaseView);
					expect(view).toBeA(Backbone.View);
				});
			});
		});
		
		describe("the property multiselect view",function(){
			var PropertyMultiSelectView = Mirage.Property.MultiSelectView;
			
			it("should inherit from PropBaseView",function(){
				expect(PropertyMultiSelectView.__super__).toBe(Mirage.Property.BaseView.prototype);
			});
			
			describe("the value html maker", function() {
				var mkr = PropertyMultiSelectView.prototype.valueHtml;
				it("returns the correct element", function() {
					var wrapspy = jasmine.createSpy("elementWrapper");
					var context = {
						elementWrapper: function(o){
							return $("<span key='"+o.attributes.key+"'>"+o.content+"</span>");
						}
					};
					var el = mkr.call(context,{
						name: "foo",
						options: [{
							text: 'one',
							val: 1
						},
						{
							text: 'two',
							val: 2
						},
						{
							text: 'three',
							val: 3
						}]
					},
					[1,3]);
					expect(el).toEqual('<span key="1">one</span><span key="3">three</span>');
				});
				it("should use makeValue function if supplied, and use valueProp", function() {
					var wrapspy = jasmine.createSpy("elementWrapper");
					var context = {
						elementWrapper: function(o){
							return $(o.content).attr("key",o.attributes.key);
						}
					};
					var el = mkr.call(context,{
						name: "foo",
						valueProp: "num",
						options: [{
							text: 'one',
							num: 1
						},
						{
							text: 'two',
							num: 2
						},
						{
							text: 'three',
							num: 3
						}],
						makeValue: function(opt) {
							return "<p>"+opt.text + "FFS</p>";
						}
					},
					[2]);
					expect($(el)[0].outerHTML).toEqual('<p key="2">twoFFS</p>');
				});
				it("should default to ----- if val is empty", function() {
					var el = mkr({
						name: "foo",
						options: []
					},
					[]);
					expect(el).toEqual("-----");
				});
				it("should use 'empty' prop if val is empty", function() {
					var el = mkr({
						name: "foo",
						options: [],
						empty: "None"
					},
					[]);
					expect(el).toEqual("None");
				});
			});
			describe("the edit html maker", function() {
				var mkr = PropertyMultiSelectView.prototype.editHtml;
				it("is defined", function() {
					expect(mkr).toBeDefined();
				});
				it("returns the correct value", function() {
					var el = mkr({
						name: "foo",
						options: [{
							text: 'one',
							val: 1
						},
						{
							text: 'two',
							val: 2
						},
						{
							text: 'three',
							val: 3
						}]
					},
					[2,3]),
						$el = $(el);
					expect($el).toBe("select");
					expect($el).toHaveAttr("name", "foo");
					expect($el).toHaveAttr("multiple","multiple");
					expect($el).toHaveHtml("<option value='1'>one</option><option value='2' selected='selected'>two</option><option value='3' selected='selected'>three</option>");
					expect($el).toHaveClass("prop-edit-ctrl");
				});
				it("should use makeSelectOption function if supplied, and use valueProp", function() {
					var el = mkr({
						name: "foo",
						valueProp: "id",
						options: [{
							text: 'one',
							id: 1
						},
						{
							text: 'two',
							id: 2
						},
						{
							text: 'three',
							id: 3
						}],
						makeSelectOption: function(opt) {
							return opt.text + "FFS";
						}
					},
					[1]),
						$el = $(el);
					expect($el).toBe("select");
					expect($el).toHaveAttr("name", "foo");
					expect($el).toHaveHtml("<option value='1' selected='selected'>oneFFS</option><option value='2'>twoFFS</option><option value='3'>threeFFS</option>");
					expect($el).toHaveClass("prop-edit-ctrl");
				});
			});

			describe("the produced instance", function() {
				var view = new PropertyMultiSelectView({
					propdef: {
						name: "foo",
						options: [{
							text: 'one',
							val: 1
						},
						{
							text: 'two',
							val: 2
						},
						{
							text: 'three',
							val: 3
						}]
					},
					kind: "label",
					model: {
						attributes: {
							foo: [2,3]
						}
					}
				});
				it("is a PropBaseView-produced backbone view instance", function() {
					expect(view).toBeA(PropertyMultiSelectView);
					expect(view).toBeA(Mirage.Property.BaseView);
					expect(view).toBeA(Backbone.View);
				});
			});
			
		});

		describe("the hasone property view",function(){
			var PropertyHasOneView = Mirage.Property.HasOneView;
			it("is defined",function(){
				expect(PropertyHasOneView).toBeDefined();
			});
			it("has correct type",function(){
				expect(PropertyHasOneView.prototype.type).toEqual("hasone");
			});
			it("should inherit from PropSelectView",function(){
				expect(PropertyHasOneView.__super__).toBe(Mirage.Property.SelectView.prototype);
			});
			describe("the preInit function",function(){
				var pi = PropertyHasOneView.prototype.preInit;
				it("should store correct values on instance",function(){
					var context = {}, arg = {
						valueProp: "bar",
						collection: {
							models: "foo"
						}
					};
					pi.call(context,arg);
					expect(context.options).toEqual(arg.collection.models);
					expect(context.valueProp).toEqual(arg.valueProp);
				});
				it("should use 'id' as default for valueprop",function(){
					var context = {}, arg = {
						collection: {
							models: "foo"
						}
					};
					pi.call(context,arg);
					expect(context.valueProp).toEqual("id");
				});
			});
		});

		describe("the hasmany property view",function(){
			var PropertyHasManyView = Mirage.Property.HasManyView;
			it("is defined",function(){
				expect(PropertyHasManyView).toBeDefined();
			});
			it("has same preInit as hasone",function(){
				expect(PropertyHasManyView.prototype.preInit).toBe(Mirage.Property.HasOneView.prototype.preInit);
			});
			it("has correct type",function(){
				expect(PropertyHasManyView.prototype.type).toEqual("hasmany");
			});
			it("should inherit from PropMultiSelectView",function(){
				expect(PropertyHasManyView.__super__).toBe(Mirage.Property.MultiSelectView.prototype);
			});
		});


	});
});