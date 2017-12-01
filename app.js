'use strict';

try {
  require('./src/utils/stringify');
  require('./src/utils/promisify');

  const RestServer = require('./src/modules/rest-server');
  const Logger = require('./src/modules/logger');
  const Mocker = require('./src/data/mocker');
  const logger = new Logger();

  const mocker = new Mocker(logger);

  const server = new RestServer(logger)
    .logIncoming()
    .logRequest()
    .parseJsonBody()
    .routes.date()
    .addRoutes(mocker.addRoutes)
    .routes.static()
    .logResponse()
    .start();

} catch (ex) {
  console.log(ex);
}
