OG.Group.include({
    _loadPlugins: function () {
        var that = this;
        var filesToRequest = [];

        this.options.plugins.forEach(function (plugin) {
            var pluginDefinitionLocation;

            // Core plugins are included locally.
            if (plugin.substr(0, 5) == 'core.') {
                pluginDefinitionLocation = '/plugins/' + plugin + '.json';
            }

            // External plugins are referenced by full URL excluding the plugin file.
            // E.g. https://johndoe.github.io/opengroup-multi-gallery
            else {
                pluginDefinitionLocation = plugin + '/plugin.json';
            }

            filesToRequest.push(pluginDefinitionLocation);
        });

        async.each(filesToRequest, function (filename, callback) {
            OG.Util.ajax(filename).done(function (pluginDefinition) {
                if (pluginDefinition && pluginDefinition.name) {
                    that.pluginDefinitions.push(pluginDefinition);
                    that._initPlugin(pluginDefinition.name);
                }

                callback();
            });
        }, function(err) {
            if (err) {
                console.log(err);
            }
            else {
                that.fire('plugins.loaded');
            }
        });
    },

    _getPluginDefinition: function (plugin) {
        var pluginDefinitionToLoad;

        this.pluginDefinitions.forEach(function (pluginDefinition) {
            if (pluginDefinition.name == plugin) {
                pluginDefinitionToLoad = pluginDefinition;
            }
        });

        return pluginDefinitionToLoad;
    },

    _initPlugin: function (plugin) {
        var pluginDefinition = this._getPluginDefinition(plugin);
        var filesToRequest = [];

        // Load all extra files.
        if (pluginDefinition.files && pluginDefinition.files.javascript) {
            pluginDefinition.files.javascript.forEach(function (filename) {
                var pluginBaseUrl;

                if (pluginDefinition.core) {
                    pluginBaseUrl = '/';
                }
                else {
                    pluginBaseUrl = plugin + '/';
                }

                filesToRequest.push(pluginBaseUrl + filename);
            });

            async.each(filesToRequest, function (filename, callback) {
                OG.Util.ajax(filename).done(function () {
                    callback();
                });
            }, function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
});

OG.Group.addInitHook('plugins', function () {
    this._loadPlugins();
});