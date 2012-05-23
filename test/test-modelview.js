describe("The Model functionality",function(){
	it("is defined",function(){
		expect(Mirage.Model).toBeA(Object);
	});
	describe("the model base view",function(){
		var base = Mirage.Model.Base;
		it("should inherit from Backbone View",function(){
			expect(base.__super__).toBe(Backbone.View.prototype);
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
					$el: $("<span class='prop'><span id='target' key='5' class='prop-multi'>foo</span><span key='4' class='prop-multi'>foo</span></span>").attr("prop-name","someprop")
				};
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
	});
});