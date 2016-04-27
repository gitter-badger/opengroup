describe('peerConnection', function () {
    it('should have a peerConnection after adding one', function () {
        var myOpenGroup = new OpenGroup();
        var peerConnection = myOpenGroup.peerConnectionAdd('henk@jansen.com');
        expect(peerConnection.getId()).to.be('henk@jansen.com');
        expect(peerConnection).to.be.an('object');
        expect(peerConnection.getStatus()).to.be('constructed');
    });

    it('should throw an error if the peerConnection already exists', function () {
        var myOpenGroup = new OpenGroup();
        myOpenGroup.peerConnectionAdd('henk@jansen.com');

        var addExistingPeerConnection = function () {
            myOpenGroup.peerConnectionAdd('henk@jansen.com')
        };

        expect(addExistingPeerConnection).to.throwException("Connection with henk@jansen.com already exists.");
    });

    it('should return an offer for WebRTC', function (done) {
        var myOpenGroup1 = new OpenGroup();
        var peerConnection1 = myOpenGroup1.peerConnectionAdd('henk@jansen.com');
        expect(peerConnection1.getId()).to.be('henk@jansen.com');

        var myOpenGroup2 = new OpenGroup();
        var peerConnection2 = myOpenGroup2.peerConnectionAdd('piet@example.com');

        peerConnection1.getOffer().then(function (offer) {
            expect(peerConnection1.dataChannel).to.be.an('object');
            expect(peerConnection1.getStatus()).to.be('created-offer');
            expect(offer.type).to.be('offer');

            peerConnection2.getAnswer(offer).then(function (answer) {
                expect(peerConnection2.getStatus()).to.be('accepted-offer');
                expect(peerConnection2.answer.type).to.be('answer');

                console.log(answer)

                done();
            });
        });
    });
});
