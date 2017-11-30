const Chai = require('chai');
const Request = require('request');
Chai.should();

const Path = require('path');
const RestServer = require('../../../src/modules/rest-server');
const port = 17652;

describe('rest-server', function () {

  let restServer;
  beforeEach(() => restServer = new RestServer()
    .logIncoming()
    .parseJsonBody()
    .routes.date()
    .routes.get('/asdf', (req, res) => res.send('yay!'))
    .routes.post('/blarg', (req, res) => res.send(req.body))
    .start(port)
  );

  afterEach(() => restServer.stop());

  it('responds with the default date route using http', function () {
    return new Promise((resolve, reject) => {
      Request({ url: `http://localhost:${port}/when` }, (error, response, body) => {
        if (error)
          reject(error);

        response.should.have.property('statusCode', 200);
        body.should.exist;
        body.should.have.string(new Date().getFullYear().toString());
        resolve();
      });
    })

  });

  it('responds with a test route using http', function () {
    return new Promise((resolve, reject) => {
      Request({ url: `http://localhost:${port}/asdf` }, (error, response, body) => {
        if (error)
          reject(error);

        response.should.have.property('statusCode', 200);
        body.should.exist;
        body.should.have.string('yay!');
        resolve();
      });
    })

  });

  it('responds with a test post route using http', function () {
    return new Promise((resolve, reject) => {
      const iBody = { a: 1 };
      Request({
        url: `http://localhost:${port}/blarg`
        , method: 'post'
        , body: JSON.stringify(iBody)
        , headers: { 'Content-Type': 'application/json' }
      }, (error, response, body) => {
        if (error)
          reject(error);

        response.should.have.property('statusCode', 200);
        body.should.exist;
        body.should.equal(JSON.stringify(iBody));
        resolve();
      });
    });

  });

});
