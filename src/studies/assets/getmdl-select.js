var getmdlSelect = (function () {
  var addEventListeners = function (dropdown) {
      var input = dropdown.querySelector('input');
      var list = dropdown.querySelectorAll('li');

      [].forEach.call(list, function (li) {
          li.onclick = function () {
              input.value = li.textContent;
              if ("createEvent" in document) {
                  var evt = document.createEvent("HTMLEvents");
                  evt.initEvent("change", false, true);
                  input.dispatchEvent(evt);
              } else {
                  input.fireEvent("onchange");
              }
          }
      });
  };
  
  var init = function (selector) {
      var dropdowns = document.querySelectorAll(selector);
      [].forEach.call(dropdowns, function (i) {
          addEventListeners(i);
      });
  }
  
  return {
    init: init
  }
})();

