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
		describe("the produced instance",function(){
			var view = new PropBaseView({propdef:{name:"foo",val:"bar",type:"baz"}});
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
			it("has propdef from opts as property",function(){
				expect(view.propdef).toEqual({name:"foo",val:"bar",type:"baz"});
			});
			describe("the label element maker",function(){
				var mkr = ElMaker(view.LabelElement);
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = mkr({name:"somename",type:"sometype",val:"someval"});
					expect(label).toBeA($);
					expect(label).toBe("span");
					expect(label).toHaveText("somename");
					expect(label).toHaveClass("prop-label");
					expect(label).toHaveClass("prop-sometype-label");
				});
				it("should use label if provided",function(){
					var label = mkr({name:"somename",label:"Some Name",type:"sometype",val:"someval"});
					expect(label).toHaveText("Some Name");
				});
			});
			describe("the value element maker",function(){
				var mkr = ElMaker(view.ValueElement);
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = mkr({name:"somename",type:"sometype",val:"someval"});
					expect(label).toBeA($);
					expect(label).toBe("span");
					expect(label).toHaveText("someval");
					expect(label).toHaveClass("prop-val");
					expect(label).toHaveClass("prop-sometype-val");
				});
			});
			describe("the getValue function",function(){
				view.$el.html("<input class='prop-poo' val='bar'></input><input class='prop-edit' value='foo'></input>");
				it("is defined",function(){
					expect(view.getValue).toBeAFunction();
				});
				it("returns the value from the textbox with correct class",function(){
					expect(view.getValue()).toEqual("foo");
				});
			});
		});
	});
	
	describe("the PropertyTextView",function(){
		var PropertyTextView = Mirage.Property.TextView;
		it("is defined",function(){
			expect(typeof Mirage).toBeAFunction();
		});
		describe("the produced instance",function(){
			var view = new PropertyTextView({propdef:{name:"foo",val:"bar"}});
			it("is a PropBaseView-produced backbone view instance",function(){
				expect(view).toBeA(PropertyTextView);
				expect(view).toBeA(Mirage.Property.BaseView);
				expect(view).toBeA(Backbone.View);
			});
			describe("the edit element maker",function(){
				var mkr = ElMaker(view.EditElement);
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = mkr({name:"foo",val:"baz"});
					expect(label).toBeA($);
					expect(label).toBe("input");
					expect(label).toHaveAttr("type","text");
					expect(label).toHaveAttr("name","foo");
					expect(label).toHaveValue("baz");
					expect(label).toHaveClass("prop-edit");
					expect(label).toHaveClass("prop-text-edit");
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
			var view = new PropertyBoolView({propdef:{name:"foo",val:true}});
			it("is a PropBaseView-produced backbone view instance",function(){
				expect(view).toBeA(PropertyBoolView);
				expect(view).toBeA(Mirage.Property.BaseView);
				expect(view).toBeA(Backbone.View);
			});
			describe("the edit element maker",function(){
				var mkr = ElMaker(view.EditElement);
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = mkr({name:"foo",val:true});
					expect(label).toBeA($);
					expect(label).toBe("input");
					expect(label).toHaveAttr("type","checkbox");
					expect(label).toHaveAttr("name","foo");
					expect(label).toHaveAttr("checked","checked");
					expect(label).toHaveValue("foo");
					expect(label).toHaveClass("prop-edit");
					expect(label).toHaveClass("prop-checkbox-edit");
				});
				it("doesnt have checked attr if val is false",function(){
					var label = mkr({name:"foo",val:false});
					expect(label).not.toHaveAttr("checked","checked");
				});
			});
			describe("the value element maker",function(){
				var mkr = ElMaker(view.ValueElement);
				it("returns the correct value",function(){
					var label = mkr({name:"somename",type:"sometype",val:true});
					expect(label).toBeA($);
					expect(label).toBe("span");
					expect(label).toHaveHtml("&radic;"); // root sign, affirmative sign
					expect(label).toHaveClass("prop-val");
					expect(label).toHaveClass("prop-checkbox-val");
				});
				it("has X for text when value is false",function(){
					var label = mkr({name:"somename",val:false});
					expect(label).toHaveText("X"); // root sign, affirmative sign
				});
				it("uses give falsetext for false",function(){
					var label = mkr({name:"somename",val:false,falsetext:"foo",truetext:"bar"});
					expect(label).toHaveText("foo"); // root sign, affirmative sign
				});
				it("uses give truetext for true",function(){
					var label = mkr({name:"somename",val:true,falsetext:"foo",truetext:"bar"});
					expect(label).toHaveText("bar"); // root sign, affirmative sign
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
					val:3,
					options: [{text:'one',val:1},{text:'two',val:2},{text:'three',val:3}]
				}
			});
			it("is a PropBaseView-produced backbone view instance",function(){
				expect(view).toBeA(PropertySelectView);
				expect(view).toBeA(Mirage.Property.BaseView);
				expect(view).toBeA(Backbone.View);
			});
			describe("the value element maker",function(){
				var mkr = ElMaker(view.ValueElement);
				it("returns the correct element",function(){
					var el = mkr({
						name:"foo",
						val:3,
						options: [{text:'one',val:1},{text:'two',val:2},{text:'three',val:3}]
					});
					expect(el).toBeA($);
					expect(el).toBe("span");
					expect(el).toHaveText("three");
					expect(el).toHaveClass("prop-val");
					expect(el).toHaveClass("prop-select-val");
				});
			});
			describe("the edit element maker",function(){
				var mkr = ElMaker(view.EditElement);
				it("is defined",function(){
					expect(mkr).toBeDefined();
				});
				it("returns the correct value",function(){
					var label = mkr({
						name:"foo",
						val:3,
						options: [{text:'one',val:1},{text:'two',val:2},{text:'three',val:3}]
					});
					expect(label).toBeA($);
					expect(label).toBe("select");
					expect(label).toHaveAttr("name","foo");
					expect(label).toHaveHtml("<option value='1'>one</option><option value='2'>two</option><option value='3' selected='selected'>three</option>");
					expect(label).toHaveClass("prop-edit");
					expect(label).toHaveClass("prop-select-edit");
				});
			});
		});
	});

});