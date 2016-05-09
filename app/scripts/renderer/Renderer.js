OG.Renderer = OG.Evented.extend({

    options: {

    },

    coreTemplates: ['tabs'],

    templates: {
        core: {},
        plugins: {}
    },

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
            filesToRequest.push({
                file: '/templates/core/' + templateName + '.html',
                templateName: templateName
            });
        });

        async.each(filesToRequest, function (fileObject, callback) {
            OG.Util.ajax(fileObject.file, {
                success: function (template) {
                    that.templates['core'][fileObject.templateName] = template;
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
                    filesToRequest.push({
                        file: pluginBaseUrl + templateFile + '.html',
                        plugin: pluginDefinition.name,
                        templateName: templateFile
                    });
                });
            }
        });

        async.each(filesToRequest, function (fileObject, callback) {
            OG.Util.ajax(fileObject.file, {
                success: function (template) {
                    if (!that.templates.plugins[fileObject.plugin]) {
                        that.templates.plugins[fileObject.plugin] = {};
                    }
                    that.templates.plugins[fileObject.plugin][fileObject.templateName] = template;
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
        console.log(this)
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
