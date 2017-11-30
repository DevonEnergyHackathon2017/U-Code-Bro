module.exports = class ActionEngine {
  takeAction(action) {
    switch (action.type) {
      case 'notify':
        return this.notify(action.details);

      case 'command':
        return this.command(action.details);
    }
  }

  notify(details) {
    // twilio message
  }

  command(details) {
    // api call to device
  }

};
