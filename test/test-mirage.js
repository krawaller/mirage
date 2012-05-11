describe("the Mirage object", function() {

	it("is defined", function() {
		expect(Mirage).toBeAnObject();
	});
	
	describe("the Property functionality", function() {
		var ElMaker = function(constr) {
			return function(o) {
				return constr.call({
					propdef: o
				});
			};
		};
		describe("the PropertyBaseView", function() {
			var PropBaseView = Mirage.Property.BaseView;
			it("is defined", function() {
				expect(Mirage).toBeAFunction();
			});
			describe("the initialize function", function() {
				var addedclass, testclass = PropBaseView.extend({
					setElement: function(el) {
						this.mynewelement = el;
					},
					buildElement: function(viewkind) {
						return viewkind + "FFS";
					},
					$el: {
						addClass: function(c) {
							addedclass = c;
						}
					}
				});
				var propdef = {
					name: "myprop",
					type: "sometype"
				};
				var instance = new testclass({
					propdef: propdef,
					kind: "valueoreditorlabel"
				});
				expect(instance.propdef).toEqual(propdef);
				expect(instance.mynewelement).toEqual("valueoreditorlabelFFS");
				expect(addedclass).toEqual("prop-sometype");
			});
			it("should handle clicks!",function(){
				var p = 0, callback = function(){
						p++;
					},v = new PropBaseView({
					kind: "value",
					model: {
						attributes: {
							foo: "BAR!"
						},
						on: function() {}
					},
					propdef: {
						name: "foo",
						type: "baz",
						clickEvent: {
							selector: "p",
							callback: callback
						}
					}
				});
				v.$el.html("<p>woo</p>");
				v.$el.click();
				expect(p).toEqual(0);
				v.$el.find("p").click();
				expect(p).toEqual(1);
			});
			describe("the created instance", function() {
				var view = new PropBaseView({
					kind: "value",
					model: {
						attributes: {
							foo: "BAR"
						},
						on: function() {}
					},
					propdef: {
						name: "foo",
						type: "baz"
					}
				});
				it("is a PropBaseView-produced backbone view instance", function() {
					expect(view).toBeA(PropBaseView);
					expect(view).toBeA(Backbone.View);
				});
				it("has a span element", function() {
					expect(view.$el).toBe("span");
				});
				it("has type-related class on the element", function() {
					expect(view.$el).toHaveClass("prop-baz");
				});
				describe("the part wrapper", function() {
					var wrp = view.elementWrapper;
					it("returns a part with correct classes", function() {
						var label = wrp("labelvalueedit", "sometype", "FOOBAR");
						expect(label).toBeA($);
						expect(label).toBe("span");
						expect(label).toHaveText("FOOBAR");
						expect(label).toHaveClass("prop-labelvalueedit");
						expect(label).toHaveClass("prop-sometype-labelvalueedit");
					});
					it("doesn't wrap with span if content is 1 element", function() {
						var label = wrp("labelvalueedit", "sometype", "<div>FOO</div>");
						expect(label).toBeA($);
						expect(label).toBe("div");
						expect(label).toHaveText("FOO");
						expect(label).toHaveClass("prop-labelvalueedit");
						expect(label).toHaveClass("prop-sometype-labelvalueedit");
					});
					it("wraps if partype is value, even if content is 1 element", function() {
						var label = wrp("value", "sometype", "<div>FOO</div>");
						expect(label).toBeA($);
						expect(label).toBe("span");
						expect(label).toHaveText("FOO");
					});
				});
				describe("the buildElement function", function() {
					it("builds non-value part correctly", function() {
						var triggerspy = jasmine.createSpy('myStub');
						var el = view.buildElement.call({
							propdef: {
								type: "txt",
								name: "someprop",
								somesetting: "bar"
							},
							model: {
								attributes: {
									someprop: "foo"
								},
								on: triggerspy
							},
							blahHtml: function(propdef, val) {
								return val + propdef.somesetting;
							},
							elementWrapper: function(partkind, proptype, content) {
								return "MODE-" + partkind + ",TYPE-" + proptype + ",CONTENT-" + content;
							}
						},
						"blah");
						expect(el).toEqual("MODE-blah,TYPE-txt,CONTENT-foobar");
						expect(triggerspy).not.toHaveBeenCalled();
					});
					it("builds value part correctly, adding event listener", function() {
						var triggerspy = jasmine.createSpy('myStub'),
							updateval = function() {};
						var el = view.buildElement.call({
							propdef: {
								type: "txt",
								name: "someprop",
								somesetting: "bar"
							},
							model: {
								attributes: {
									someprop: "foo"
								},
								on: triggerspy
							},
							updateValueElement: updateval,
							valueHtml: function(propdef, val) {
								return val + propdef.somesetting;
							},
							elementWrapper: function(partkind, proptype, content) {
								return "MODE-" + partkind + ",TYPE-" + proptype + ",CONTENT-" + content;
							}
						},
						"value");
						expect(el).toEqual("MODE-value,TYPE-txt,CONTENT-foobar");
						expect(triggerspy).toHaveBeenCalledWith("change:someprop", updateval);
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
					view.updateValueElement.call(context);
					expect(htmlspy).toHaveBeenCalledWith("fooBAR");
				});
				describe("the label html maker", function() {
					var mkr = view.labelHtml;
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
					var mkr = view.valueHtml;
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
					view.$el.html("<input class='prop-edit' val='bar'></input><input class='prop-edit-ctrl' value='foo'></input>");
					it("is defined", function() {
						expect(view.getInputValue).toBeAFunction();
					});
					it("returns the value from the textbox with correct class", function() {
						expect(view.getInputValue()).toEqual("foo");
					});
				});
				describe("the render function", function() {
					it("should return the instance", function() {
						expect(view.render()).toEqual(view);
					});
				});
			});
		});

		describe("the PropertyTextView", function() {
			var PropertyTextView = Mirage.Property.TextView;
			it("is defined", function() {
				expect(typeof Mirage).toBeAFunction();
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
				describe("the edit html maker", function() {
					var mkr = view.editHtml;
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
			});
		});

		describe("the PropertyBoolView", function() {
			var PropertyBoolView = Mirage.Property.BoolView;
			it("is defined", function() {
				expect(typeof Mirage).toBeAFunction();
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
				describe("the edit element maker", function() {
					var mkr = view.editHtml;
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
					var mkr = view.valueHtml;
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
			});
		});

		describe("the PropertySelectView", function() {
			var PropertySelectView = Mirage.Property.SelectView;
			it("is defined", function() {
				expect(PropertySelectView).toBeAFunction();
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
				describe("the value html maker", function() {
					var mkr = view.valueHtml;
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
					var mkr = view.editHtml;
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
			});
		});
		
		describe("the property multiselect view",function(){
			var PropertyMultiSelectView = Mirage.Property.MultiSelectView;
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
				describe("the value html maker", function() {
					var mkr = view.valueHtml;
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
						[1,3]);
						expect(el).toEqual('<span key="1">one</span><span key="3">three</span>');
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
					var mkr = view.editHtml;
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
			});
		});
		
		describe("the hasone property view",function(){
			var PropertyHasOneView = Mirage.Property.HasOneView;
			it("is defined",function(){
				expect(PropertyHasOneView).toBeDefined();
			});
			describe("the instance",function(){
				var clickedmodelid, collection, view, modelClick, makeValue;
				collection = new Backbone.Collection([{id:1,name:"one"},{id:2,name:"two"}]);
				modelClick = function(model){
					clickedmodelid = model.id;
				};
				makeValue = function(model){
					return model.attributes.name;
				};
				view = new PropertyHasOneView({
					kind: "value",
					model: {
						attributes: {
							woo: 2
						},
						on: function(){}
					},
					propdef: {
						name: "woo",
						collection: collection,
						makeValue: makeValue,
						makeSelectOption: "foobar",
						modelClick: modelClick
					}
				});
				it("should handle model clicks",function(){
					view.$el.find(".prop-model").click();
					expect(clickedmodelid).toEqual(2);
				});
				it("should set proper propdef",function(){
					var p = view.propdef;
					expect(p.options).toEqual(collection.models);
					expect(p.collection).toEqual(collection);
					expect(p.type).toEqual("hasone");
					expect(p.clickEvent).toBeDefined();
					expect(p.clickEvent.selector).toEqual(".prop-model");
					expect(p.valueProp).toEqual("id");
					expect(p.makeValue).toBeA(Function);
					expect(p.makeValue).not.toEqual(makeValue);
					expect(p.makeSelectOption).toBe("foobar");
				});
				it("should draw correct value html",function(){
					expect(view.$el).toBe("span");
					expect(view.$el).toHaveClass("prop-hasone");
					expect(view.$el).toHaveHtml("<span class='prop-model' key='2'>two</span>");
				});
			});
		});
		
		describe("the hasmany property view",function(){
			var PropertyHasManyView = Mirage.Property.HasManyView;
			it("is defined",function(){
				expect(PropertyHasManyView).toBeDefined();
			});
			describe("the instance",function(){
				var clickedmodelid, collection, view, modelClick, makeValue;
				collection = new Backbone.Collection([{id:1,name:"one"},{id:2,name:"two"},{id:3,name:"three"}]);
				modelClick = function(model){
					clickedmodelid = model.id;
				};
				makeValue = function(model){
					return model.attributes.name+"FFS";
				};
				view = new PropertyHasManyView({
					kind: "value",
					model: {
						attributes: {
							woo: [1,3]
						},
						on: function(){}
					},
					propdef: {
						name: "woo",
						collection: collection,
						makeValue: makeValue,
						makeSelectOption: "foobar",
						modelClick: modelClick
					}
				});
				it("should handle model clicks",function(){
					view.$el.find(".prop-model").eq(0).click();
					expect(clickedmodelid).toEqual(1);
					view.$el.find(".prop-model").eq(1).click();
					expect(clickedmodelid).toEqual(3);
				});
				it("should set proper propdef",function(){
					var p = view.propdef;
					expect(p.options).toEqual(collection.models);
					expect(p.collection).toEqual(collection);
					expect(p.type).toEqual("hasmany");
					expect(p.clickEvent).toBeDefined();
					expect(p.clickEvent.selector).toEqual(".prop-model");
					expect(p.valueProp).toEqual("id");
					expect(p.makeValue).toBeA(Function);
					expect(p.makeValue).not.toEqual(makeValue);
					expect(p.makeSelectOption).toBe("foobar");
				});
				it("should draw correct value html",function(){
					expect(view.$el).toBe("span");
					expect(view.$el).toHaveClass("prop-hasmany");
					expect(view.$el).toHaveHtml("<span class='prop-model' key='1'>oneFFS</span><span class='prop-model' key='3'>threeFFS</span>");
				});
			});
		});
		
	});
});
