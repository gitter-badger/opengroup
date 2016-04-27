describe('peerConnection', function () {
    it('should have a peerConnection after adding one', function () {
        var myOpenGroup = new OpenGroup();
        var peerConnection = myOpenGroup.peerConnectionAdd('henk@jansen.com');
        expect(peerConnection.getId()).to.be('henk@jansen.com');
        expect(peerConnection).to.be.an('object');
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
        var myOpenGroup = new OpenGroup();
        var peerConnection = myOpenGroup.peerConnectionAdd('henk@jansen.com');
        expect(peerConnection.getId()).to.be('henk@jansen.com');
        peerConnection.getOffer().then(function (offer) {
            expect(offer.type).to.be('offer');
            done()
        })
    });
});
