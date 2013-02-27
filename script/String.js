if (!String.format)
String.format = function String_format(value) {
	if (arguments.length === 0)
		return null;
	
	for (var i = 1, l = arguments.length; i !== l; ++i)
		value = value.replace(RegExp('\\{' + (i-1) + '\\}','gm'), arguments[i]);
	
	return value;
};

if (!String.toRegExp)
String.toRegExp = function String_toRegExp(pattern, flags) {
	return new RegExp(pattern.replace(/[\[\]\\{}()+*?.$^|]/g, function (match) { return '\\' + match; }), flags);
};

if (!String.isNullOrWhitespace)
String.isNullOrWhitespace = function String_isNullOrWhitespace(value) {
	return typeof value === 'string' && value.length !== 0 ? value.trim().length === 0 : true;
};

if (!String.prototype.trim)
String.prototype.trim = function String_prototype_trim() {
	return this.replace(/^\s+|\s+$/g, '');
};