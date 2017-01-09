var consent = (function () {

  var createMediumEditor = function (contentId, editorId) {
    console.log();
    var markDownEl = document.getElementById(contentId);
    new MediumEditor(document.getElementById(editorId), {
      toolbar: {
        buttons: ['bold', 'italic', 'underline', 'h2', 'h3', "unorderedlist"]
      },
      extensions: {
        markdown: new MeMarkdown(function (md) {
          markDownEl.textContent = md;
        })
      }
    });
  }

  var addConsentStep = function (type) {
    fetch('/studies/consent/step/create/' + type).then(
      function(response) {
        if (response.status >= 400) {
          throw response.statusText;
        }
        return response.json();
      }
    ).then(
      function(json) {
        currentStudy.consent_document.sections.push(json);
        fetch('/studies/consent/steps/template/' + type + '?id=' + json.id).then(
          function(response) {
            if (response.status >= 400) {
              throw response.statusText;
            }
            return response.text();
          }).then(
            function(text) {
              var content = document.getElementById("consent-sections");
              var parser = new DOMParser();
              var fetched = parser.parseFromString(text, "text/html");
              if (fetched.querySelector("body")) {
                fetched = fetched.querySelector("body");
              }
              
              fetched.querySelector('.title').textContent = json.title;
              fetched.querySelector('.summary').textContent = json.summary;
              fetched.querySelector('textarea').textContent = json.content;
              
              while (fetched.childNodes.length > 0) {
                content.appendChild(fetched.childNodes[0]);
              }
          }
        );
      }
    ).catch(
      function(err) {  
        console.log('Fetch Error :-S', err);
      }
    );
  }

  return {
    addConsentStep: addConsentStep
    //createMediumEditor: createMediumEditor
  }
})();

