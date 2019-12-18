module.exports = function() {

    this.add('say:hello', function(msg, reply) {

        reply({ hello: msg.foo+'-world' });
    });
};
  