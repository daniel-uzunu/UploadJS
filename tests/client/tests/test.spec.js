describe('test' ,function () {
    it('should pass', function () {
        [1, 2].forEach(function (item) {
            expect([1, 2, 3]).to.contain(item);
        });
    });
});
