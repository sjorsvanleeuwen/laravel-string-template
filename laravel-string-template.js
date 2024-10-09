import _ from 'lodash';

module.exports = {
  data: {},
  t(key, parameters) {
    if (_.isEmpty(this.data)) {
      console.warn("STemplate data is not loaded!");
      return key;
    }

    key = key.replace('::', '__');

    let translatedString = _.get(this.data, key, key);

    return this.translateKeys(translatedString, parameters);
  },
  translateKeys(string, parameters) {
    if (!parameters) {
      return string;
    }

    _.each(parameters, function (parse_value, parse_key) {
      string = _.replace(string, ":" + parse_key, parse_value);
    });

    return string;
  },
  trans(key, parameters) {
    return this.t(key, parameters);
  },
  trans_choice(key, countValue, parameters) {
    let line = this.t(key, parameters);
    parameters = parameters || {};
    parameters.count = countValue;
    let translatedString = this.choose(line, countValue);
    return this.translateKeys(translatedString, parameters);
  },
  choose(line, number) {
    let segments = _.split(line, '|');

    let value = this.extract(segments, number);

    if (value !== null) {
      return value.trim();
    }

    segments = this.stripConditions(segments);
    let pluralIndex = number == 1 ? 0 : 1;

    if (segments.length === 1 || !(pluralIndex in segments)) {
      return segments[0];
    }

    return segments[pluralIndex];
  },
  stripConditions(segments) {
    for (let counter = 0; counter < segments.length; counter++) {
      segments[counter] = segments[0].replace(/^[\{\[]([^\[\]\{\}]*)[\}\]]/, '');
    }

    return segments;
  },
  extractFromString(part, number) {
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
  },
  extract(segments, number) {
    for (let counter = 0; counter < segments.length; counter++) {
      let line = this.extractFromString(segments[counter], number);

      if (line !== null) {
        return line;
      }
    }

    return null;
  },
  load(data) {
    this.data = data;
  }
};
