var _ = require('underscore');
var _s = require('underscore.string');

var helper = require('./helper');

function formatText(elem, options) {
	var text = (options.isInPre ? elem.raw : _s.strip(elem.raw));
	text = helper.decodeHTMLEntities(text);

	if (options.isInPre) {
		return text;
	} else {
		return helper.wordwrap(elem.needsSpace ? ' ' + text : text, options.wordwrap);
	}
}

function formatImage(elem, options) {
	if (options.ignoreImage) {
		return '';
	}

	var result = '', attribs = elem.attribs || {};
	if (attribs.alt) {
		result += attribs.alt;
		if (attribs.src) {
			result += ' ';
		}
	}
	if (attribs.src) {
		result += '[' + attribs.src + ']';
	}
	return (result);
}

function formatParagraph(elem, fn, options) {
	return fn(elem.children, options) + '\n';
}

function formatHeading(elem, fn, options) {
	return fn(elem.children, options).toUpperCase() + '\n';
}

// If we have both href and anchor text, format it in a useful manner:
// - "anchor text [href]"
// Otherwise if we have only anchor text or an href, we return the part we have:
// - "anchor text" or
// - "href"
function formatAnchor(elem, fn, options) {
	var href = '';
	// Always get the anchor text
	var result = _s.strip(fn(elem.children || [], options));
	if (!result) {
		result = '';
	}

	if (!options.ignoreHref) {
		// Get the href, if present
		if (elem.attribs && elem.attribs.href) {
			href = elem.attribs.href.replace(/^mailto\:/, '');
		}
		if (href) {
			if (options.linkHrefBaseUrl && href.indexOf('/') == 0) {
				href = options.linkHrefBaseUrl + href;
			}
			if (!options.hideLinkHrefIfSameAsText || href != result) {
				result += ' [' + href + ']';
			}
		}
	}
	return formatText({ raw: result || href, needsSpace: elem.needsSpace }, options);
}

function formatListItem(prefix, elem, fn, options) {
	options = _.clone(options);
	// Reduce the wordwrap for sub elements.
	if (options.wordwrap) {
		options.wordwrap -= prefix.length;
	}
	// Process sub elements.
	var text = fn(elem.children, options);
	// Replace all line breaks with line break + prefix spacing.
	text = text.replace(/\n/g, '\n' + _s.repeat(' ', prefix.length));
	// Add first prefix and line break at the end.
	return prefix + text;
}

function formatUnorderedList(elem, fn, options) {
	var result = '';
	_.each(elem.children, function(elem) {
		result += formatListItem(' * ', elem, fn, options);
	});
	return result + '\n';
}

exports.text = formatText;
exports.image = formatImage;
exports.paragraph = formatParagraph;
exports.anchor = formatAnchor;
exports.heading = formatHeading;
exports.unorderedList = formatUnorderedList;
exports.listItem = formatListItem;