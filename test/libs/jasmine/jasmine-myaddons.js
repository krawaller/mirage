beforeEach(function(){
	this.addMatchers({
		toBeAFunction: function() {
			return typeof this.actual === "function";
		},
		toBeAnObject: function() {
			return typeof this.actual === "object";
		},
		toBeA: function(constr) {
			return this.actual instanceof constr;
		}
	});
});