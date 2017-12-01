'use strict';

try {
  require('./src/utils/stringify');
  require('./src/utils/promisify');

  const FS = require('fs');

  const RestServer = require('./src/modules/rest-server');
  const Logger = require('./src/modules/logger');
  const Mocker = require('./src/data/mocker');
  const RulesEngine = require('./src/modules/rules-engine');
  const ActionEngine = require('./src/modules/action-engine');
  const DataStore = require('./src/modules/data-store');

  const wellConfig = JSON.parse(FS.readFileSync('./src/data/well-config.json'));
  const stageConfig = JSON.parse(FS.readFileSync('./src/data/stage-config.json'));

  const logger = new Logger();
  const mocker = new Mocker(logger);
  const actionEngine = new ActionEngine(logger, mocker);
  const rulesEngine = new RulesEngine(logger, actionEngine, wellConfig);
  const dataStore = new DataStore(logger, mocker, rulesEngine, stageConfig);

  const server = new RestServer(logger)
    .logIncoming()
    .logRequest()
    .parseJsonBody()
    .routes.date()
    .addRoutes(mocker.addRoutes)
    .routes.static()
    .logResponse()
    .start();

  dataStore.start(10000);

} catch (ex) {
  console.log(ex);
}
