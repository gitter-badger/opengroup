OG.Renderer = OG.Evented.extend({

    options: {

    },

    coreTemplates: ['tabs'],

    templates: {},

    initialize: function (group, options) {
        this.group = group;
        OG.setOptions(this, options);
        this._loadTemplates();
        this.group.fire('renderer.initiated');
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
    },

    render: function (templateName, templateOwner, data, method, selector, callback) {
        if (!data) { data = []; }
        if (!method) { method = 'append' }
        if (!selector) { selector = 'body' }

        this._getTemplate(templateName, function (name, owner) {
            var templateDom = $(template);
            $(selector)[method](templateDom);
            rivets.bind(templateDom, data);

            if (typeof callback == 'function') {
                callback();
            }
        });
    },

    _getTemplate: function (name, owner) {
        console.log('yo')
    }

});


OG.Group.include({
    render: function () {
        this._renderer.render.apply(this._renderer, arguments);
    }
});

OG.Group.addInitHook('renderer', function () {
    this.on('plugins.loaded', function () {
        this._renderer = new OG[this.options.renderer.name](this, this.options.renderer.settings);
    });
}, 99);
