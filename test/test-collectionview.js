describe("The Collection functionality",function(){
	it("is defined", function() {
		expect(Mirage.Collection).toBeA(Object);
	});
	describe("the base view",function(){
		var base = Mirage.Collection.base;
		it("is defined", function() {
			expect(base).toBeA(Function);
		});
		it("has shortcut to modelviewconstructor",function(){
			expect(base.prototype.modelviewconstructor).toEqual(Mirage.Model.base);
		});
		it("inherits from Backbone View", function() {
			expect(base.__super__).toBe(Backbone.View.prototype);
		});
		it("has a clickhandler for models",function(){
			expect(base.prototype.events).toEqual({
				"click .model":"modelClickHandler"
			});
		});
		describe("the initialize func",function(){
			var init = base.prototype.initialize;
			it("is defined", function() {
				expect(base).toBeA(Function);
			});
			var context = {
				foo:"bar",
				buildElement: sinon.stub().returns("somehtml"),
				setElement: sinon.spy(),
				addAllModels: sinon.spy()
			};
			var arg = {
				collection: {
					on: sinon.spy(),
					models: [{cid:1},{cid:2},{cid:45}]
				}
			};
			init.call(context,arg);
			it("sets event listeners on the collection",function(){
				expect(arg.collection.on).toHaveBeenCalledWith("add","addModelView",context);
				expect(arg.collection.on).toHaveBeenCalledWith("remove","removeModelView",context);
			});
			it("should call buildElement, passing along arg",function(){
				expect(context.buildElement).toHaveBeenCalledWith(arg);
			});
			it("should call setElement with result from buildElement",function(){
				expect(context.setElement).toHaveBeenCalledWith("somehtml");
			});
			it("should call addAllModels with all models from the collection",function(){
				expect(context.addAllModels).toHaveBeenCalledWith(arg.collection.models);
			});
		});
		describe("the buildElement function",function(){
			var build = base.prototype.buildElement;
			var arg = {
				type: "sometype"
			};
			var context = {
				
			};
			var res = build.call(context,arg);
			it("should return a div",function(){
				expect(res).toBe("div");
			});
			it("should have correct classes",function(){
				expect(res).toHaveClass("collection");
				expect(res).toHaveClass("collection-sometype");
			});
			it("should set modeltype as attr",function(){
				expect(res).toHaveAttr("model-type","sometype");
			});
		});
		describe("the addModelView function",function(){
			var Fakeview = function(o) {
				return {
					whoami: o.model.cid,
					$el: o
				};
			};
			var add = base.prototype.addModelView;
			var context = {
				modelviewconstructor: Fakeview,
				$el: {
					append: sinon.spy()
				},
				options: {
					type: "sometypeofmodel",
					props: "someprops",
					render: "somerenderinstr"
				},
				views: {}
			};
			var model = {
				cid: 666
			};
			add.call(context,model);
			it("should append the correct object to the element",function(){
				expect(context.$el.append).toHaveBeenCalledWith({
					model: model,
					type: "sometypeofmodel",
					props: "someprops",
					render: "somerenderinstr"
				});
			});
			it("should add the view to the views context prop",function(){
				expect(context.views[666].whoami).toEqual(model.cid);
			});
		});
		describe("the removeModelView function",function(){
			var remove = base.prototype.removeModelView,
				model = {cid: 777},
				spy = sinon.spy();
			var context = {
				views: {
					777:{
						remove: spy
					} 
				}
			};
			remove.call(context,model);
			it("should call remove on the affected view",function(){
				expect(spy).toHaveBeenCalled();
			});
			it("should delete the view from the views obj",function(){
				expect(context.views[777]).toEqual(undefined);
			});
		});
		describe("the addAllModels function",function(){
			var addall = base.prototype.addAllModels;
			var context = {
				addModelView: sinon.spy()
			};
			var arg = [{cid:1},{cid:2},{cid:45}];
			addall.call(context,arg);
			it("should call the addmodelview once per model",function(){
				expect(context.addModelView).toHaveBeenCalledWith({cid:1});
				expect(context.addModelView).toHaveBeenCalledWith({cid:2});
				expect(context.addModelView).toHaveBeenCalledWith({cid:45});
			});
		});
		describe("the modelClickHandler function",function(){
			var click = base.prototype.modelClickHandler;
			var context = {
				options: {
					collection: {
						getByCid: function(cid){
							return {cid:cid};
						}
					},
					type: "sometype"
				},
				trigger: sinon.spy()
			};
			var $el = $("<div><span id='target' class='model' cid=5>foo</span><span class='model' cid=4>foo</span></span></div>");
			
			var listener = sinon.spy();
			var listener2 = sinon.spy();
			Mirage.on("modelclick",listener);
			Mirage.on("modelclick:sometype",listener2);
			
			click.call(context,{
				target: $el.find("#target")
			});
			
			Mirage.off("modelclick",listener);
			Mirage.off("modelclick:sometype",listener2);
			
			var expecteddata = {cid:"5"};
			it("should fire all relevant events", function() {
				expect(context.trigger).toHaveBeenCalledWith("modelclick",expecteddata);
				expect(context.trigger).toHaveBeenCalledWith("modelclick:sometype",expecteddata);
			});
			it("should also fire the events on the Mirage object",function(){
				expect(listener).toHaveBeenCalledWith(expecteddata);
				expect(listener2).toHaveBeenCalledWith(expecteddata);
			});
		});
	});
});