/* A class to initiate or answer a WebRTC connection.
   It may be unanswered, and may be connected.
   The unique ID is for now the mail address.
*/

var PeerConnection = function (uniquePeerId, openGroup) {
    var that = this;
    if (!uniquePeerId) { throw "A peerConnection needs an uniquePeerId"; }
    this.config = { 'iceServers': [{ 'url': 'stun:23.21.150.121' }] };
    this.constraints = {};
    this.id = uniquePeerId;
    this.openGroup = openGroup;

    this.webrtcConnection = new RTCPeerConnection(this.config, this.constraints);

    this.webrtcConnection.onicecandidate = function (e) {
        if (e.candidate == null) {
            if (typeof that.onSdpIsComplete == 'function') {
                that.onSdpIsComplete(that.webrtcConnection.localDescription)
            }
        }
    };

    this.getId = function () {
        return this.id;
    };

    this.getOffer = function (callback) {
        if (typeof callback == 'function') { this.onSdpIsComplete = callback; }

        // The WebRTC initiator creates a datachannel which gets sent over the line.
        this.dataChannel = this.webrtcConnection.createDataChannel('opengroup', {});
        this.dataChannel.onopen = this.onDataChannelOpen;
        this.dataChannel.onmessage = this.onDataChannelMessage;
        this.dataChannel.onclose = this.onDataChannelClose;
        this.dataChannel.onerror = this.onDataChannelError;

        return this.webrtcConnection.createOffer().then(function (offer) {
          return that.webrtcConnection.setLocalDescription(offer);
        }).catch(errorCatcher);
    };

    this.getAnswer = function (offer, callback) {
        if (typeof callback == 'function') { this.onSdpIsComplete = callback; }

        this.webrtcConnection.ondatachannel = function (event) {
            that.dataChannel = event.channel;
            that.dataChannel.onmessage = that.onDataChannelMessage;
            that.dataChannel.onopen = that.onDataChannelOpen;
            that.dataChannel.onclose = that.onDataChannelClose;
        };

        this.offer = new RTCSessionDescription(offer);

        this.webrtcConnection.setRemoteDescription(this.offer);
        return this.webrtcConnection.createAnswer().then(function (answer) {
            return that.webrtcConnection.setLocalDescription(answer);
        }).catch(errorCatcher)
    };

    this.acceptAnswer = function(answer, callback) {
        if (typeof callback == 'function') { this.onConnected = callback; }
        this.answer = new RTCSessionDescription(answer);
        return that.webrtcConnection.setRemoteDescription(that.answer);
    };

    this.sendMessage = function (message, owner) {
        if (!message || !owner) { throw "A message needs a message and an owner of the message, where an owner is a plugin or responsible piece of the software."; }

        this.dataChannel.send(JSON.stringify({
            message: message,
            owner: owner
        }));
    };

    this.onDataChannelOpen = function(e) {
        console.info('Datachannel connected', e);

        if (typeof that.onConnected == 'function') {
            that.onConnected();
        }
    };

    this.onDataChannelMessage = function(e) {
        var data = JSON.parse(e.data);
        if (!data.message || !data.owner) { throw "A message needs a message and an owner of the message, where an owner is a plugin or responsible piece of the software."; }
        that.openGroup.receiveMessage(data.message, data.owner);
    };

    this.onDataChannelClose = function(e) {
        console.log('data channel close', e);
    };

    this.onDataChannelError = function (err) {
        console.log(err);
    };
};