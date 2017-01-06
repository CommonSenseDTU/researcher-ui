var header = (function () {

  var back = function () {
    if (document.referrer.indexOf('/join')) {
      window.location.assign('/');
    } else {
      window.location.assign(document.referrer);
    }
  }
  
  return {
    back: back
  }
})();

