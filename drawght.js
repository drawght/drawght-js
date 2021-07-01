"use strict";

const [PREFIX, ATTRIBUTE, QUERY, ITEM, SUFFIX] = ["{", ".", ":", "#", "}"];
const [KEY, LIST, INDEX] = ["(?<key>.*?)", "(?<list>.*?)", "(?<index>.*?)"];
const EOL = /\r?\n/;

const KEY_PATTERN = new RegExp(`${PREFIX}${KEY}${SUFFIX}`, "g");
const LIST_PATTERN = new RegExp(`${PREFIX}${LIST}${QUERY}${KEY}${SUFFIX}`);
const LIST_PATTERN_GROUP = new RegExp(LIST_PATTERN, "g");
const ITEM_PATTERN = new RegExp(`${KEY}${ITEM}${INDEX}$`);

const getValueFromKey = function(nestedKey, data) {
  return nestedKey.split(ATTRIBUTE).reduce(function(object, key) {
    var list = key.match(ITEM_PATTERN);
    var filter = list ? list.groups : undefined;
    if (object) {
      var value = filter ? object[filter.key] : object[key];
      if (value) {
        if (value instanceof Array && filter && filter.index) {
          return value[Number(filter.index) - 1];
        }

        return value;
      }
    } else {
      return undefined;
    }
  }, data);
}

const parse = function(template, data) {
  return parseKeys(parseQueries(template, data), data);
}

const parseQueries = function(template, data) {
  return template
    .split(EOL)
    .map(function(line) {
      var result = line;
      (line.match(LIST_PATTERN_GROUP) || []).forEach(function(query) {
        var filter = query.match(LIST_PATTERN).groups;
        var value = filter ? getValueFromKey(filter.list, data) : undefined;
        if (value && value instanceof Array && filter.key) {
          var partial = line.replace(new RegExp(`${filter.list}${QUERY}`, "g"), "");
          var parsedLines = value.map(item => parseTemplate(partial, item));
          result = result.replace(line, parsedLines.join("\n"));
        }
      });
      return result;
    }).join("\n");
}

const parseKeys = function(template, data) {
  return template
    .split(EOL)
    .map(line => parseTemplate(line, data))
    .join("\n"); 
}

const parseTemplate = function(template, data) {
  var result = template;
  (template.match(KEY_PATTERN) || []).map(function(templateKey) {
    var key = templateKey.replace(new RegExp(`[${PREFIX}${SUFFIX}]`,"g"), "");
    var value = getValueFromKey(key, data) || templateKey;
    if (value instanceof Array) {
      result = value.map(item => template.replace(templateKey, item)).join("\n");
    } else {
      var patternKey = new RegExp(templateKey, "g");
      if (result.match(patternKey)) {
        result = result.replace(patternKey, value.toString());
      }
    }
  });
  return result;
}

module.exports = {
  parseQueries,
  parseKeys,
  parseTemplate,
  parse,
};
