const Twilio = require('twilio');
const moment = require('moment');

module.exports = class ActionEngine {
  constructor(logger, mocker) {
    this.log = logger;
    this.mock = mocker;
    this.twilio = Twilio(process.env.twilioId, process.env.twilioAuth);
  }

  takeActions(actions) {
    actions.forEach(v => this.takeAction(v));
  }

  takeAction(action) {
    switch (action.type) {
      case 'sms':
        return this.sms(action);

      case 'alert':
        return this.alert(action);

      case 'command':
        return this.command(action);
    }
  }

  sms(action) {
    this.log.debug('sending sms notifation: {{message}}', { message: action.message });
    // this.twilio.api.messages.create({
    //   body: action.message
    //   //, to: action.target
    //   , to: process.env.twilioTarget
    //   , from: process.env.twilioNum
    // }).catch(err => this.log.error(err));
  }

  alert(action) {
    action.timestamp = moment().toISOString();
    action.id = this.mock.nextId();
    this.mock.data.alerts.push(action);
  }


  command(action) {
    // api call to device
  }

};
