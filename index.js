(function() {
    var client = require('swagger-client'),
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
                                        script;
                                    if (swagger.ready === true) {
                                        script = [
                                            '(function () {'
                                        ];
                                        for (apiName in swagger.apis) {
                                            api = swagger.apis[apiName];
                                            for (modelName in api.models) {
                                                model = api.models[modelName];
                                                script.push.apply(script, [
                                                    '   var ' + model.name + ' = Backbone.Model.extend({',
                                                    '       defaults: {'
                                                ]);
                                                for (var _i = 0, _len = model.properties.length; _i < _len; _i++) {
                                                    property = model.properties[_i];
                                                    script.push('           ' + property.name + ': ' + property.defaultValue);
                                                }
                                                script.push.apply(script, [
                                                    '       }',
                                                    '   });'
                                                ]);
                                            }
                                        }
                                        script.push('})();');
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
