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
        edit.updateCurrentStudy();
        showConsentStep(json, false);
      }
    ).catch(
      function(err) {  
        console.log('Fetch Error :-S', err);
      }
    );
  }
  
  var showConsentStep = function (step, recursive) {
    fetch('/studies/consent/steps/template/' + step.type + '?id=' + step.id).then(
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
          
          fetched.querySelector('.title').textContent = step.title;
          fetched.querySelector('.summary').textContent = step.summary;
          fetched.querySelector('textarea').textContent = step.content;
          
          while (fetched.childNodes.length > 0) {
            content.appendChild(fetched.childNodes[0]);
          }
          
          if (recursive) {
            showCurrentConsentSteps(false);
          }
      }
    );
  }

  var completedStepCount = 0;
  var showCurrentConsentSteps = function (first) {
    if (first) {
      completedStepCount = 0;
    }
    if (currentStudy.consent_document.sections.length > completedStepCount) {
      completedStepCount += 1;
      showConsentStep(currentStudy.consent_document.sections[completedStepCount - 1], true);
    }
  }

  return {
    addConsentStep: addConsentStep,
    showCurrentConsentSteps: showCurrentConsentSteps
    //createMediumEditor: createMediumEditor
  }
})();

