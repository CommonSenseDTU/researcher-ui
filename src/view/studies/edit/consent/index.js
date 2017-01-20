// @flow
'use strict';

import type { Survey, ConsentSection } from '../../../../control/studies/survey.type';

import Edit from '../index';

declare var currentStudy: Survey;

class Consent {
  completedStepCount: number;
  edit: Edit;

  constructor() {
    this.edit = new Edit();
  }

  addConsentStep(type: string) {
    var self: Consent = this;
    fetch('/studies/consent/step/create/' + type, {
      credentials: "include"
    }).then(
      function(response) {
        if (response.status >= 400) {
          throw response.statusText;
        }
        return response.json();
      }
    ).then(
      function(json) {
        currentStudy.consent_document.sections.push(json);
        self.edit.updateCurrentStudy();
        self.showConsentStep(json, false);
      }
    ).catch(
      function(err) {
        console.log('Fetch error: ' + err);
      }
    );
  }

  showConsentStep(step: ConsentSection, recursive: boolean) {
    var self: Consent = this;
    fetch('/studies/consent/steps/template/' + step.type + '?id=' + step.id, {
      credentials: "include"
    }).then(
      function(response) {
        if (response.status >= 400) {
          console.log('got error response: ' + response.status);
          throw response.statusText;
        }
        return response.text();
      }).then(
        function(text: string) {
          var content = document.getElementById("consent-sections");
          if (!content) {
            throw "consent-sections element not found";
          }
          var parser: DOMParser = new DOMParser();
          var fetchedDocument: Document = parser.parseFromString(text, "text/html");
          var fetched: ?HTMLElement = fetchedDocument.querySelector("body");
          if (!fetched) {
            throw "Could not find body in fetched template";
          }

          var title: ?HTMLElement = fetched.querySelector('.title');
          if (!title) throw "Could not find title element";
          title.textContent = step.title;

          if (step.summary) {
            var currentSummary: string = step.summary;
            var summary: ?HTMLElement = fetched.querySelector('.summary');
            if (!summary) throw "Could not find summary element";
            summary.textContent = currentSummary;
          }

          if (step.type == "review") {
            // summary should be set as content for review type dialogs
            var textarea: ?HTMLElement = fetched.querySelector("textarea[content-attribute=summary]");
            if (textarea && step.summary) {
              textarea.textContent = step.summary;
            }
            textarea = fetched.querySelector("textarea[content-attribute=popup]");
            if (textarea && step.popup) {
              textarea.textContent = step.popup;
            }
          } else {
            if (step.content) {
              var currentContent: string = step.content;
              var textarea: ?HTMLElement = fetched.querySelector('textarea');
              if (textarea) {
                textarea.textContent = currentContent;
              }
            }
          }

          var next: ?HTMLElement = fetched.querySelector('.next');
          if (!next) throw "Could not find next element";
          if (self.completedStepCount == 1) {
            next.textContent = "Get Started";
          } else if (self.completedStepCount == currentStudy.consent_document.sections.length) {
            next.textContent = "Done";
          } else {
            next.textContent = "Next";
          }

          while (fetched.childNodes.length > 0) {
            content.appendChild(fetched.childNodes[0]);
          }

          if (recursive) {
            self.showCurrentConsentSteps(false);
          }
        }
    );
  }

  showCurrentConsentSteps(first: boolean) {
    if (first) {
      var content: ?HTMLElement = document.getElementById("consent-sections");
      if (!content) {
        throw "consent-sections element not found";
      }
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }
      this.completedStepCount = 0;
    }
    if (currentStudy.consent_document.sections.length > this.completedStepCount) {
      this.completedStepCount += 1;
      this.showConsentStep(currentStudy.consent_document.sections[this.completedStepCount - 1], true);
    }
  }

  showConsentNavigationCompletion() {
    this.showCurrentConsentSteps(true);
  }

  /**
   * Read summary from consent step and send it to backend.
   *
   * @param {HTMLElement} summary - The DOM element which holds the summary
   */
  readConsentStepSummary(summary: HTMLElement) {
    for (var section: ConsentSection of currentStudy.consent_document.sections) {
      var currentStepId: string = summary.attributes.getNamedItem("step-id").value;
      if (section.id == currentStepId) {
        section.summary = summary.textContent;
        break;
      }
    }

    this.edit.updateCurrentStudy();
  }

  /**
   * Read popup content from review consent step and send it to backend.
   *
   * @param {HTMLTextAreaElement} textarea - The DOM element which holds the content
   */
  readConsentStepPopup(popup: HTMLTextAreaElement) {
    for (var section: ConsentSection of currentStudy.consent_document.sections) {
      var currentStepId: string = popup.attributes.getNamedItem("step-id").value;
      if (section.id == currentStepId) {
        section.popup = popup.value;
        break;
      }
    }

    this.edit.updateCurrentStudy();
  }

  /**
   * Read summary content from review consent step and send it to backend.
   *
   * @param {HTMLTextAreaElement} textarea - The DOM element which holds the content
   */
  readConsentStepSummary(summary: HTMLTextAreaElement) {
    for (var section: ConsentSection of currentStudy.consent_document.sections) {
      var currentStepId: string = summary.attributes.getNamedItem("step-id").value;
      if (section.id == currentStepId) {
        section.summary = summary.value;
        break;
      }
    }

    this.edit.updateCurrentStudy();
    this.showCurrentConsentSteps(true);
  }

  /**
   * Read content from consent step and send it to backend.
   *
   * @param {HTMLTextAreaElement} textarea - The DOM element which holds the content
   */
  readConsentStepContent(textarea: HTMLTextAreaElement) {
    var stepId: string = textarea.attributes.getNamedItem("step-id").value;
    for (var section: ConsentSection of currentStudy.consent_document.sections) {
      if (section.id == stepId) {
        section.content = textarea.value;
        break;
      }
    }

    this.edit.updateCurrentStudy();
  }

}

window.consent = new Consent();
