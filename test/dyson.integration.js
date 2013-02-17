var request = require('supertest'),
    dyson = require('../lib/dyson'),
    defaults = require('../lib/defaults'),
    _ = require('lodash');

describe('dyson', function() {

    describe('.registerServices [integration]', function() {

        var app,
            configs;

        before(function() {

            app = dyson.initExpress();

            // The `dyson.generators.id` method returns a new, unique id when it is called starting at 0 (it's actually _.uniqueId).,
            // this comes in handy when testing whether a response was cached or not.

            configs = {
                'get': [{
                    path: '/cache',
                    template: {
                        id: _.uniqueId
                    }
                }, {
                    path: '/nocache',
                    cache: false,
                    template: {
                        id: _.uniqueId
                    }
                }, {
                    path: '/collection',
                    collection: true,
                    size: 2,
                    template: {
                        id: _.uniqueId
                    }
                }, {
                    path: '/combined/:id',
                    template: {}
                }]
            };

            defaults.assign(configs.get, 'get');

            dyson.registerServices(app, configs);

        });

        it('should respond with a cached response', function(done) {

            request(app).get('/cache').end(function(err, res) {
                request(app).get('/cache').expect(200, res.body, done);
            });

        });

        it('should respond with a non-cached response', function(done) {

            var response;

            request(app).get('/nocache').end(function(err, res) {

                response = res.body;

                request(app).get('/nocache').expect(200).end(function(err, res) {
                    res.body.should.not.eql(response);
                    done();
                });
            });
        });

        it('should respond with a collection', function(done) {

            request(app).get('/collection').expect(200).end(function(err, res) {
                res.body.should.be.an.instanceOf(Array).and.have.length(2);
                done();
            });

        });

        it('should respond with a collection (combined request)', function(done) {

            request(app).get('/combined/1,2,3').expect(200).end(function(err, res) {
                res.body.should.be.an.instanceOf(Array).and.have.length(3);
                done();
            });

        });
    })
});