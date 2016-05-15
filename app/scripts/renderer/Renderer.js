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
    },

    render: function (templateName, templateOwner, data, callback, selector, method) {},

    _getTemplate: function (templateName, templateOwner, callback) {
        var that = this;

        // Use the template from the cache.
        if (this.templates[templateOwner] && this.templates[templateOwner][templateName]) {
            return this.templates[templateOwner][templateName];
        }
        else {
            var templatePath;
            var basePath = 'http://localhost:9000';

            // Core or core plugin templates.
            if (templateOwner == 'core' || templateOwner.substr(0, 4) == 'core') {
                if (templateOwner == 'core') {
                    templatePath = basePath + '/templates/core/' + templateName + '.html';
                }
                else {
                    templatePath = basePath + '/templates/plugins/' + templateOwner + '/' + templateName + '.html';
                }
            }

            // External plugins.
            // TODO create the first external plugin.
            else {

            }

            OG.Util.ajax(templatePath, {
                success: function (template) {
                    if (!that.templates[templateOwner]) {
                        that.templates[templateOwner] = {};
                    }
                    that.templates[templateOwner][templateName] = template;

                    if (typeof callback == 'function') {
                        callback(template);
                    }
                }
            })
        }
    }

});


OG.Group.include({
    render: function () {
        this._renderer.render.apply(this._renderer, arguments);
    }
});

OG.Group.addInitHook('renderer', function () {
    this._renderer = new OG[this.options.renderer.name](this, this.options.renderer.settings);
    this.render('header', 'core', this);
}, 99);
