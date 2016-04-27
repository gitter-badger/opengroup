/* A class to initiate or answer a WebRTC connection.
   It may be unanswered, and may be connected.
   The unique ID is for now the mail address.
*/

var PeerConnection = function (uniquePeerId) {
    if (!uniquePeerId) {
        throw "A peerConnection needs an uniquePeerId";
    }

    this.config = {
        'iceServers': [{ 'url': 'stun:23.21.150.121' }]
    };

    this.constraints = {

    };

    var that = this;

    this.id = uniquePeerId;

    this.webrtcConnection = new RTCPeerConnection(this.config, this.constraints);

    this.getId = function () {
        return this.id;
    };

    this.getOffer = function () {
        this.dataChannel = this.webrtcConnection.createDataChannel('opengroup', {});

        return this.webrtcConnection.createOffer()
            .then(
                offer => that.webrtcConnection.setLocalDescription(offer))
            .then(function () {
                return that.webrtcConnection.localDescription.toJSON()
            })
    };

    this.answerOffer = function (offer) {

    }
};