describe("the Mirage object",function(){

	var ElMaker = function(constr){ return function(o){ return constr.call({propdef:o});}; };

	it("is defined",function(){
		expect(Mirage).toBeAnObject();
	});

	describe("the PropertyBaseView",function(){
		var PropBaseView = Mirage.Property.BaseView;
		it("is defined",function(){
			expect(Mirage).toBeAFunction();
		});
		describe("the initialize function",function(){
			var addedclass, testclass = PropBaseView.extend({
				setElement: function(el){
					this.mynewelement = el;
				},
				buildElement: function(viewkind){
					return viewkind+"FFS";
				},
				$el: {
					addClass: function(c){
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
		describe("the created instance",function(){
			var view = new PropBaseView({
				kind: "value",
				model: {
					attributes: {
						foo: "BAR"
					},
					on: function(){}
				},
				propdef:{name:"foo",type:"baz"}
			});
			it("is a PropBaseView-produced backbone view instance",function(){
				expect(view).toBeA(PropBaseView);
				expect(view).toBeA(Backbone.View);
			});
			it("has a span element",function(){
				expect(view.$el).toBe("span");
			});
			it("has type-related class on the element",function(){
				expect(view.$el).toHaveClass("prop-baz");
			});
			describe("the part wrapper",function(){
				var wrp = view.elementWrapper;
				it("returns a part with correct classes",function(){
					var label = wrp("labelvalueedit","sometype","FOOBAR");
					expect(label).toBeA($);
					expect(label).toBe("span");
					expect(label).toHaveText("FOOBAR");
					expect(label).toHaveClass("prop-labelvalueedit");
					expect(label).toHaveClass("prop-sometype-labelvalueedit");
				});
				it("doesn't wrap with span if content is 1 element",function(){
					var label = wrp("labelvalueedit","sometype","<div>FOO</div>");
					expect(label).toBeA($);
					expect(label).toBe("div");
					expect(label).toHaveText("FOO");
					expect(label).toHaveClass("prop-labelvalueedit");
					expect(label).toHaveClass("prop-sometype-labelvalueedit");
				});
				it("wraps if partype is value, even if content is 1 element",function(){
					var label = wrp("value","sometype","<div>FOO</div>");
					expect(label).toBeA($);
					expect(label).toBe("span");
					expect(label).toHaveText("FOO");
				});
			});
			describe("the buildElement function",function(){
				it("builds non-value part correctly",function(){
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
						blahHtml: function(propdef,val){
							return val+propdef.somesetting;
						},
						elementWrapper: function(partkind,proptype,content){
							return "MODE-"+partkind+",TYPE-"+proptype+",CONTENT-"+content;
						}
					},"blah");
					expect(el).toEqual("MODE-blah,TYPE-txt,CONTENT-foobar");
					expect(triggerspy).not.toHaveBeenCalled();
				});
				it("builds value part correctly, adding event listener",function(){
					var triggerspy = jasmine.createSpy('myStub'),
						updateval = function(){};
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
						valueHtml: function(propdef,val){
							return val+propdef.somesetting;
						},
						elementWrapper: function(partkind,proptype,content){
							return "MODE-"+partkind+",TYPE-"+proptype+",CONTENT-"+content;
						}
					},"value");
					expect(el).toEqual("MODE-value,TYPE-txt,CONTENT-foobar");
					expect(triggerspy).toHaveBeenCalledWith("change:someprop",updateval);
				});
			});
			describe("the updateValueElement function",function(){
				var htmlspy = jasmine.createSpy(), context = {
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
					valueHtml: function(o,val){
						return o.name+val;
					}
				};
				view.updateValueElement.call(context);
				expect(htmlspy).toHaveBeenCalledWith("fooBAR");
			});
			describe("the label html maker",function(){
				var mkr = view.labelHtml;
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = mkr({name:"somename"});
					expect(label).toEqual("somename");
				});
				it("should use label if provided",function(){
					var label = mkr({name:"somename",label:"Some Name"});
					expect(label).toEqual("Some Name");
				});
			});
			describe("the value html maker",function(){
				var mkr = view.valueHtml;
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = mkr({val:"someval"},"woo"); // 2nd arg is current val from model, should use that!
					expect(label).toEqual("woo");
				});
			});
			describe("the getValue function",function(){
				view.$el.html("<input class='prop-edit' val='bar'></input><input class='prop-edit-ctrl' value='foo'></input>");
				it("is defined",function(){
					expect(view.getValue).toBeAFunction();
				});
				it("returns the value from the textbox with correct class",function(){
					expect(view.getValue()).toEqual("foo");
				});
			});
			describe("the render function",function(){
				it("should return the instance",function(){
					expect(view.render()).toEqual(view);
				});
			})
		});
	});
	
	describe("the PropertyTextView",function(){
		var PropertyTextView = Mirage.Property.TextView;
		it("is defined",function(){
			expect(typeof Mirage).toBeAFunction();
		});
		describe("the produced instance",function(){
			var view = new PropertyTextView({
				propdef:{name:"foo",type:"text"},
				model:{attributes:{foo:"bar"}},
				kind: "label"
			});
			it("is a PropBaseView-produced backbone view instance",function(){
				expect(view).toBeA(PropertyTextView);
				expect(view).toBeA(Mirage.Property.BaseView);
				expect(view).toBeA(Backbone.View);
			});
			describe("the edit html maker",function(){
				var mkr = view.editHtml;
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = $(mkr({name:"foo",val:"baz"},"WOO"));
					expect(label).toBe("input");
					expect(label).toHaveAttr("type","text");
					expect(label).toHaveAttr("name","foo");
					expect(label).toHaveValue("WOO");
					expect(label).toHaveClass("prop-edit-ctrl");
				});
			});
		});
	});

	describe("the PropertyBoolView",function(){
		var PropertyBoolView = Mirage.Property.BoolView;
		it("is defined",function(){
			expect(typeof Mirage).toBeAFunction();
		});
		describe("the produced instance",function(){
			var view = new PropertyBoolView({
				propdef:{name:"foo",type:"bool"},
				model:{attributes:{foo:true}},
				kind: "label"
			});
			it("is a PropBaseView-produced backbone view instance",function(){
				expect(view).toBeA(PropertyBoolView);
				expect(view).toBeA(Mirage.Property.BaseView);
				expect(view).toBeA(Backbone.View);
			});
			describe("the edit element maker",function(){
				var mkr = view.editHtml;
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = $(mkr({name:"foo",val:true}));
					expect(label).toBeA($);
					expect(label).toBe("input");
					expect(label).toHaveAttr("type","checkbox");
					expect(label).toHaveAttr("name","foo");
					expect(label).toHaveAttr("checked","checked");
					expect(label).toHaveValue("foo");
					expect(label).toHaveClass("prop-edit-ctrl");
				});
				it("doesnt have checked attr if val is false",function(){
					var label = $(mkr({name:"foo",val:false}));
					expect(label).not.toHaveAttr("checked","checked");
				});
			});
			describe("the value element maker",function(){
				var mkr = view.valueHtml;
				it("returns the correct value",function(){
					var label = $(mkr({},true));
					expect(label.text()).toEqual("yes"); // root sign, affirmative sign
					expect(label).toHaveClass("prop-bool-true");
				});
				it("has X for text when value is false",function(){
					var label = $(mkr({},false));
					expect(label).toHaveText("no");
					expect(label).toHaveClass("prop-bool-false");
				});
				it("uses give falsetext for false",function(){
					var label = $(mkr({falsetext:"nej",truetext:"ja"},false));
					expect(label).toHaveText("nej");
				});
				it("uses give truetext for true",function(){
					var label = $(mkr({falsetext:"nej",truetext:"ja"},true));
					expect(label).toHaveText("ja");
				});
			});
		});
	});

	describe("the PropertySelectView",function(){
		var PropertySelectView = Mirage.Property.SelectView;
		it("is defined",function(){
			expect(PropertySelectView).toBeAFunction();
		});
		describe("the produced instance",function(){
			var view = new PropertySelectView({
				propdef:{
					name:"foo",
					options: [{text:'one',val:1},{text:'two',val:2},{text:'three',val:3}]
				},
				kind: "label",
				model: {
					attributes: {
						foo: 3
					}
				}
			});
			it("is a PropBaseView-produced backbone view instance",function(){
				expect(view).toBeA(PropertySelectView);
				expect(view).toBeA(Mirage.Property.BaseView);
				expect(view).toBeA(Backbone.View);
			});
			describe("the value html maker",function(){
				var mkr = view.valueHtml;
				it("returns the correct element",function(){
					var el = mkr({
						name:"foo",
						options: [{text:'one',val:1},{text:'two',val:2},{text:'three',val:3}]
					},3);
					expect(el).toEqual("three");
				});
				it("should use makeValue function if supplied, and use valueProp",function(){
					var el = mkr({
						name:"foo",
						valueProp: "num",
						options: [{text:'one',num:1},{text:'two',num:2},{text:'three',num:3}],
						makeValue: function(opt){
							return opt.text+"FFS";
						}
					},2);
					expect(el).toEqual("twoFFS");
				});
			});
			describe("the edit html maker",function(){
				var mkr = view.editHtml;
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var el = mkr({
						name:"foo",
						options: [{text:'one',val:1},{text:'two',val:2},{text:'three',val:3}]
					},2), $el = $(el);
					expect($el).toBe("select");
					expect($el).toHaveAttr("name","foo");
					expect($el).toHaveHtml("<option value='1'>one</option><option value='2' selected='selected'>two</option><option value='3'>three</option>");
					expect($el).toHaveClass("prop-edit-ctrl");
				});
				it("should use makeSelectOption function if supplied, and use valueProp",function(){
					var el = mkr({
						name:"foo",
						valueProp: "id",
						options: [{text:'one',id:1},{text:'two',id:2},{text:'three',id:3}],
						makeSelectOption: function(opt){
							return opt.text+"FFS";
						}
					},1), $el = $(el);
					expect($el).toBe("select");
					expect($el).toHaveAttr("name","foo");
					expect($el).toHaveHtml("<option value='1' selected='selected'>oneFFS</option><option value='2'>twoFFS</option><option value='3'>threeFFS</option>");
					expect($el).toHaveClass("prop-edit-ctrl");
				});
			});
		});
	});

});