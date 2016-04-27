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

    this.constraints = {};

    this.status = 'constructed';

    var that = this;

    this.id = uniquePeerId;

    this.webrtcConnection = new RTCPeerConnection(this.config, this.constraints);

    this.webrtcConnection.onicecandidate = function (e) {
        if (e.candidate == null) {
            console.log(that.getId());
        }
    };

    this.getId = function () {
        return this.id;
    };

    this.getStatus = function () {
        return this.status;
    };

    this.getOffer = function () {
        this.status = 'creating-offer';
        this.dataChannel = this.webrtcConnection.createDataChannel('opengroup', {});

        return this.webrtcConnection.createOffer().then(
            offer => that.webrtcConnection.setLocalDescription(offer))
        .then(function () {
            that.status = 'created-offer';
            return that.webrtcConnection.localDescription.toJSON()
        })
    };

    this.getAnswer = function (offer) {
        this.status = 'recieved-offer';
        this.dataChannel = this.webrtcConnection.createDataChannel('opengroup', {});
        this.offer = new RTCSessionDescription(offer);

        this.webrtcConnection.setRemoteDescription(this.offer);
        return this.webrtcConnection.createAnswer().then(function (answer) {
            that.status = 'accepted-offer';
            that.answer = answer;
            return answer
        })
    }
};