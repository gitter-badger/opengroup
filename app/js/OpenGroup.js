var OpenGroupPlugins = {
    signaling: {
        createOffer: function (uniquePeerId, openGroup, localUniquePeerId) {
            if (!openGroup.peerConnections[uniquePeerId]) {
                var peerConnection = openGroup.peerConnectionAdd(uniquePeerId);
                peerConnection.getOffer(function (offer) {
                    openGroup.peerConnections[localUniquePeerId].sendMessage({
                        command: 'createAnswerMiddleman',
                        parameters: [offer, uniquePeerId]
                    }, 'signaling');
                })
            }
        },
        createAnswerMiddleman: function (offer, uniquePeerId, openGroup, localUniquePeerId) {
            openGroup.peerConnections[uniquePeerId].sendMessage({
                command: 'createAnswer',
                parameters: [offer, localUniquePeerId]
            }, 'signaling');
        },
        createAnswer: function (offer, uniquePeerId, openGroup, localUniquePeerId) {
            var peerConnection = openGroup.peerConnectionAdd(uniquePeerId);
            peerConnection.getAnswer(offer, function (answer) {
                openGroup.peerConnections[localUniquePeerId].sendMessage({
                    command: 'acceptAnswerMiddleman',
                    parameters: [answer, uniquePeerId]
                }, 'signaling');
            })
        },
        acceptAnswerMiddleman: function (answer, uniquePeerId, openGroup, localUniquePeerId) {
            openGroup.peerConnections[uniquePeerId].sendMessage({
                command: 'acceptAnswer',
                parameters: [answer, localUniquePeerId]
            }, 'signaling');
        },
        acceptAnswer: function (answer, uniquePeerId, openGroup, localUniquePeerId) {
            var peerConnection = openGroup.peerConnections[uniquePeerId];
            peerConnection.acceptAnswer(answer)
        }
    }
};

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

    this.receiveMessage = function (message, owner, localUniquePeerId) {
        if (typeof this.onMessageReceived == 'function') {
            this.onMessageReceived(message, owner, localUniquePeerId);
        }

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
    }
};

window.errorCatcher = function (e) {
    console.log('error:', e)
}