var myOpenGroup1 = new OpenGroup();
var peerConnection1 = false;

var myOpenGroup2 = new OpenGroup();
var peerConnection2 = false;

var peerConnection1Offer = false;
var peerConnection2Answer = false;

describe('openGroup', function () {
    it('should be an openGroup', function () {
        expect(myOpenGroup1).to.be.an('object');
        expect(myOpenGroup1.peerConnectionAdd).to.be.an('function');
    });

    it('should have a peerConnection after adding one', function () {
        peerConnection1 = myOpenGroup1.peerConnectionAdd('henk@jansen.com');
        expect(peerConnection1.getId()).to.be('henk@jansen.com');
        expect(peerConnection1).to.be.an('object');
    });
});

describe('peerConnection', function () {
    it('should throw an error if the uniqueId is not given', function () {
        expect(function () {
            myOpenGroup1.peerConnectionAdd()
        }).to.throwException("A peerConnection needs an uniquePeerId");
    });

    it('should throw an error if the peerConnection already exists', function () {
        expect(function () {
            myOpenGroup1.peerConnectionAdd('henk@jansen.com')
        }).to.throwException("Connection with henk@jansen.com already exists.");
    });

    it('should return an sdp offer with candidates', function (done) {
        peerConnection1.getOffer(function (offer) {
            peerConnection1Offer = offer;
            var offerSdp = peerConnection1Offer.toJSON().sdp;
            expect(offerSdp).to.contain('candidate:');
            done();
        });
    });

    it('should create an sdp answer with candidates', function (done) {
        peerConnection2 = myOpenGroup2.peerConnectionAdd('john@exmaple.com');

        peerConnection2.getAnswer(peerConnection1Offer, function (answer) {
            peerConnection2Answer = answer;
            var answerSdp = peerConnection2Answer.toJSON().sdp;
            expect(answerSdp).to.contain('candidate:');
            done();
        });
    });

    it('should successfully connect to another peer', function (done) {
        peerConnection1.acceptAnswer(peerConnection2Answer, function () {
            done();
        });
    });
});

describe('openGroup', function () {
    it('should successfully broadcast a message to another peer', function (done) {
        myOpenGroup2.onBroadcastReceived = function (message, owner) {
            expect(message).to.be('Yo Lorem ipsum');
            expect(owner).to.be('opengroup.framework');
            done();
        };

        myOpenGroup1.broadcast('Yo Lorem ipsum', 'opengroup.framework');
    });
});