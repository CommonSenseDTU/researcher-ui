// @flow
'use strict';

import { Cookies } from '../../../../lib/cookies';
import type { Survey } from '../../../../../control/studies/survey.type';
import type { Step } from '../../../../../control/studies/survey.type';

import Edit from '../../index';

declare var currentStudy: Survey;
declare var hljs: any;

/**
 * Task settings management class.
 */
class TaskSettings {

  edit: Edit;

  constructor() {
    this.edit = new Edit();
  }

  /**
   * Find the current step and call the correct function based on the step type.
   *
   * @param {string} stepId - the id of the step to use for filling form content
   */
  showStepForm(stepId: string) {
    var steps: Step[] = currentStudy.task.steps;
    for (var index: number = 0 ; index < steps.length ; index++ ) {
      if (steps[index].id == stepId) {
        var step = steps[index];
        switch (step.type) {
          case "gait":
            this.showGaitStepForm(step);
            break;
          case "custom":
            this.showCustomStepForm(step);
            break;
          default:
            console.log("Unknown step type: " + step.type);
            break;
        }
        break;
      }
    }
  }

  setValue(step: Step, key: string) {
    var element: ?HTMLInputElement = ((document.getElementById(key): any): HTMLInputElement);
    if (!element) { return }
    if (!step.settings) { return }
    var setting = step.settings[key];
    if (!setting) { return }
    element.value = setting;
  }

  showGaitStepForm(step: Step) {
    this.setValue(step, "intendedUseDescription");
    this.setValue(step, "walkDuration");
    this.setValue(step, "restDuration");
  }

  showCustomStepForm(step: Step) {
    if (!step.settings) { return }
    fetch(step.settings["client"], {
      credentials: "include"
    }).then(function(response) {
      return response.text();
    }).then(function(src) {
      var element: ?HTMLInputElement = ((document.getElementById("clientCode"): any): HTMLInputElement);
      if (!element) { return }
      element.value = src;
    }).catch(function(err) {
      console.log('Fetch error: ' + err);
    });

    fetch("/dist/public/studies/edit/tasks/settings/client-interface.js.txt", {
      credentials: "include"
    }).then(function(response) {
      return response.text();
    }).then(function(src) {
      var element: ?HTMLInputElement = ((document.getElementById("default-client-code"): any): HTMLInputElement);
      if (!element) { return }
      element.textContent = src;
      hljs.highlightBlock(element);
    }).catch(function(err) {
      console.log('Fetch error: ' + err);
    });
  }

  toggleShowCode(button: HTMLElement) {
    var element: ?HTMLInputElement = ((document.getElementById("default-client-code"): any): HTMLInputElement);
    if (!element) { return }
    if (element.classList.contains("open")) {
      element.classList.remove("open");
      button.textContent = "Show";
    } else {
      element.classList.add("open");
      button.textContent = "Hide";
    }
  }

  uploadSource(textarea: HTMLInputElement) {
    var self: TaskSettings = this;
    var stepId: ?string = textarea.getAttribute("step-id");
    if (!stepId) { return }
    var formData: FormData = new FormData();
    formData.append("clientCode", textarea.value);
    fetch('/studies/' + currentStudy.id + '/tasks/' + stepId + '/clientSource', {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(function(response) {
      return response.json();
    }).then(function(source) {
      var steps: Step[] = currentStudy.task.steps;
      for (var index: number = 0 ; index < steps.length ; index++ ) {
        if (steps[index].id == stepId) {
          var step = steps[index];
          var settings = step.settings;
          if (!settings) {
            settings = {};
            step.settings = settings;
          }
          settings["client"] = source.path;
          break;
        }
      }
      self.edit.updateCurrentStudy();
    }).catch(function(err) {
      console.log('Fetch error: ' + err);
    });
  }
}

export default TaskSettings;

window.settings = new TaskSettings();
