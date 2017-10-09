module.exports= function Observable(el) {
  const events = {};
  function isFunction(fn){
    return typeof fn === 'function';
  }
  el.on = function(name, fn) {
    if(isFunction(fn)) {
      if(!events[name]) {
        events[name] = [];
      }
      events[name].push(fn);
    } else {
      console.warn('Second argument for "on" must be a function.');
    }
  }
  el.emit = function(name) {
    const args = Array.prototype.slice.call(arguments,1);
    events[name] &&
    events[name].map((fn) => {
      fn.apply(fn, args);
    })
  }
}