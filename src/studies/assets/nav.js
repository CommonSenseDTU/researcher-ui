var nav = (function () {

  var setContent = function (url, completion) {
    fetch(url).then(
        function(response) {
          if (!Cookies.get('bearer')) {
            window.location.assign('/join?return=' + document.location.pathname);
          }
          
          if (response.status >= 400) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }
          
          response.text().then(function(text) {
            var content = document.getElementById("content");
            while (content.firstChild) {
                content.removeChild(content.firstChild);
            }
            var parser = new DOMParser();
            var fetched = parser.parseFromString(text, "text/html");
            if (fetched.querySelector("body")) {
              fetched = fetched.querySelector("body");
            }
            
            while (fetched.childNodes.length > 0) {
                content.appendChild(fetched.childNodes[0]);
            }
            
            // Re-init mdlSelect component to ensure functional dropdown
            getmdlSelect.init('.getmdl-select');
            
            // Perform completion
            completion();
          });
        }
    ).catch(function(err) {  
      console.log('Fetch Error :-S', err);
    });
  }
  
  return {
    setContent: setContent
  }
})();

