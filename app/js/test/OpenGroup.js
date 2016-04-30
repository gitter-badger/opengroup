var myOpenGroup1 = new OpenGroup();
var peerConnection1 = false;

var myOpenGroup2 = new OpenGroup();
var peerConnection2 = false;

var peerConnection1Offer = false;
var peerConnection2Answer = false;

var myOpenGroup3 = new OpenGroup();
var peerConnection3 = false;
var peerConnection4 = false;

var myOpenGroup4 = new OpenGroup();
var peerConnection5 = false;
var peerConnection6 = false;

describe('openGroup', function () {
    it('should have an internet connection', function () {
        var online = navigator.onLine;
        expect(online).to.be(true);
    });

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
        myOpenGroup2.onMessageReceived = function (message, owner) {
            if (message == 'Yo Lorem ipsum' && owner == 'opengroup.framework') {
                done();
            }
        };

        myOpenGroup1.broadcast('Yo Lorem ipsum', 'opengroup.framework');
    });

    it('should successfully connect to a third peer', function (done) {
        peerConnection3 = myOpenGroup2.peerConnectionAdd('klaas@klaasen.nl');
        peerConnection4 = myOpenGroup3.peerConnectionAdd('henk@klaasen.nl');

        peerConnection3.getOffer(function (offer) {
            peerConnection4.getAnswer(offer, function (answer) {
                peerConnection3.acceptAnswer(answer, function () {
                    done();
                })
            })
        })
    });

    it('should automatically connect to the other peers', function (done) {
        peerConnection5 = myOpenGroup4.peerConnectionAdd('lisa.bakker.com');
        peerConnection6 = myOpenGroup1.peerConnectionAdd('john@example.com');

        peerConnection5.getOffer(function (offer) {
            peerConnection6.getAnswer(offer, function (answer) {
                peerConnection5.acceptAnswer(answer, function () {
                    done();
                })
            })
        })

        done();
    });
});