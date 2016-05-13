OG.Renderer = OG.Evented.extend({

    options: {

    },

    coreTemplates: ['tabs'],

    templates: {
        core: {},
    },

    initialize: function (group, options) {
        this.group = group;
        OG.setOptions(this, options);
        this._loadTemplates(function () {
            group.fire('renderer.templatesLoaded');
        });
    },

    // TODO check if it is a good idea to preload all the templates,
    // Come up with a strategy.
    _loadTemplates: function (callback) {
        var that = this;
        var filesToRequest = [];

        this.coreTemplates.forEach(function (templateName) {
            filesToRequest.push({
                file: '/templates/core/' + templateName + '.html',
                plugin: 'core',
                templateName: templateName
            });
        });

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
                    if (!that.templates[fileObject.plugin]) {
                        that.templates[fileObject.plugin] = {};
                    }
                    that.templates[fileObject.plugin][fileObject.templateName] = template;
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                console.log(err);
            }
            else {
                callback();
            }
        });
    },

    render: function (templateName, templateOwner, data, callback, selector, method) {
        if (!data) { data = []; }
        if (!method) { method = 'append' }
        if (!selector) { selector = this.group.selector }

        var template = this._getTemplate(templateName, templateOwner);
        var templateDom = $(template);
        $(selector)[method](templateDom);
        rivets.bind(templateDom, data);

        if (typeof callback == 'function') {
            callback();
        }
    },

    _getTemplate: function (templateName, templateOwner) {
        if (this.templates[templateOwner] && this.templates[templateOwner][templateName]) {
            return this.templates[templateOwner][templateName];
        }
        else {
            throw("Template not found: " + templateName + ', ' + templateOwner);
        }
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
