/**
 * This file consolidates all the template helpers that would be used
 * for handlebars rendering engine to provide basic conveniences.
 * @file 
 */
const  operators = require('./operators.js');


/**
 * Consolidation of all template helpers for handlebars
 */
const template_helpers = Object.assign({},
	operators,
	
);
module.exports = template_helpers;
// export default template_helpers;