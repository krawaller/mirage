describe("The Model functionality", function() {
	it("is defined", function() {
		expect(Mirage.Model).toBeA(Object);
	});
	describe("the model base view", function() {
		var base = Mirage.Model.base;
		it("should inherit from Backbone View", function() {
			expect(base.__super__).toBe(Backbone.View.prototype);
		});
		it("should have a link to the property view constructors", function() {
			expect(base.prototype.propviewconstructors).toBe(Mirage.Property);
		});
		it("should have a link to the collection view constructor", function() {
			expect(base.prototype.collectionviewconstructor).toBe(Mirage.Collection.base);
		});
		describe("the propClickHandler function", function() {
			var click = base.prototype.propClickHandler;
			it("should be defined", function() {
				expect(typeof click).toEqual("function");
			});
			var triggerevents = {},
				data;
			var context = {
				options: {
					model: "woot",
					props: {
						someprop: {
							type: "sometype"
						}
					}
				},
				trigger: function(evt, arg) {
					data = arg;
					triggerevents[evt] = true;
				}
			};
			var $el = $("<div><span class='prop'><span id='target' key='5' class='prop-multi'>foo</span><span key='4' class='prop-multi'>foo</span></span></div>");
			$el.find("span").eq(0).attr("prop-name", "someprop");
			click.call(context,{
				target: $el.find("#target")
			});
			it("should fire propclick event", function() {
				expect(triggerevents["propclick"]).toBeTruthy();
			});
			it("should fire propclick:<type> event", function() {
				expect(triggerevents["propclick:sometype"]).toBeTruthy();
			});
			it("should fire propclick:<type>:<name> event", function() {
				expect(triggerevents["propclick:sometype:someprop"]).toBeTruthy();
			});
			it("should send the model", function() {
				expect(data.model).toEqual(context.options.model);
			});
			it("should send the propdef", function() {
				expect(data.propdef).toEqual(context.options.propdef);
			});
			it("should send the multikey if exists", function() {
				expect(data.key).toEqual("5");
			});
		});

		describe("the events object",function(){
			var events = base.prototype.events;
			it("should have correct clickhandler entry",function(){
				expect(events["click .prop"]).toEqual("propClickHandler");
				expect(events["click .model-submit"]).toEqual("modelSubmitHandler");
			});
		});

		describe("the initialize function",function(){
			var init = base.prototype.initialize;
			var arg = {
				model: {
					on: sinon.spy()
				},
				somedata:"baz",
				props: "WOO"
			};
			var context = {
				propUpdateHandler: {foo:"bar"},
				setElement: sinon.spy(),
				buildElement: sinon.spy(function(o){
					return "BUILD";
				})
			};
			init.call(context,arg);
			it("should set event listener on the model",function(){
				expect(arg.model.on).toHaveBeenCalledWith("change",context.propUpdateHandler,context);
			});
			it("should call buildElement with the args obj",function(){
				expect(context.buildElement).toHaveBeenCalledWith(arg);
			});
			it("should call setElement with result from buildelement",function(){
				expect(context.setElement).toHaveBeenCalledWith("BUILD");
			});
			it("should store props on the context",function(){
				expect(context.props).toEqual(arg.props);
			});
		});

		describe("the getInputValues function", function() {
			var getvals = base.prototype.getInputValues;
			var context = {
				views: {
					foo: {
						getInputValue: function() {
							return 1;
						}
					},
					bar: {
						getInputValue: function() {
							return 2;
						}
					}
				}
			};
			var res = getvals.call(context);
			it("should return an object with vals from individual propviews", function() {
				expect(res).toEqual({
					foo: 1,
					bar: 2
				});
			});
		});

		describe("the propUpdateHandler function",function(){
			var upd = base.prototype.propUpdateHandler;
			var context = {
				views: {
					foo: {
						updateValueElement: sinon.spy()
					},
					bar: {
						updateValueElement: sinon.spy()
					}
				}
			};
			upd.call(context,{
				attributes: {
					foo: "newfoo",
					bar: "newbar",
					baz: "newbaz"
				},
				hasChanged: function(name){return name === "foo";}
			});
			it("should call updatePropView for the relevant views",function(){
				expect(context.views.foo.updateValueElement).toHaveBeenCalledWith("newfoo");
				expect(context.views.bar.updateValueElement).not.toHaveBeenCalledWith("newbar");
			});
		});
	
		describe("the validateProperty function",function(){
			var val = base.prototype.validateProperty;
			describe("when no validation data",function(){
				it("should return empty array",function(){
					expect(val({
						propdef: {}
					})).toEqual([]);
				});
			});
			describe("when have passing validation func",function(){
				var propdef = {
					validate: sinon.spy()
				};
				var data = {
					propdef: propdef,
					value: "val",
					inputs: "allvals"
				};
				var result = val(data);
				it("should call the validate function properly",function(){
					expect(propdef.validate).toHaveBeenCalledWith(data);
				});
				it("should still return nothing",function(){
					expect(result).toEqual([]);
				});
			});
			describe("when have failing validation func",function(){
				var propdef = {
					validate: function(){
						return "ERROR";
					}
				};
				var result = val({
					propdef: propdef,
					value: "val",
					inputs: "allvals"
				});
				it("should include error in output",function(){
					expect(result).toEqual(["ERROR"]);
				});
			});
			describe("when have passing regexes",function(){
				var propdef = {
					regexes: {
						"regex1": "foo",
						"regex2": "fooagain"
					}
				};
				var value = {
					match: sinon.spy(function(regex){
						return ["ok"];
					})
				};
				var result = val({
					propdef: propdef,
					value: value,
					inputs: "allvals"
				});
				it("calls the match function on value",function(){
					expect(value.match).toHaveBeenCalledWith(/regex1/);
					expect(value.match).toHaveBeenCalledWith(/regex2/);
				});
				it("should still return nothing",function(){
					expect(result).toEqual([]);
				});
			});
			describe("when have failing regexes",function(){
				var propdef = {
					regexes: {
						"regex1": "foo",
						"regex2": "fooagain"
					}
				};
				var matchspy = jasmine.createSpy("match");
				var value = {
					match: sinon.spy(function(regex){
						return null;
					})
				};
				var result = val({
					propdef: propdef,
					value: value,
					inputs: "allvals"
				});
				it("returns the errors",function(){
					expect(result).toEqual(["foo","fooagain"]);
				});
			});
			describe("when view has passing validate function",function(){
				var data = {
					propdef: {},
					value: "foo",
					view: {
						validate: sinon.spy()
					}
				};
				var result = val(data);
				it("should call the view validate function correctly",function(){
					expect(data.view.validate).toHaveBeenCalledWith(data);
				});
				it("should still not report errors",function(){
					expect(result).toEqual([]);
				});
			});
			describe("when view has failing validate function",function(){
				var data = {
					propdef: {},
					value: "foo",
					view: {
						validate: function(){ return "VIEWVALERROR";}
					}
				};
				var result = val(data);
				it("should include the errors from the val func",function(){
					expect(result).toEqual(["VIEWVALERROR"]);
				});
			});
		});

		describe("the modelSubmitHandler function",function(){
			var sub = base.prototype.modelSubmitHandler
			describe("when passing validation",function(){
				var inputvals = {foo:"fooval"};
				var context = {
					trigger: sinon.spy(),
					removeFailedValidationMarks: sinon.spy(),
					getInputValues: function(){ return inputvals; },
					props: {
						foo: "foodef"
					},
					validateProperty: sinon.spy(function(data){
						return [];
					}),
					views: {foo:"fooview"}
				};
				sub.call(context);
				it("should call validateProperty with def & vals",function(){
					expect(context.validateProperty).toHaveBeenCalledWith({
						propdef: context.props.foo,
						value: "fooval",
						inputs: inputvals,
						view: "fooview",
						name: "foo"
					});
				});
				it("should trigger submit event with result from getInputValues",function(){
					expect(context.trigger).toHaveBeenCalledWith("submit",inputvals);
				});
				it("should call removeFailedValidationMarks",function(){
					expect(context.removeFailedValidationMarks).toHaveBeenCalled();
				});
			});
			describe("when failing validation",function(){
				var inputvals = {foo:"fooval",bar:"barval"};
				var context = {
					trigger: sinon.spy(),
					getInputValues: function(){ return inputvals; },
					props: {
						foo: "foodef",
						bar: "bardef"
					},
					views: {},
					removeFailedValidationMarks: function(){},
					addFailedValidationMark: sinon.spy(),
					validateProperty: function(data){
						return data.propdef === "foodef" ? ["fooerror"] : [];
					},
				};
				sub.call(context);
				var errordata = {
					foo: {
						name: "foo",
						propdef: "foodef",
						value: "fooval",
						errors: ["fooerror"]
					}
				};
				it("should trigger error event with errors data for failing props",function(){
					expect(context.trigger).toHaveBeenCalledWith("error",{
						inputs: inputvals,
						errors: errordata
					});
				});
				it("should call addFailedValidationMark for the failing prop",function(){
					expect(context.addFailedValidationMark).toHaveBeenCalledWith(errordata.foo);

				});
			});
		});

		describe("the removeFailedValidationMarks function",function(){
			var remove = base.prototype.removeFailedValidationMarks;
			var context = {
				$el: $("<p><span class='prop-failed'><span class='prop-failed'></span></span></p>")
			};
			remove.call(context);
			it("should remove all prop-failed classes",function(){
				expect($(".prop-failed",context.$el).length).toEqual(0);
			});
		});
		
		describe("the addFailedValidationMark function",function(){
			var add = base.prototype.addFailedValidationMark;
			var context = {
				$el: $("<p><span prop-name='foo'><span prop-name='bar'></span></span></p>")
			}
			add.call(context,{
				name: "foo"
			});
			it("should add prop-failed class to offending elements",function(){
				expect(context.$el.find(".prop-failed[prop-name=foo]").length).toEqual(1);
			});
			it("should only add it to that element",function(){
				expect(context.$el.find(".prop-failed").length).toEqual(1);
			});
		});

		describe("the buildElement function", function() {
			var build = base.prototype.buildElement;
			var Fakeview = function(o) {
				return {
					whoami: o.propdef.name,
					mytype: o.propdef.type,
					$el: $("<span>").attr({
						type: o.propdef.type,
						name: o.propdef.name,
						val: o.value,
						editing: o.editing,
						showlabel: o.showlabel
					})
				};
			};
			var basecontext = {
				propviewconstructors: {
					fooprop: Fakeview,
					barprop: Fakeview,
					binprop: Fakeview,
					text: Fakeview
				},
				buildFormSubmitButton: function(opts){
					return "SAVE"+opts.name;
				}
			};
			var props = {
				bar: {
					type: "barprop",
					name: "bar"
				},
				foo: {
					type: "fooprop",
					name: "foo"
				},
				bin: {
					type: "binprop",
					name: "bin"
				}
			};
			var model = {
				attributes: {
					foo: "fooval",
					bar: "barval",
					bin: "binval"
				},
				cid: 666
			};
			var render = {
				props: ["foo", "bar"],
				showlabel: "maybe"
			};
			describe("when called with full args", function() {
				var context = _.clone(basecontext);
				var arg = {
					props: props,
					model: model,
					type: "nicemodel",
					editing: "whatever",
					render: render
				};
				var $res = build.call(context, arg);
				describe("the built element", function() {
					it("should be a div", function() {
						expect($res).toBe("div");
					});
					it("should have correct classes", function() {
						expect($res).toHaveClass("model");
						expect($res).toHaveClass("model-nicemodel");
					});
					it("should have cid as attr",function(){
						expect($res).toHaveAttr("cid",666);
					});
					it("should store the views in context", function() {
						expect(context.views.foo.whoami).toEqual("foo");
						expect(context.views.bar.whoami).toEqual("bar");
					});
					describe("the children", function() {
						it("should have 2 kids", function() {
							expect($res.children().length).toEqual(2);
						});
						describe("the first child", function() {
							var child = $res.children().eq(0);
							it("should have correct attributes", function() {
								expect(child).toHaveAttr("name", "foo");
								expect(child).toHaveAttr("type", "fooprop");
								expect(child).toHaveAttr("val", "fooval");
								expect(child).toHaveAttr("editing", "whatever");
								expect(child).toHaveAttr("showlabel", "maybe");
							});
						});
					});
				});
			});
			describe("when called without render instruction", function() {
				var context = _.clone(basecontext);
				var arg = {
					props: props,
					model: model,
					type: "nicemodel",
					editing: "whatever"
				};
				var $res = build.call(context, arg);
				it("should use all properties",function(){
					expect(context.views.foo.whoami).toEqual("foo");
					expect(context.views.bar.whoami).toEqual("bar");
					expect(context.views.bin.whoami).toEqual("bin");
					expect($res.children().length).toEqual(3);
				});
				it("should show labels",function(){
					expect($res.children().eq(0)).toHaveAttr("showlabel", "true");
				});
			});
			describe("when no names in individual props",function(){
				var context = _.clone(basecontext);
				var arg = {
					props: {
						foo: {
							type: "fooprop",
						}
					},
					model: model
				};
				var $res = build.call(context,arg);
				it("should use the propkey as name",function(){
					expect(context.views.foo.whoami).toEqual("foo");
				});
			});
			describe("when no type in individual props",function(){
				var context = _.clone(basecontext);
				var arg = {
					props: {
						foo: {}
					},
					model: model
				};
				var $res = build.call(context,arg);
				it("should use text as default type",function(){
					expect(context.views.foo.mytype).toEqual("text");
				});
			});
		});
	});
});
