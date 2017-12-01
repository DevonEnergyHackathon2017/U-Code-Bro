module.exports = class DataStore {
  constructor(logger, mocker, rules, stageConfig) {
    this.log = logger;
    this.mock = mocker;
    this.rules = rules;
    this.stageConfig = stageConfig;

    this.start = this.start.bind(this);
    this.poll = this.poll.bind(this);
  }

  start(interval) {
    this.pollId = setInterval(this.poll, interval);
  }

  poll() {
    if (this.mock.data.timeseries) {
      const data = this.mock.data.timeseries.slice();
      this.rules.received(this.stageConfig, data);
    }
  }

};
