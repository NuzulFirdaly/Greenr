/**
 * This file contains the implementation of commonly used operators within handlebars
 * @file operators.mjs
 */

/**
 * Provides a set of logic helpers
**/
const operators = {
	"negate": negate,
	"cmp_eq": cmp_eq,
	"cmp_ne": cmp_ne,
	"cmp_gt": cmp_gt,
	"cmp_ge": cmp_ge,
	"cmp_lt": cmp_lt,
	"cmp_le": cmp_le,
	"and"   : and,
	"xor"   : xor,
	"or"    : or,
	"op_sub": sub,
	"op_sum": sum,
	"op_mul": mul,
	"op_div": div,
};

module.exports = operators;
/** Negates the given expression */
function negate(a)    { return !a;     }
/** Compare with == */
function cmp_eq(a, b) { return a == b; }
/** Compare with != */
function cmp_ne(a, b) { return a != b; }
/** Compare with >= */
function cmp_ge(a, b) { return a >= b; }
/** Compare with > */
function cmp_gt(a, b) { return a > b;  }
/** Compare with <= */
function cmp_le(a, b) { return a <= b; }
/** Compare with < */
function cmp_lt(a, b) { return a < b;  }

/** Logical OR against all parameters */
function or(...logic) { 

	var result = arguments[0];
	for (var i = 1; i < arguments.length; ++i)
		result = result || arguments[i];
	return result;
}

/** Logical XOR against all parameters */
function xor(...logic) { 

	var result = arguments[0];
	for (var i = 1; i < arguments.length; ++i)
		result = result ^ arguments[i];
	return result;
}

/** Logical AND against all parameters */
function and(...logic) { 

	var result = arguments[0];
	for (var i = 1; i < arguments.length; ++i)
		result = result && arguments[i];
	return result;
}

/** Sum of p0+p1+p2+...pn */
function sum(...param) { 
	var result = arguments[0];
	for (var i = 1; i < arguments.length - 1; ++i)
		result = result + arguments[i];

	return result;
}

/** Subtraction of p0-p1-p2...pn */
function sub(...param) { 
	var result = arguments[0];
	for (var i = 1; i < arguments.length - 1; ++i)
		result = result - arguments[i];
	return result;
}

/** Multiplication of p0*p1*p2*...pn */
function mul(...param) { 
	var result = arguments[0];
	for (var i = 1; i < arguments.length  - 1; ++i)
		result = result * arguments[i];
	return result;
}

/** Division of p0/p1/p2/...pn */
function div(...param) { 
	var result = arguments[0];
	for (var i = 1; i < arguments.length  - 1; ++i)
		result = result / arguments[i];
	return result;
}

