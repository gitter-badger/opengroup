/**
 * A peerConnection is an object to construct a p2p connection.
 *
 * @param uniquePeerId A unique identifier, something like john@doe.com.
 * @param openGroup The openGroup this peerConnection belongs to.
 * @constructor
 */
var PeerConnection = function (uniquePeerId, openGroup) {
    var that = this;
    if (!uniquePeerId) { throw "A peerConnection needs an uniquePeerId"; }
    this.config = { 'iceServers': [{ 'url': 'stun:23.21.150.121' }] };
    this.constraints = {};
    this.id = uniquePeerId;
    this.openGroup = openGroup;
    this.signalingRole = false;
    this.status = 'offline';

    this.webrtcConnection = new RTCPeerConnection(this.config, this.constraints);

    /**
     * When candidates are added to the IDP.
     * Interesting is the deletion of the onceSdpIsComplete.
     * This makes the abstraction easy to use.
     * Higher up you can simply use peer.getOffer(function (offer) {})
     *
     * @param e The event
     */
    this.webrtcConnection.onicecandidate = function (e) {
        if (e.candidate == null) {
            if (typeof that.onceSdpIsComplete == 'function') {
                that.onceSdpIsComplete(that.webrtcConnection.localDescription);
                delete that.onceSdpIsComplete;
            }
        }
    };

    /**
     * @returns the ID of the peerConnection.
     */
    this.getStatus = function () {
        return this.status;
    };

    /**
     * @returns the ID of the peerConnection.
     */
    this.getId = function () {
        return this.id;
    };

    /**
     * The first step of creating a connection between peers.
     * It needs to be done at the initiator.
     * The datachannel is created here and is sent over the line.
     *
     * @param callback A function that will run after a successful offer with candidates has been made.
     * @returns IDP offer.
     */
    this.getOffer = function (callback) {
        this.signalingRole = 'initiator';
        if (typeof callback == 'function') { this.onceSdpIsComplete = callback; }

        this.dataChannel = this.webrtcConnection.createDataChannel('opengroup', {});
        this.dataChannel.onopen = this.onDataChannelOpen;
        this.dataChannel.onmessage = this.onDataChannelMessage;
        this.dataChannel.onclose = this.onDataChannelClose;
        this.dataChannel.onerror = this.onDataChannelError;

        return this.webrtcConnection.createOffer().then(function (offer) {
          return that.webrtcConnection.setLocalDescription(offer);
        }).catch(errorCatcher);
    };

    /**
     * The second step of creating a connection between peers.
     * It needs to be done at the second peer.
     * The datachannel is received here.
     *
     * @param offer The IDP offer from the getOffer function.
     * @param callback A function that will run after a successful answer with candidates has been made.
     * @returns IDP answer.
     */
    this.getAnswer = function (offer, callback) {
        this.signalingRole = 'answerer';
        if (typeof callback == 'function') { this.onceSdpIsComplete = callback; }

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

    /**
     * The third step of creating a connection between peers.
     * It needs to be done at the initiator.
     *
     * @param answer The IDP answer
     * @param callback A function that will run after the peers successfully connect.
     * @returns The promise of setRemoteDescription.
     */
    this.acceptAnswer = function(answer, callback) {
        if (typeof callback == 'function') { this.onceConnected = callback; }
        this.answer = new RTCSessionDescription(answer);
        return that.webrtcConnection.setRemoteDescription(that.answer);
    };

    /**
     * Send a message to the peer.
     * This will mostly be called from the group to broadcast something to all peers.
     *
     * @param message The things you want to send over.
     * @param owner The plugin or components that needs to react to this message in the receiving peer.
     */
    this.sendMessage = function (message, owner) {
        if (!message || !owner) { throw "A message needs a message and an owner of the message, where an owner is a plugin or responsible piece of the software."; }

        if (typeof this.dataChannel != 'undefined' && this.dataChannel.readyState == 'open') {
            this.dataChannel.send(JSON.stringify({
                message: message,
                owner: owner
            }));
        }
        else {
            // TODO try to re initiate.
            throw "Datachannel was not correctly set up";
        }
    };

    /**
     * The event callback when the webRTC datachannel is opened.
     * This function starts the signaling of all the other connected peers to the newly connected peer.
     *
     * @param e Event with the webRTC data.
     */
    this.onDataChannelOpen = function(e) {
        console.info('Datachannel connected', e);

        if (typeof that.onceConnected == 'function') {
            that.onceConnected();
            delete that.onceConnected;
        }

        if (that.signalingRole == 'initiator') {
            $.each(that.openGroup.peerConnectionGetAll(), function (delta, peerConnection) {
                if (peerConnection.getId() != that.getId()) {

                    // TODO the datachannel is not always ready, abstract the waiting process away.
                    peerConnection.sendMessage({
                        command: 'createOffer',
                        parameters: [that.getId()]
                    }, 'opengroup.signaling');
                }
            });
        }

        that.status = 'online';
    };

    /**
     * The event callback when the webRTC datachannel receives a message.
     * @param e Event with the webRTC data.
     */
    this.onDataChannelMessage = function(e) {
        var data = JSON.parse(e.data);
        if (!data.message || !data.owner) { throw "A message needs a message and an owner of the message, where an owner is a plugin or responsible piece of the software."; }

        that.openGroup.receiveMessage(data.message, data.owner, that.getId());
    };

    this.onDataChannelClose = function(e) {
        that.status = 'offline';
        console.log('data channel close', e);
    };

    this.onDataChannelError = function (err) {
        console.log(err);
    };
};