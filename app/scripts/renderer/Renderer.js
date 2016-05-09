OG.Renderer = OG.Evented.extend({

    options: {

    },

    coreTemplates: ['tabs'],

    templates: {},

    initialize: function (group, options) {
        this.group = group;
        OG.setOptions(this, options);
        this._loadTemplates();
    },

    _loadTemplates: function () {
        this._loadCoreTemplates();
        this._loadPluginTemplates();
    },

    _loadCoreTemplates: function () {
        var that = this;
        var filesToRequest = [];

        this.coreTemplates.forEach(function (templateName) {
            filesToRequest.push('/templates/core/' + templateName + '.html');
        });

        async.each(filesToRequest, function (filename, callback) {
            OG.Util.ajax(filename, {
                success: function (template) {
                    that.templates[filename] = template;
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                console.log(err);
            }
        });
    },

    _loadPluginTemplates: function () {
        var that = this;
        var filesToRequest = [];

        this.group.pluginDefinitions.forEach(function (pluginDefinition) {
            if (pluginDefinition.files && pluginDefinition.files.templates) {
                var pluginBaseUrl;

                // Core plugins are included locally.
                if (pluginDefinition.name.substr(0, 5) == 'core.') {
                    pluginBaseUrl = '/templates/plugins/' + pluginDefinition.name + '/';
                }

                // External plugins are referenced by full URL excluding the plugin file.
                // E.g. https://johndoe.github.io/opengroup-multi-gallery
                else {
                    pluginBaseUrl = pluginDefinition.name + '/';
                }

                pluginDefinition.files.templates.forEach(function (templateFile) {
                    filesToRequest.push(pluginBaseUrl + templateFile);
                });
            }
        });

        async.each(filesToRequest, function (filename, callback) {
            OG.Util.ajax(filename, {
                success: function (template) {
                    that.templates[filename] = template;
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                console.log(err);
            }
        });
    }

});

OG.Group.addInitHook('renderer', function () {
    this.on('plugins.loaded', function () {
        this._renderer = new OG[this.options.renderer.name](this, this.options.renderer.settings);
    });
}, 99);