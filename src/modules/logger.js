'use strict';

const levels = ['debug', 'info', 'warn', 'error'];

module.exports = class Logger {
  constructor(args) {
    args = args || {};
    this._output = args.output || Logger.toConsole;
    Logger.prototype.count = Logger.prototype.count || 0;
    this._name = args.name || 'Logger-' + Logger.prototype.count++;

    let level = args.level;
    level = (level || levels[0]).toString().toLowerCase();
    if (levels.filter(v => v === level).length === 0)
      level = levels[0];
    this._level = level;

    levels.forEach(v => {
      this[v] = (message, args) => {
        this.log(v, message, args);
      }
    });
  }

  log(level, message, args) {
    if (levels.indexOf(this._level) <= levels.indexOf(level)) {
      this._output.call(this, level, message, args);
    }
  }

  static toConsole(level, message, args) {
    console.log(Logger.make.call(this, level, message, args));
  }

  static format(level, message) {
    let name = '';
    if (this && this._name)
      name = `[${this._name}] `;
    return `${name}[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  }

  static replace(message, args) {
    let result = message;
    Object.keys(args || {}).forEach(key => {
      let arg = args[key];
      if(arg === undefined) {
        arg = '[[undefined]]'
      } else {
        if (typeof(arg) === 'function')
          arg = arg();
        if (typeof(arg) === 'object')
          arg = arg.stringify();
        arg = arg.toString();
      }
      result = result.replace(new RegExp(`\{\{${key}\}\}`, 'g'), arg);
    });
    return result;
  }

  static make(level, message, args) {
    let result = message;
    result = Logger.replace.call(this, result, args);
    result = Logger.format.call(this, level, result);
    return result;
  }

  static makeMulti(loggers, args) {
    args = args || {};
    Logger.prototype.multiCount = Logger.prototype.multiCount || 0;
    args.name = args.name || 'Multi-' + Logger.prototype.multiCount++;
    args.output = (level, message, args) => loggers.forEach(logger => logger.log(level, message, args));
    return new Logger(args);
  }

  static makeConsole(args) {
    args = args || {};
    Logger.prototype.consoleCount = Logger.prototype.consoleCount || 0;
    args.name = args.name || 'Console-' + Logger.prototype.consoleCount++;
    args.output = Logger.toConsole;
    return new Logger(args);
  }

  static makeHistoric(args) {
    args = args || {};
    Logger.prototype.historicCount = Logger.prototype.historicCount || 0;
    args.name = args.name || 'Historic-' + Logger.prototype.historicCount;
    const history = [];
    args.output = (level, message, args) => history.push(Logger.make(level, message, args));
    const result = new Logger(args);
    result.history = history;
    result.getHistory = () => result.history;
    return result;
  }

};
