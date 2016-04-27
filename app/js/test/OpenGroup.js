describe('openGroup', function () {
    it('should be an openGroup', function () {
        var myOpenGroup = new OpenGroup();
        expect(myOpenGroup).to.be.an('object');
        expect(myOpenGroup.peerConnectionAdd).to.be.an('function');
    });
});
