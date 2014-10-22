# hapi-swagger-models

This is a plugin for [HAPI](http://hapijs.com/) v6 or 7. When installed it will generate javascript models from a self-documenting Swagger API. Currently only Backbone models are supported.

## Install

You can add the module to your HAPI project using npm:

    $ npm install hapi-swagger-models --save

## Adding the plug-in into your project

In your server init file, add the following code after you have created the `server` object:

    server.pack.register({
        plugin: require('hapi-swagger-models'),
        options: {
            api: 'http://localhost:8000/docs',
            filePath: '/static/models/models.js'
        }
    }, function(err) {
        if (err) {
            server.log('hapi-swagger-models load error: ' + err);
        }
    });

## Testing your config

If you get no errors in the log, you should be able to now access your running HAPI project and add `/static/models/models.js` (or whatever file path values you supplied) to the end of your root URL to see the backbone models generated.
