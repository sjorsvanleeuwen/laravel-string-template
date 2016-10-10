module.exports = {
	data: {},
	cache: {},

	get(key, parameters) {
		if(_.isEmpty(this.data))
		{
			console.warn("STemplate data is not loaded!");
			return key;
		}
		var value = _.get(this.data, key, key);
		if(!parameters)
		{
			return value;
		}

		_.each(parameters, function(parse_value, parse_key)
		{
			value = _.replace(value, ":" + parse_key, parse_value);
		});
		return value;
	},

	load(data) {
		this.data = data;
	}
};