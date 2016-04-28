var OpenGroup = function () {
    var that = this;

    this.peerConnections = {};

    this.peerConnectionAdd = function (uniquePeerId) {
        if (!this.peerConnections[uniquePeerId]) {
            return this.peerConnections[uniquePeerId] = new PeerConnection(uniquePeerId, that);
        }
        else {
            throw "Connection with " + uniquePeerId + " already exists.";
        }
    };

    this.broadcast = function (message, owner) {
        if (!message || !owner) { throw "A broadcast needs a message and an owner of the message, where an owner is a plugin or responsible piece of the software."; }

        Object.keys(this.peerConnections).forEach(function(peerConnectionId) {
            that.peerConnections[peerConnectionId].sendMessage(message, owner);
        });
    };

    this.receiveMessage = function (message, owner) {
        if (typeof this.onBroadcastReceived == 'function') {
            this.onBroadcastReceived(message, owner);
        }
    }
};

window.errorCatcher = function (e) {
    console.log('error:', e)
}