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
        console.log(this.group.pluginDefinitions)
        this.group.pluginDefinitions.forEach(function (pluginDefinition) {
            //console.log(pluginDefinition)
        })
    }

});

OG.Group.addInitHook('renderer', function () {
    this.on('plugins.loaded', function () {
        this._renderer = new OG[this.options.renderer.name](this, this.options.renderer.settings);
    });
}, 99);