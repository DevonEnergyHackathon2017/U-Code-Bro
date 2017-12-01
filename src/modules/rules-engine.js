const moment = require('moment');

module.exports = class RulesEngine {
  constructor(logger, actions, wellConfigs) {
    this.log = logger;
    this.actions = actions;
    this.wellConfigs = wellConfigs;
  }

  received(stageConfigs, data) {
    this.log.debug('evaluating events');
    if (this.wellConfigs && this.wellConfigs.events) {
      this.wellConfigs.events
        .filter(v => !v.triggered)
        .forEach(v => {
          if (this.testTrigger(v.trigger, stageConfigs, data)) {
            v.triggered = true;
            this.actions.takeActions(v.actions);
          }
        });
    }

    if (this.stageConfigs && this.stageConfigs.events) {
      this.stageConfigs.events
        .filter(v => !v.triggered)
        .forEach(v => {
          if (this.testTrigger(v.trigger, stageConfigs, data)) {
            this.actions.takeActions(v.actions);
            v.triggered = true;
          }
        });
    }
  }

  testTrigger(trigger, stageConfigs, data) {
    switch (trigger.type) {
      case 'rpn':
        return this.rpnTest(trigger, stageConfigs, data);

      case 'pressureSlope':
        return this.pressureSlopeTest(trigger, stageConfigs, data);

      case 'pressureSlopeEmergency':
        return this.pressureSlopeEmergencyTest(trigger, stageConfigs, data)

      case 'overpriced':
        return this.overpricedTest(trigger, stageConfigs, data);
    }
  }

  rpnTest(trigger, stageConfigs, data) {
    // whatever completion engineer wants
    return false;
  }

  pressureSlopeTest(trigger, stageConfigs, data) {
    // triggers if projected screenout occurs before projected completion but within enough time to flush
    //  plus a modifier for manual intervention
    const slope = this.treatingPressureSlop(data);

    // shortcut for PoC
    return slope > .2;
  }

  pressureSlopeEmergencyTest(trigger, stageConfigs, data) {
    // triggers if projected screenout occurs before projected completion or within a threshold from now
    const slope = this.treatingPressureSlop(data);

    // shortcut for PoC
    return slope > .5;
  }

  overpricedTest(trigger, stageConfigs, data) {
    // triggers if the projected completion duration times cost is greater than projected gain from stage
    const slope = this.treatingPressureSlop(data);

    // shortcut for PoC
    return slope < .01
  }

  treatingPressureSlop(data) {
    return this.calcSlope(data, v => v.when, v => v.tp,
      (a, b) => moment(a.when).isBefore(b.when) ? -1 : moment(a.when).isAfter(b.when) ? 1 : 0
    );
  }

  calcSlope(data, x, y, comparer) {
    const work = data.slice();
    work.sort(comparer);
    const slopes = [];
    while (work.length > 1 && slopes.length < 10) {
      const one = work.pop();
      const two = work.pop();
      const slope = (Number(y(one)) - Number(y(two))) / (moment(x(one)).valueOf() - moment(x(two)).valueOf());
      slopes.push(slope);
    }
    slopes.reverse();
    let total = 0;
    let totalWeight = 0;
    for (let i = 0; i < slopes.length; i++) {
      const weight = i + 1 / slopes.length;
      total += slopes[i] * weight;
      totalWeight += weight;
    }

    const result = total / totalWeight;
    this.log.debug('weighted slope: {{result}}', { result: result });
    return result;
  }

};
