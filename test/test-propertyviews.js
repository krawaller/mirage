describe("the Property functionality", function() {

	describe("the PropertyBaseView", function() {
		var PropBaseView = Mirage.Property.base;
		it("is defined", function() {
			expect(Mirage).toBeAnObject();
		});
		describe("the initialize function", function() {
			var arg, context;
			context = {
				setElement: sinon.spy(),
				buildElement: function(o) {
					return o.editing + o.propdef + "FFS";
				}
			};
			arg = {
				editing: false,
				propdef: "FOO",
				value: "wee"
			};
			PropBaseView.prototype.initialize.call(context, arg);
			it("should set propdef to context", function() {
				expect(context.propdef).toEqual(arg.propdef);
			});
			it("should set value to context", function() {
				expect(context.value).toEqual(arg.value);
			});
			it("should call setElement with result from calling buildElement with args", function() {
				expect(context.setElement).toHaveBeenCalledWith("falseFOOFFS");
			});
			describe("when having a processArgs function",function(){
				var context = {
					setElement: sinon.spy(),
					buildElement: sinon.spy(),
					processArgs: sinon.spy(function(o){
						return processedobj;
					})
				};
				var processedobj = {foo:"bar"};
				PropBaseView.prototype.initialize.call(context, arg);
				it("should call processArgs if exist in context, passing whole option obj", function() {
					expect(context.processArgs).toHaveBeenCalledWith(arg);
				});
				it("should have called buildElement with processed object instead",function(){
					expect(context.buildElement).toHaveBeenCalledWith(processedobj);
				});
			});
		});

		describe("the buildPart function",function(){
			var build = PropBaseView.prototype.buildPart;
			var propdef = {
				type: "sometype",
				name: "somename"
			};
			var value = "VAL";
			var context = {
				fooHtml: sinon.stub().returns("FOOHTML"),
				editHtml: sinon.stub().returns("EDITHTML"),
				barPart: sinon.stub().returns("barpart"),
				barHtml: sinon.spy()
			};
			describe("for regular kind element",function(){
				var res = build.call(context,propdef,value,"foo");
				it("should call the correct html func",function(){
					expect(context.fooHtml).toHaveBeenCalledWith(propdef,value);
				});
				describe("the returned element",function(){
					it("should be jquerified",function(){
						expect(res).toBeA($);
					});
					it("should be a span",function(){
						expect(res).toBe("span");
					});
					it("should have the correct html",function(){
						expect(res).toHaveHtml("FOOHTML");
					});
					it("should have the correct classes",function(){
						expect(res).toHaveClass("prop-foo");
						expect(res).toHaveClass("prop-sometype-foo");
						expect(res).toHaveClass("prop-sometype-somename-foo");
					});
				});
			});
			describe("for edit kind element",function(){
				var res = build.call(context,propdef,value,"edit");
				it("should wrap html in for tag",function(){
					expect(res).toHaveHtml("<label for='somename'>EDITHTML</label>");
				});
			});
			describe("when have a Part function for the element kind",function(){
				var res = build.call(context,propdef,value,"bar");
				it("should call the part function with propdef and value",function(){
					expect(context.barPart).toHaveBeenCalledWith(propdef,value);
				});
				it("should return the result from barPart",function(){
					expect(res).toEqual("barpart");
				});
				it("should not automatically call html func",function(){
					expect(context.barHtml).not.toHaveBeenCalled();
				});
			});
		});

		describe("the buildElement function",function(){
			var build = PropBaseView.prototype.buildElement;
			describe("when building regular element",function(){
				var context = {
					buildPart: sinon.stub().returnsArg(2) // will return value/label/edit
				};
				var arg = {
					propdef: {
						type: "sometype",
						name: "somename"
					},
					value: "someval"
				};
				var res = build.call(context,arg);
				it("should call buildPart to build a value element",function(){
					expect(context.buildPart).toHaveBeenCalledWith(arg.propdef,arg.value,"value");
				});
				it("should not create a label",function(){
					expect(context.buildPart).not.toHaveBeenCalledWith(arg.propdef,arg.value,"label");
				});
				describe("the returned element",function(){
					it("should be jquerified",function(){
						expect(res).toBeA($);
					});
					it("should be a span",function(){
						expect(res).toBe("span");
					});
					it("should have html from buildPart func",function(){
						expect(res).toHaveHtml("value");
					});
					it("should have the relevant classes",function(){
						expect(res).toHaveClass("prop");
						expect(res).toHaveClass("prop-sometype");
						expect(res).toHaveClass("prop-sometype-somename");
						expect(res).not.toHaveClass("prop-editing");
					});
					it("should have name stored as attribute",function(){
						expect(res).toHaveAttr("prop-name","somename");
					});
				});
			});
			describe("when showlabel set to true",function(){
				var context = {
					buildPart: sinon.stub().returnsArg(2) // will return value/label/edit
				};
				var arg = {
					propdef: {
						type: "sometype",
						name: "somename"
					},
					showlabel: true,
					value: "someval"
				};
				var res = build.call(context,arg);
				it("should have created both a label and a value",function(){
					expect(context.buildPart).toHaveBeenCalledWith(arg.propdef,arg.value,"value");
					expect(context.buildPart).toHaveBeenCalledWith(arg.propdef,arg.value,"label");
				});
				it("should use both results in element html",function(){
					expect(res).toHaveHtml("labelvalue");
				});
			});
			describe("when building edit element",function(){
				var context = {
					buildPart: sinon.stub().returnsArg(2) // will return value/label/edit
				};
				var arg = {
					propdef: {
						type: "sometype",
						name: "somename"
					},
					editing: true,
					value: "someval"
				};
				var res = build.call(context,arg);
				it("should have created both an edit and a label part",function(){
					expect(context.buildPart).toHaveBeenCalledWith(arg.propdef,arg.value,"edit");
					expect(context.buildPart).toHaveBeenCalledWith(arg.propdef,arg.value,"label");
				});
				it("should not have created a value part",function(){
					expect(context.buildPart).not.toHaveBeenCalledWith(arg.propdef,arg.value,"value");
				});
				it("should add editing class to the resulting element",function(){
					expect(res).toHaveClass("prop-editing");
					expect(res).toHaveClass("prop-sometype-editing");
					expect(res).toHaveClass("prop-sometype-somename-editing");
				})
			});
		});

		describe("the updateValueElement function", function() {
			var htmlspy = sinon.spy(),
				context = {
				$el: {
					find: sinon.stub().returns({
						html:htmlspy
					})
				},
				propdef: {
					name: "foo"
				},
				valueHtml: function(o, val) {
					return o.name + val;
				}
			};
			PropBaseView.prototype.updateValueElement.call(context,"BAR");
			it("should use find with correct class to get the value element",function(){
				expect(context.$el.find).toHaveBeenCalledWith(".prop-value");
			});
			it("should set the elements html to result from valueHtml call", function() {
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
				$: function(arg) {
					flag1 = arg;
					return {
						val: function() {
							flag2 = true;
						}
					};
				}
			});
			it("selects elements with correct class", function() {
				expect(flag1).toEqual(".prop-edit-ctrl");
			});
			it("calls val() on the resulting jQuery set", function() {
				expect(flag2).toBeTrue;
			});
		});
		describe("the render function", function() {
			var obj = {
				foo: "bar"
			};
			it("should return the instance", function() {
				expect(PropBaseView.prototype.render.call(obj)).toEqual(obj);
			});
		});
		describe("the editHtml function",function(){
			var propdef = {
				name: "foo"
			};
			var edit = PropBaseView.prototype.editHtml;
			it("should throw an error",function(){
				//expect(edit(propdef)).toThrow("No editHtml function defined for foo!");
			});
		})
	});

	describe("the PropertyIntegerView",function(){
		var intview = Mirage.Property.integer;
		it("should inherit from PropTextView", function() {
			expect(intview.__super__).toBe(Mirage.Property.text.prototype);
		});
		describe("the getInputValue function",function(){
			var flag1, flag2;
			var result = intview.prototype.getInputValue.call({
				$: function(arg) {
					flag1 = arg;
					return {
						val: function() {
							flag2 = true;
							return "42";
						}
					};
				}
			});
			it("selects elements with correct class", function() {
				expect(flag1).toEqual(".prop-edit-ctrl");
			});
			it("calls val() on the resulting jQuery set", function() {
				expect(flag2).toBeTrue;
			});
			it("should parse the string to an integer",function(){
				expect(result).toEqual(42);
			});
		});
		describe("the validate function",function(){
			var val = intview.prototype.validate;
			it("should return nothing if value is a proper number string",function(){
				expect(val({value:"45"})).toBeUndefined();
			});
			// TODO - make string changable somehow.
			it("should return 'Must enter a number!' if not",function(){
				expect(val({value:"dsa"})).toEqual("Must enter a number!");
			});
		});
	});

	describe("the PropertyTextView", function() {
		var PropertyTextView = Mirage.Property.text;
		it("is defined", function() {
			expect(PropertyTextView).toBeAFunction();
		});
		it("should inherit from PropBaseView", function() {
			expect(PropertyTextView.__super__).toBe(Mirage.Property.base.prototype);
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
				expect(view).toBeA(Mirage.Property.base);
				expect(view).toBeA(Backbone.View);
			});
		});
	});

	describe("the PropertyBoolView", function() {
		var PropertyBoolView = Mirage.Property.bool;
		it("is defined", function() {
			expect(PropertyBoolView).toBeAFunction();
		});
		it("should inherit from PropBaseView", function() {
			expect(PropertyBoolView.__super__).toBe(Mirage.Property.base.prototype);
		});
		describe("the edit element maker", function() {
			var mkr = PropertyBoolView.prototype.editHtml;
			it("is defined", function() {
				expect(mkr).toBeDefined();
			});
			it("returns the correct value", function() {
				var label = $(mkr({
					name: "foo",
					val: false
				},true));
				expect(label).toBeA($);
				expect(label).toBe("input");
				expect(label).toHaveAttr("type", "checkbox");
				expect(label).toHaveAttr("name", "foo");
				expect(label).toHaveAttr("checked", "checked");
				expect(label).toHaveClass("prop-edit-ctrl");
			});
			it("doesnt have checked attr if val is false", function() {
				var label = $(mkr({
					name: "foo"
				},false));
				expect(label).not.toHaveAttr("checked", "checked");
			});
		});
		describe("the getInputValueFunction", function(){
			var get = PropertyBoolView.prototype.getInputValue;
			// TODO - test!
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
				expect(view).toBeA(Mirage.Property.base);
				expect(view).toBeA(Backbone.View);
			});
		});
	});

	describe("the PropertySelectView", function() {
		var PropertySelectView = Mirage.Property.select;
		it("is defined", function() {
			expect(PropertySelectView).toBeAFunction();
		});
		it("should inherit from PropBaseView", function() {
			expect(PropertySelectView.__super__).toBe(Mirage.Property.base.prototype);
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
				expect(view).toBeA(Mirage.Property.base);
				expect(view).toBeA(Backbone.View);
			});
		});
	});

	describe("the property multiselect view", function() {
		var PropertyMultiSelectView = Mirage.Property.multiselect;

		it("should inherit from PropBaseView", function() {
			expect(PropertyMultiSelectView.__super__).toBe(Mirage.Property.base.prototype);
		});

		describe("the value html maker", function() {
			var mkr = PropertyMultiSelectView.prototype.valueHtml;
			it("returns the correct element", function() {
				var context = {
					elementWrapper: function(o) {
						return $("<span key='" + o.attributes.key + "'>" + o.content + "</span>");
					}
				};
				var el = mkr.call(context, {
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
				[1, 3]);
				expect(el).toEqual('<span key="1">one</span><span key="3">three</span>');
			});
			it("should use makeValue function if supplied, and use valueProp", function() {
				var context = {
					elementWrapper: function(o) {
						return $(o.content).attr("key", o.attributes.key);
					}
				};
				var el = mkr.call(context, {
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
						return "<p>" + opt.text + "FFS</p>";
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
				[2, 3]),
					$el = $(el);
				expect($el).toBe("select");
				expect($el).toHaveAttr("name", "foo");
				expect($el).toHaveAttr("multiple", "multiple");
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

	describe("the hasone property view", function() {
		var PropertyHasOneView = Mirage.Property.hasone;
		it("is defined", function() {
			expect(PropertyHasOneView).toBeDefined();
		});
		it("has correct type", function() {
			expect(PropertyHasOneView.prototype.type).toEqual("hasone");
		});
		it("should inherit from PropSelectView", function() {
			expect(PropertyHasOneView.__super__).toBe(Mirage.Property.select.prototype);
		});
		describe("the processArgs function", function() {
			var pi = PropertyHasOneView.prototype.processArgs;
			it("should manipulate values correctly", function() {
				var context = {},
					arg = {
						collection: {
							models: "foo"
						},
						propdef: {
							valueProp: "foo"
						}
				};
				pi.call(context, arg);
				expect(arg.propdef.options).toEqual(arg.collection.models);
			});
			it("should use 'id' as default for valueprop", function() {
				var context = {},
					arg = {
						collection: {
							models: "foo"
						},
						propdef: {}
					};
				pi.call(context, arg);
				expect(arg.propdef.valueProp).toEqual("id");
			});
		});
	});

	describe("the hasmany property view", function() {
		var PropertyHasManyView = Mirage.Property.hasmany;
		it("is defined", function() {
			expect(PropertyHasManyView).toBeDefined();
		});
		it("has same processArgs as hasone", function() {
			expect(PropertyHasManyView.prototype.processArgs).toBe(Mirage.Property.hasone.prototype.processArgs);
		});
		it("has correct type", function() {
			expect(PropertyHasManyView.prototype.type).toEqual("hasmany");
		});
		it("should inherit from PropMultiSelectView", function() {
			expect(PropertyHasManyView.__super__).toBe(Mirage.Property.multiselect.prototype);
		});
	});

});
