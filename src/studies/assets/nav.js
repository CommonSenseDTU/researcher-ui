var nav = (function () {

  var setContent = function (url) {
    fetch(url).then(
        function(response) {
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
            
            while (fetched.childNodes.length > 0) {
                content.appendChild(fetched.childNodes[0]);
            }
            
            // Re-init mdlSelect component to ensure functional dropdown
            getmdlSelect.init('.getmdl-select');
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

