var OpenGroup = function () {
    this.peerConnections = {};

    this.peerConnectionAdd = function (uniquePeerId) {
        if (!this.peerConnections[uniquePeerId]) {
            return this.peerConnections[uniquePeerId] = new PeerConnection(uniquePeerId);
        }
        else {
            throw "Connection with " + uniquePeerId + " already exists.";
        }
    };

    this.messageBroadcast = function () {}
};

window.errorCatcher = function (e) {
    console.log('error:', e)
}