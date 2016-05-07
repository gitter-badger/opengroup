var OpenGroupPlugins = {};
/**
 * An OpenGroup is an object to construct a p2p group.
 *
 * @constructor
 */
var OpenGroup = function (settings) {
    var that = this;
    this.settings = settings;

    this.peerConnections = [];

    /**
     * Create a new connection. Both sides need to run this function.
     *
     * @param uniquePeerId
     * @returns {PeerConnection}
     */
    this.peerConnectionAdd = function (uniquePeerId) {
        if (!this.peerConnectionGet(uniquePeerId)) {
            var peerConnection = new PeerConnection(uniquePeerId, that);
            this.peerConnections.push(peerConnection);
            return this.peerConnectionGet(uniquePeerId);
        }
        else {
            throw "Connection with " + uniquePeerId + " already exists.";
        }
    };

    this.peerConnectionGet = function (uniquePeerId) {
        var result = $.grep(this.peerConnections, function(e){ return e.id == uniquePeerId; });
        if (result.length) {
            return result[0];
        }
    };

    this.peerConnectionGetAll = function () {
      return this.peerConnections;
    };

    /**
     * Send a message to all connected peers.
     *
     * @param message
     * @param owner
     */
    this.broadcast = function (message, owner) {
        if (!message || !owner) { throw "A broadcast needs a message and an owner of the message, where an owner is a plugin or responsible piece of the software."; }

        $.each(this.peerConnections, function (detla, peerConnection) {
            peerConnection.sendMessage(message, owner);
        });
    };

    /**
     * This is a callback, it gets called by the peerConnection.
     *
     * @param message
     * @param owner
     * @param localUniquePeerId
     */
    this.receiveMessage = function (message, owner, localUniquePeerId) {
        if (typeof this.onMessageReceived == 'function') {
            this.onMessageReceived(message, owner, localUniquePeerId);
        }

        // Route it through the plugins.
        if (message.command && OpenGroupPlugins[owner] && typeof OpenGroupPlugins[owner][message.command] == 'function') {
            if (message.parameters) {
                var parameters = message.parameters;
                parameters.push(that);
                parameters.push(localUniquePeerId);
                OpenGroupPlugins[owner][message.command].apply(this, parameters);
            }
            else {
                OpenGroupPlugins[owner][message.command](that, uniquePeerId);
            }
        }
    };

    this.init = function () {
        $.each(this.settings.plugins, function (delta, plugin) {
            $.getScript('/js/' + plugin + '.js');
        });

        this.renderer = new Renderer();
        this.render = function (templateName, data, method, selector, callback) { this.renderer.render(templateName, data, method, selector, callback); };
        this.initMenu();
        this.initPeers();
    };

    this.initPeers = function () {
        this.render('peers.list', opengroup);
    };

    this.initMenu = function () {
        var buttons = [];
        $.each(this.settings.plugins, function (pluginDelta, plugin) {

            if (OpenGroupPlugins[plugin] && OpenGroupPlugins[plugin].hooks && typeof OpenGroupPlugins[plugin].hooks.init == 'function') {
                OpenGroupPlugins[plugin].hooks.init();
            }

            if (OpenGroupPlugins[plugin] && OpenGroupPlugins[plugin].hooks && OpenGroupPlugins[plugin].hooks.actions) {
                $.each(OpenGroupPlugins[plugin].hooks.actions, function (actionCommand, action) {
                    buttons.push({
                        plugin: plugin,
                        action: action
                    });

                    if (typeof action.init == 'function') {
                        action.init();
                    }
                })
            }
        });

        this.render('menu', { buttons: buttons });
    }
};

window.errorCatcher = function (e) {
    console.log('error:', e)
};

rivets.binders['menu-link'] = {
    bind: function(el) {
        if (typeof this.model.action.buttonAttributes == 'object') {
            $.each(this.model.action.buttonAttributes, function (attributeName, attributeValue) {
              $(el).attr(attributeName, attributeValue);
            })
        }
    },

    unbind: function(el) {

    }
};

rivets.formatters.propertyList = function(obj) {
    return (function() {
        var properties = [];
        for (key in obj) {
            properties.push({key: key, value: obj[key]});
        }
        return properties;
    })();
};
