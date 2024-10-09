import _ from 'lodash';

let data = {};

export function load(langData) {
  data = langData;
}

export function t(key, parameters) {
  if (_.isEmpty(data)) {
    console.warn("STemplate data is not loaded!");
    return key;
  }

  key = key.replace('::', '__');

  let translatedString = _.get(data, key, key);

  return translateKeys(translatedString, parameters);
}

export function trans(key, parameters) {
  return t(key, parameters);
}

export function trans_choice(key, countValue, parameters) {
  let line = t(key, parameters);
  parameters = parameters || {};
  parameters.count = countValue;
  let translatedString = choose(line, countValue);
  return translateKeys(translatedString, parameters);
}

function translateKeys(string, parameters) {
  if (!parameters) {
    return string;
  }

  _.each(parameters, function (parse_value, parse_key) {
    string = _.replace(string, ":" + parse_key, parse_value);
  });

  return string;
}

function choose(line, number) {
  let segments = _.split(line, '|');

  let value = extract(segments, number);

  if (value !== null) {
    return value.trim();
  }

  segments = stripConditions(segments);
  let pluralIndex = number == 1 ? 0 : 1;

  if (segments.length === 1 || !(pluralIndex in segments)) {
    return segments[0];
  }

  return segments[pluralIndex];
}

function stripConditions(segments) {
  for (let counter = 0; counter < segments.length; counter++) {
    segments[counter] = segments[0].replace(/^[\{\[]([^\[\]\{\}]*)[\}\]]/, '');
  }

  return segments;
}

function extractFromString(part, number) {
  let matches = part.match(/^[\[\{]([\0-Z\\\^-z\|~-\uFFFF]*)[\]\}]([\0-\uFFFF]*)/);

  if (matches === null || matches.length !== 3) {
    return null;
  }

  let condition = matches[1];
  let value = matches[2];

  if (condition.includes(',')) {
    let fromTo = condition.split(',', 2);

    if (fromTo[1] === '*' && number >= fromTo[0]) {
      return value;
    } else if (fromTo[0] === '*' && number <= fromTo[1]) {
      return value;
    } else if (number >= fromTo[0] && number <= fromTo[1]) {
      return value;
    }
  }

  return condition === number ? value : null;
}

function extract(segments, number) {
  for (let counter = 0; counter < segments.length; counter++) {
    let line = extractFromString(segments[counter], number);

    if (line !== null) {
      return line;
    }
  }

  return null;
}

export default {
  load,
  trans,
  trans_choice
}