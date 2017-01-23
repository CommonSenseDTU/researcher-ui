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

  /**
   * Request a consent section from backend, add it to currentStudy and show it.
   *
   * @param {string} type - the consent section type
   */
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

  /**
   * Set title in consent step view.
   *
   * @param {ConsentSection} step - the object containing consent section properties
   * @param {HTMLElement} fetched - the fetched html template to fill with section data
   */
  setConsentStepTitle(step: ConsentSection, fetched: HTMLElement) {
    var title: ?HTMLElement = fetched.querySelector('.title');
    if (!title) return;
    title.textContent = step.title;
  }

  /**
   * Set summary in consent step view.
   *
   * @param {ConsentSection} step - the object containing consent section properties
   * @param {HTMLElement} fetched - the fetched html template to fill with section data
   */
  setConsentStepSummary(step: ConsentSection, fetched: HTMLElement) {
    if (!step.summary) return;
    var currentSummary: string = step.summary;
    var summary: ?HTMLElement = fetched.querySelector('.summary');
    if (summary) {
      summary.textContent = currentSummary;
    }
  }

  /**
   * Set content in consent step view.
   *
   * @param {ConsentSection} step - the object containing consent section properties
   * @param {HTMLElement} fetched - the fetched html template to fill with section data
   */
  setConsentStepContent(step: ConsentSection, fetched: HTMLElement) {
    if (!step.content) return;
    var currentContent: string = step.content;
    var textarea: ?HTMLElement = fetched.querySelector('textarea');
    if (textarea) {
      textarea.textContent = currentContent;
    }
  }

  /**
   * Set content in review consent step view.
   *
   * @param {ConsentSection} step - the object containing consent section properties
   * @param {HTMLElement} fetched - the fetched html template to fill with section data
   */
  setConsentReviewStepContent(step: ConsentSection, fetched: HTMLElement) {
    // summary should be set as content for review type dialogs
    var textarea: ?HTMLElement = fetched.querySelector("textarea[content-attribute=summary]");
    if (textarea && step.summary) {
      textarea.textContent = step.summary;
    }
    textarea = fetched.querySelector("textarea[content-attribute=popup]");
    if (textarea && step.popup) {
      textarea.textContent = step.popup;
    }
  }

  /**
   * Set next button title in consent step view.
   *
   * @param {ConsentSection} step - the object containing consent section properties
   * @param {HTMLElement} fetched - the fetched html template to fill with section data
   */
  setConsentStepNextButton(fetched: HTMLElement) {
    var next: ?HTMLElement = fetched.querySelector('.next');
    if (!next) return;
    if (this.completedStepCount == 1) {
      next.textContent = "Get Started";
    } else if (this.completedStepCount == currentStudy.consent_document.sections.length) {
      next.textContent = "Done";
    } else {
      next.textContent = "Next";
    }
  }

  /**
   * Set sharing options in consent step view.
   *
   * @param {ConsentSection} step - the object containing consent section properties
   * @param {HTMLElement} fetched - the fetched html template to fill with section data
   */
  setConsentStepSharingOptions(step: ConsentSection, fetched: HTMLElement) {
    if (!step.options) return;
    var shareAllContent: ?string = step.options[0];
    var shareThisContent: ?string = step.options[1];
    var doNotShareContent: ?string = step.options[2];

    if (!shareAllContent) return;
    var shareAll: ?HTMLElement = fetched.querySelector(".share-all");
    if (!shareAll) return;
    shareAll.textContent = shareAllContent;

    if (!shareThisContent) return;
    var shareThis: ?HTMLElement = fetched.querySelector(".share-this");
    if (!shareThis) return;
    shareThis.textContent = shareThisContent;

    if (!doNotShareContent) return;
    var doNotShare: ?HTMLElement = fetched.querySelector(".do-not-share");
    if (!doNotShare) return;
    doNotShare.textContent = doNotShareContent;
  }

  /**
   * Fetch consent step template, set appropriate data from given consent section.
   * Iterate through following consent sections if the recursive flag is set.
   *
   * @param {ConsentSection} step - the object containing consent section properties
   * @param {boolean} recursive - call showCurrentConsentSteps when done if true
   */
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

          self.setConsentStepTitle(step, fetched);

          self.setConsentStepSummary(step, fetched);

          if (step.type == "review") {
            self.setConsentReviewStepContent(step, fetched);
          } else {
            self.setConsentStepContent(step, fetched);
          }

          if (step.type == "sharingoptions") {
            self.setConsentStepSharingOptions(step, fetched);
          }

          self.setConsentStepNextButton(fetched);

          while (fetched.childNodes.length > 0) {
            content.appendChild(fetched.childNodes[0]);
          }

          if (recursive) {
            self.showCurrentConsentSteps(false);
          }
        }
    );
  }

  /**
   * Show all consent sections.
   * If first is true then remove all currently shown consent sections and
   * start iteration through consent sections, otherwise show the next section
   * based on the completedStepCount.
   *
   * @param {boolean} first - restart if true, continue if false
   */
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


  /**
   * Show all consent sections.
   */
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
  readReviewConsentStepSummary(summary: HTMLTextAreaElement) {
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

  readShareOption(option: HTMLElement, index: number) {
    var stepId: string = option.attributes.getNamedItem("step-id").value;
    for (var section: ConsentSection of currentStudy.consent_document.sections) {
      if (section.id == stepId) {
        var options: ?string[] = section.options;
        if (!options) break;
        options[index] = option.textContent;
        break;
      }
    }

    this.edit.updateCurrentStudy();
  }

  /**
   * Delete a consent step.
   *
   * @param {string} stepId - id of the consent section to delete
   */
  deleteStep(stepId: string) {
    var dialog: ?any = document.getElementById('step-delete-' + stepId);
    if (dialog) {
      dialog.close();
    }
    var sections: ConsentSection[] = currentStudy.consent_document.sections;
    for (var index: number = 0 ; index < currentStudy.consent_document.sections.length ; index++ ) {
      if (sections[index].id == stepId) {
        sections.splice(index, 1);
        break;
      }
    }
    this.edit.updateCurrentStudy();
    this.showCurrentConsentSteps(true);
  }

}

window.consent = new Consent();
