describe("The Model functionality",function(){
	it("is defined",function(){
		expect(Mirage.Model).toBeA(Object);
	});
	describe("the model base view",function(){
		var base = Mirage.Model.Base;
		it("should inherit from Backbone View",function(){
			expect(base.__super__).toBe(Backbone.View.prototype);
		});
		it("should have a link to the property view constructors",function(){
			expect(base.prototype.propviewconstructors).toBe(Mirage.Property);
		});
		describe("the setPropClickHandler function",function(){
			var set = base.prototype.setPropClickHandler;
			it("should be defined",function(){
				expect(typeof set).toEqual("function");
			});
			describe("the property click handler",function(){
				var triggerevents = {},data;
				var context = {
					trigger: function(evt,arg){
						data = arg;
						triggerevents[evt] = true;
					},
					$el: $("<div><span class='prop'><span id='target' key='5' class='prop-multi'>foo</span><span key='4' class='prop-multi'>foo</span></span></div>")
				};
				context.$el.find("span").eq(0).attr("prop-name","someprop");
				var arg = {
					model: "woot",
					propdef: {
						type: "sometype"
					}
				};
				set.call(context,arg);
				context.$el.find("#target").click();
				it("should fire propclick event",function(){
					expect(triggerevents["propclick"]).toBeTruthy();
				});
				it("should fire propclick:<type> event",function(){
					expect(triggerevents["propclick:sometype"]).toBeTruthy();
 		 		});
				it("should fire propclick:<type>:<name> event",function(){
					expect(triggerevents["propclick:sometype:someprop"]).toBeTruthy();
 		 		});
				it("should send the model",function(){
					expect(data.model).toEqual(arg.model);
				});
				it("should send the propdef",function(){
					expect(data.propdef).toEqual(arg.propdef);
				});
				it("should send the multikey if exists",function(){
					expect(data.key).toEqual("5");
				});
			});
		});
		describe("the buildElement function",function(){
			var build = base.prototype.buildElement;
			var Fakeview = function(o){
				return {
					whoami: o.propdef.name,
					$el: $("<span>").attr({
						type: o.propdef.type,
						name: o.propdef.name,
						val: o.value,
						editing: o.editing
					})
				};
			};
			var context = {
				propviewconstructors: {
					fooprop: Fakeview,
					barprop: Fakeview
				}
			};
			var props = {
				foo: {
					type: "fooprop",
					name: "foo"
				},
				bar: {
					type: "barprop",
					name: "bar"
				}
			};
			var model = {
				attributes: {
					foo: "fooval",
					bar: "barval"
				}
			};
			var arg = {
				props: props,
				model: model,
				type: "nicemodel",
				editing: "whatever"
			};
			var $res = build.call(context,arg);
			describe("the built element",function(){
				it("should be a div",function(){
					expect($res).toBe("div");
				});
				it("should have correct classes",function(){
					expect($res).toHaveClass("model");
					expect($res).toHaveClass("model-nicemodel");
				});
				it("should store the views in context",function(){
					expect(context.views.foo.whoami).toEqual("foo");
					expect(context.views.bar.whoami).toEqual("bar");
				});
				describe("the children",function(){
					it("should have 2 kids",function(){
						expect($res.children().length).toEqual(2);
					});
					describe("the first child",function(){
						var child = $res.children().eq(0);
						it("should have correct attributes",function(){
							expect(child).toHaveAttr("name","foo");
							expect(child).toHaveAttr("type","fooprop");
							expect(child).toHaveAttr("val","fooval");
							expect(child).toHaveAttr("editing","whatever");
						});
					});
				});
			});
		});
	});
});