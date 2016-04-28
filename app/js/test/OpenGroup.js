var myOpenGroup = new OpenGroup();
var peerConnection = false;

describe('openGroup', function () {
    it('should be an openGroup', function () {
        expect(myOpenGroup).to.be.an('object');
        expect(myOpenGroup.peerConnectionAdd).to.be.an('function');
    });
});

describe('peerConnection', function () {
    it('should have a peerConnection after adding one', function () {
        peerConnection = myOpenGroup.peerConnectionAdd('henk@jansen.com');
        expect(peerConnection.getId()).to.be('henk@jansen.com');
        expect(peerConnection).to.be.an('object');
    });

    it('should throw an error if the peerConnection already exists', function () {
        var addExistingPeerConnection = function () {
            myOpenGroup.peerConnectionAdd('henk@jansen.com')
        };

        expect(addExistingPeerConnection).to.throwException("Connection with henk@jansen.com already exists.");
    });

    it('should return an sdp offer with candidates', function (done) {
        peerConnection.onOfferIsComplete = function (offer) {
            var offerSdp = offer.toJSON().sdp;
            expect(offerSdp).to.contain('candidate:0');
            done();
        };

        peerConnection.getOffer();
    });
});
