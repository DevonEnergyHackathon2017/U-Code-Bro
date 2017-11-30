const FS = require('fs');
const Express = require('express');
const Http = require('http');
const Https = require('https');
const BodyParser = require('body-parser');
const Logger = require('./logger');
const defaultWeakPort = 80;
const defaultStrongPort = 443;

module.exports = class RestServer {
  constructor(logger) {
    this.log = logger || Logger.makeHistoric();
    this.app = Express();
    this.servers = [];

    this.makeRoutes();
  }

  makeRoutes() {
    this.routes = {};
    ['all', 'get', 'post', 'delete', 'use'].forEach(method => {
      this.routes[method] = (path, callback) => {
        this.app[method](path, callback);
        return this;
      };
    });

    this.routes.static = (route, path) => {
      this.app.use(route || '/', Express.static(path || 'pub'));
      return this;
    };

    this.routes.date = () => {
      this.app.get('/when', (req, res) => res.send(new Date().toISOString()));
      return this;
    };
  }

  logIncoming() {
    this.app.use((req, res, next) => {
      this.log.debug('Request Received: {{req}}', { req: req.path });
      next();
    });

    return this;
  }

  logRequest() {
    this.app.use((req, res, next) => {
      this.log.debug('Request Received: {{req}}', { req: req });
      next();
    });

    return this;
  }

  logResponse() {
    this.app.use((req, res, next) => {
      this.log.debug('Response sent: {{res}}', { res: res });
      next();
    });

    return this;
  }


  validate(isValid, code, message) {
    this.app.use((req, res, next) => isValid(req) ? next() : res.status(code || 403).send(message || 'Unauthorized'));
    return this;
  }

  parseJsonBody() {
    this.app.use(BodyParser.json());
    return this;
  }

  start(port, keyFilePath, certFilePath) {
    port = port || process.env.PORT || process.env.Port || process.env.port;

    if (keyFilePath && certFilePath) {
      port = port || defaultStrongPort;
      this.creds = { key: FS.readFileSync(keyFilePath, 'utf8'), cert: FS.readFileSync(certFilePath, 'utf8') };
      this.app = Https.createServer(this.creds, this.app);
    } else {
      port = port || defaultWeakPort;
    }

    this.port = port;

    this.servers.push(this.app.listen(port));
    this.log.info('server listening on port {{port}}', { port: port });

    return this;
  }

  redirect(port) {
    this.weakApp = Http.createServer(Express());
    this.weakApp.all('*', (req, res) => res.redirect(`https://${req.hostname}${req.url}`));
    this.weakPort = port || defaultWeakPort;
    this.servers.push(this.weakApp.listen(this.weakPort));
    this.log.info('weak server listening on port {{port}} and redirecting to {{redirect}}'
      , { port: this.weakPort, redirect: this.port });
    return this;
  }

  stop() {
    this.servers.forEach(server => server.close());
    this.servers = [];
    return this;
  }

};
