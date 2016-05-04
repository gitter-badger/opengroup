OpenGroupPlugins["opengroup.signaling"] = {
    createOffer: function (uniquePeerId, openGroup, localUniquePeerId) {
        if (!openGroup.peerConnections[uniquePeerId]) {
            var peerConnection = openGroup.peerConnectionAdd(uniquePeerId);
            peerConnection.getOffer(function (offer) {
                openGroup.peerConnections[localUniquePeerId].sendMessage({
                    command: 'createAnswerMiddleman',
                    parameters: [offer, uniquePeerId]
                }, 'opengroup.signaling');
            })
        }
    },
    createAnswerMiddleman: function (offer, uniquePeerId, openGroup, localUniquePeerId) {
        openGroup.peerConnections[uniquePeerId].sendMessage({
            command: 'createAnswer',
            parameters: [offer, localUniquePeerId]
        }, 'opengroup.signaling');
    },
    createAnswer: function (offer, uniquePeerId, openGroup, localUniquePeerId) {
        var peerConnection = openGroup.peerConnectionAdd(uniquePeerId);
        peerConnection.getAnswer(offer, function (answer) {
            openGroup.peerConnections[localUniquePeerId].sendMessage({
                command: 'acceptAnswerMiddleman',
                parameters: [answer, uniquePeerId]
            }, 'opengroup.signaling');
        })
    },
    acceptAnswerMiddleman: function (answer, uniquePeerId, openGroup, localUniquePeerId) {
        openGroup.peerConnections[uniquePeerId].sendMessage({
            command: 'acceptAnswer',
            parameters: [answer, localUniquePeerId]
        }, 'opengroup.signaling');
    },
    acceptAnswer: function (answer, uniquePeerId, openGroup, localUniquePeerId) {
        var peerConnection = openGroup.peerConnections[uniquePeerId];
        peerConnection.acceptAnswer(answer)
    },
    hooks: {
        actions: {
            initiate: {
                label: 'Invite friend',
                callback: function () {
                    alert('invite');
                }
            },
            answer: {
                label: 'Answer invitation',
                callback: function () {
                    alert('answer');
                }
            }
        }
    }
};