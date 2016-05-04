var OpenGroupPlugins = {};
/**
 * An OpenGroup is an object to construct a p2p group.
 *
 * @constructor
 */
var OpenGroup = function (settings) {
    var that = this;
    this.settings = settings;

    this.peerConnections = {};

    /**
     * Create a new connection. Both sides need to run this function.
     *
     * @param uniquePeerId
     * @returns {PeerConnection}
     */
    this.peerConnectionAdd = function (uniquePeerId) {
        if (!this.peerConnections[uniquePeerId]) {
            return this.peerConnections[uniquePeerId] = new PeerConnection(uniquePeerId, that);
        }
        else {
            throw "Connection with " + uniquePeerId + " already exists.";
        }
    };

    /**
     * Send a message to all connected peers.
     *
     * @param message
     * @param owner
     */
    this.broadcast = function (message, owner) {
        if (!message || !owner) { throw "A broadcast needs a message and an owner of the message, where an owner is a plugin or responsible piece of the software."; }

        Object.keys(this.peerConnections).forEach(function(peerConnectionId) {
            that.peerConnections[peerConnectionId].sendMessage(message, owner);
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
        this.render = function (templateName, data, method, selector) { this.renderer.render(templateName, data, method, selector); };
        this.initMenu();
    };

    this.initMenu = function () {
        var buttons = [];
        $.each(this.settings.plugins, function (pluginDelta, plugin) {
            if (OpenGroupPlugins[plugin] && OpenGroupPlugins[plugin].hooks && OpenGroupPlugins[plugin].hooks.actions) {
                $.each(OpenGroupPlugins[plugin].hooks.actions, function (actionCommand, action) {
                    buttons.push({
                        plugin: plugin,
                        action: action
                    });
                })
            }
        });

        this.renderer.render('menu', { buttons: buttons });
    }
};

window.errorCatcher = function (e) {
    console.log('error:', e)
}