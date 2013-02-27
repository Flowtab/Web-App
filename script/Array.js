if (!Array.prototype.contains)
Array.prototype.contains = function Array_prototype_contains(value) {
	for (var i = 0, l = this.length; i !== l; ++i)
		if (this[i] === value)
			return true;
	
	return false;
};

if (!Array.prototype.remove)
Array.prototype.remove = function Array_prototype_remove(from, to) {
	if (this.length === 0)
		return -1;
	
	var value = this.slice((to || from) + 1 || this.length);
	
	this.length = from < 0 ? this.length + from : from;

	return this.push.apply(this, value);
};

if (!Array.prototype.indexOf) // ECMA-262
Array.prototype.indexOf = function Array_prototype_indexOf(value, from) {
	var i = this.length,
		from = Number(from) || 0;
	
	from = from < 0 ? Math.ceil(from) : Math.floor(from);
	
	if (from < 0)
		from += i;
	
	for (; from < i; ++from)
		if (from in this && this[from] === value)
			return from;
	
	return -1;
};