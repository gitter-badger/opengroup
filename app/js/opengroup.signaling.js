OpenGroupPlugins.signaling = {
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
};