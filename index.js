(function() {
    var client = require('swagger-client'),
        util   = require('util'),
        config = {
                fileOutput: null,
                filePath: null,
                api: null,
                format: 'backbone'
            }

    exports.register = function(plugin, options, next) {
        Object.keys(options).forEach(function(k) {
            if (config[k] !== undefined) {
                config[k] = options[k];
            }
        });

        if (!config.api) {
            console.error('API Url Endpoint Required');
            return next();
        }

        if (config.fileOutput) {
            console.log('File Writing not yet supported');
            return next();
        }

        if (config.filePath) {
            if (config.format === 'backbone') {
                plugin.route({
                    method: 'GET',
                    path: config.filePath,
                    config: {
                        handler: function(request, reply) {
                            var swagger = new client.SwaggerApi({
                                url: config.api,
                                success: function() {
                                    var api,
                                        apiName,
                                        model,
                                        modelName,
                                        property,
                                        script,
                                        scriptModel,
                                        scriptValidation;
                                    script = [];
                                    if (swagger.ready === true) {
                                        for (apiName in swagger.apis) {
                                            api = swagger.apis[apiName];
                                            for (modelName in api.models) {
                                                model = api.models[modelName];
                                                scriptModel = [];
                                                scriptValidation = [];
                                                for (var _i = 0, _len = model.properties.length; _i < _len; _i++) {
                                                    property = model.properties[_i];
                                                    if (scriptModel.length > 0) {
                                                        scriptModel[scriptModel.length - 1] += ',';
                                                    }
                                                    if (property.defaultValue !== null) {
                                                        property.defaultValue = util.format('\'%s\'', property.defaultValue);
                                                    }
                                                    scriptModel.push(util.format('           %s: %s', property.name, property.defaultValue));
                                                    if (property.required) {
                                                        scriptValidation.push.apply(scriptValidation, [
                                                            util.format('           if (!attrs.%s) {', property.name),
                                                            util.format('               return \'Please fill %s field.\';', property.name),
                                                            '           }'
                                                        ]);
                                                    }
                                                }
                                                script.push.apply(script, [
                                                    '   var ' + model.name + ' = Backbone.Model.extend({',
                                                    '       urlRoot: \'' + api.basePath + '/' + api.path + '\',',
                                                    '       url: function() {',
                                                    '           return this.urlRoot + \'/\' + this.id;',
                                                    '       },',
                                                    '       defaults: {',
                                                    scriptModel.join('\n'),
                                                    '       },',
                                                    '       validate: function (attrs) {',
                                                    scriptValidation.join('\n'),
                                                    '       }',
                                                    '   });'
                                                ]);
                                            }
                                        }
                                        return reply(script.join('\n')).type('application/javascript');
                                    }
                                },
                                failure: function() {
                                    console.log('Swagger API Call failed');
                                    return reply('');
                                }
                            });
                        }
                    }
                })
            }
        }
    }

    exports.register.attributes = {
        pkg: require('./package')
    };
})();
