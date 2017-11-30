'use strict';

try {
  require('./src/utils/stringify');
  require('./src/utils/promisify');

  const RestServer = require('./src/modules/rest-server');
  const Logger = require('./src/modules/logger');
  const logger = new Logger();

  const server = new RestServer(logger)
    .logIncoming()
    .logRequest()
    .parseJsonBody()
    .routes.date()
    .routes.static()
    .logResponse()
    .start(10000);

} catch (ex) {
  console.log(ex);
}
