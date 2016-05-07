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
                    var peerConnection;

                    var renderData = {
                        functions: {
                            submit: function () {
                                if (!opengroup.peerConnections[renderData.values.email]) {
                                    peerConnection = opengroup.peerConnectionAdd(renderData.values.email);
                                    peerConnection.getOffer(function (offer) {
                                        renderData.values.offer = btoa(JSON.stringify(offer.toJSON()));
                                    })
                                }
                            },
                            connect: function () {
                                var answer = JSON.parse(atob(renderData.values.answer));
                                peerConnection.acceptAnswer(answer)
                            }
                        },
                        values: {

                        }
                    };

                    opengroup.render('signaling.dialog.initiator', renderData);
                }
            },
            answer: {
                label: 'Answer invitation',
                callback: function () {
                    var renderData = {
                        functions: {
                            submit: function () {
                                if (!opengroup.peerConnections[renderData.values.email]) {
                                    var peerConnection = opengroup.peerConnectionAdd(renderData.values.email);
                                    var offer = JSON.parse(atob(renderData.values.offer));
                                    peerConnection.getAnswer(offer, function (answer) {
                                        renderData.values.answer = btoa(JSON.stringify(answer.toJSON()));
                                    })
                                }
                            }
                        },
                        values: {

                        }
                    };

                    opengroup.render('signaling.dialog.answerer', renderData);
                }
            }
        }
    }
};