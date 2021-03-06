// Refactor with error handling.
OpenGroupPlugins["opengroup.signaling"] = {
    createOffer: function (uniquePeerId, openGroup, localUniquePeerId) {
        if (!openGroup.peerConnectionGet(uniquePeerId)) {
            var peerConnection = openGroup.peerConnectionAdd(uniquePeerId);
            peerConnection.getOffer(function (offer) {
                openGroup.peerConnectionGet(localUniquePeerId).sendMessage({
                    command: 'createAnswerMiddleman',
                    parameters: [offer, uniquePeerId]
                }, 'opengroup.signaling');
            })
        }
    },
    createAnswerMiddleman: function (offer, uniquePeerId, openGroup, localUniquePeerId) {
        if (openGroup.peerConnectionGet(uniquePeerId)) {
            openGroup.peerConnectionGet(uniquePeerId).sendMessage({
                command: 'createAnswer',
                parameters: [offer, localUniquePeerId]
            }, 'opengroup.signaling');
        }
    },
    createAnswer: function (offer, uniquePeerId, openGroup, localUniquePeerId) {
        var peerConnection = openGroup.peerConnectionAdd(uniquePeerId);
        peerConnection.getAnswer(offer, function (answer) {
            openGroup.peerConnectionGet(localUniquePeerId).sendMessage({
                command: 'acceptAnswerMiddleman',
                parameters: [answer, uniquePeerId]
            }, 'opengroup.signaling');
        })
    },
    acceptAnswerMiddleman: function (answer, uniquePeerId, openGroup, localUniquePeerId) {
        if (openGroup.peerConnectionGet(uniquePeerId)) {
            openGroup.peerConnectionGet(uniquePeerId).sendMessage({
                command: 'acceptAnswer',
                parameters: [answer, localUniquePeerId]
            }, 'opengroup.signaling');
        }
    },
    acceptAnswer: function (answer, uniquePeerId, openGroup, localUniquePeerId) {
        var peerConnection = openGroup.peerConnectionGet(uniquePeerId);
        peerConnection.acceptAnswer(answer)
    },
    hooks: {
        init: function () {
            if (!sessionStorage.getItem('opengroupNickname')) {
                renderDataNickname = {
                    functions: {
                        save: function () {
                            sessionStorage.setItem('opengroupNickname', renderDataNickname.values.nickname);
                            $('#signalingDialogNickname').modal('hide');
                            return false;
                        }
                    },
                    values: {}
                };

                opengroup.render('signaling.dialog.nickname', renderDataNickname, 'append', 'body', function () {
                    $('#signalingDialogNickname').modal('show');
                });
            }
        },
        actions: {
            initiate: {
                label: 'Invite friend',
                buttonAttributes: {
                    'data-toggle': 'modal',
                    'data-target': '#signalingDialogInitiator'
                },
                init: function () {
                    var peerConnection;

                    renderDataInitiator = {
                        functions: {
                            connect: function () {
                                var ourAnswer = JSON.parse(atob(renderDataInitiator.values.answer));
                                var newUniqueId = ourAnswer.name;

                                peerConnection = opengroup.peerConnectionGet(renderDataInitiator.values.uniqueId);

                                peerConnection.onceConnected = function () {
                                    $('#signalingDialogInitiator').modal('hide');
                                };

                                peerConnection.id = newUniqueId;
                                peerConnection.acceptAnswer(ourAnswer.answer);
                                return false;
                            },
                            copyOffer: function () {
                                setTimeout(function() {
                                    renderDataInitiator.values.copiedOffer = true;
                                }, 300);
                            }
                        },
                        values: {}
                    };

                    opengroup.render('signaling.dialog.initiator', renderDataInitiator, 'append', 'body', function () {
                        new Clipboard('[data-clipboard-target]');
                    });
                },
                callback: function () {
                    renderDataInitiator.values.uniqueId = '';
                    renderDataInitiator.values.offer = '';
                    renderDataInitiator.values.answer = '';
                    renderDataInitiator.values.copiedOffer = false;

                    renderDataInitiator.values.uniqueId = Math.random().toString(36).slice(2);
                    if (!opengroup.peerConnectionGet(renderDataInitiator.values.uniqueId)) {
                        var peerConnection = opengroup.peerConnectionAdd(renderDataInitiator.values.uniqueId);
                        peerConnection.getOffer(function (offer) {
                            var ourOffer = {
                                name: sessionStorage.getItem('opengroupNickname'),
                                offer: offer.toJSON()
                            };

                            renderDataInitiator.values.offer = btoa(JSON.stringify(ourOffer));
                        })
                    }
                }
            },
            answer: {
                label: 'Answer invitation',
                buttonAttributes: {
                    'data-toggle': 'modal',
                    'data-target': '#signalingDialogAnswerer'
                },
                init: function () {
                    renderDataAnswerer = {
                        functions: {
                            submit: function () {
                                var ourOffer = JSON.parse(atob(renderDataAnswerer.values.offer));
                                var offer = ourOffer.offer;
                                var uniqueId = ourOffer.name;

                                if (!opengroup.peerConnectionGet(uniqueId)) {
                                    var peerConnection = opengroup.peerConnectionAdd(uniqueId);

                                    peerConnection.onceConnected = function () {
                                        $('#signalingDialogAnswerer').modal('hide');
                                    };

                                    peerConnection.getAnswer(offer, function (answer) {
                                        var ourAnswer = {
                                            name: sessionStorage.getItem('opengroupNickname'),
                                            answer: answer.toJSON()
                                        };

                                        renderDataAnswerer.values.answer = btoa(JSON.stringify(ourAnswer));
                                    })
                                }
                                return false;
                            }
                        },
                        values: {}
                    };

                    opengroup.render('signaling.dialog.answerer', renderDataAnswerer);
                },
                callback: function () {
                    renderDataInitiator.values.email = '';
                    renderDataInitiator.values.offer = '';
                    renderDataInitiator.values.answer = '';
                }
            }
        }
    }
};