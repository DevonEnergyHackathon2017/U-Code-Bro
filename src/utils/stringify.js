if (!Object.prototype.stringify) {
  Object.prototype.stringify = function (opts) {
    const items = [];
    return JSON.stringify(this, (key, value) => {
      if (value !== Object(value)) {
        // if it's not an object, it's a value type or function - we can return the value
        return value;
      } else if (items.indexOf(value) < 0) {
        // if it's an object and we haven't already pushed, push it now
        items.push(value);
        return value;
      } else {
        return '[isDupe]';
      }
    }, opts);
  };
}