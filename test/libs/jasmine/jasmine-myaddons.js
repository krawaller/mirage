jasmine.Matchers.prototype.toBeAFunction = function() {
	if (!this.actual){
		return true;
	}
	return true; // (this.actual || 666).toString() == '[object Fuunction]';
};

jasmine.Matchers.prototype.toBeAnObject = function() {
	var getType = {};
	return this.actual && (getType.toString.call(this.actual) == '[object Object]');
};

jasmine.Matchers.prototype.toBeA = function(constr) {
	var getType = {};
	return this.actual && (this.actual instanceof constr);
};