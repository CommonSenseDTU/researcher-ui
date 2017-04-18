// @flow
'use strict';

import includes from 'array-includes';
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
    Get a step in currentStudy with a given step id.

    @param {string} stepId - the id of the step to find
    @return {?Step} the step matching the id (or nil if not found)
  */
  getStep(stepId: string): ?Step {
    var steps: Step[] = currentStudy.task.steps;
    for (var index: number = 0 ; index < steps.length ; index++ ) {
      if (steps[index].id == stepId) {
        return steps[index];
      }
    }
    return null;
  }

  /**
   * Find the current step and call the correct function based on the step type.
   *
   * @param {string} stepId - the id of the step to use for filling form content
   */
  showStepForm(stepId: string) {
    var step = this.getStep(stepId);
    if (!step) { return }
    switch (step.type) {
      case "gait":
        this.showGaitStepForm(step);
        break;
      case "custom":
        this.showCustomStepForm(step);
        break;
      case "form":
        this.showFormStepForm(step);
        break;
      default:
        console.log("Unknown step type: " + step.type);
        break;
    }
  }

  /**
    Find an input element with the given name and value and set its checked state.

    @param {string} inputName - the name of the input element
    @param {string} inputValue - the value of the input element
    @param {boolean} checked - the checked state to set on the element
  */
  setInputChecked(inputName: string, inputValue: string, checked: boolean) {
    var element: ?HTMLInputElement = ((document.querySelector("input[name='" + inputName + "'][value='" + inputValue + "']"): ?any): ?HTMLInputElement);
    if (!element) { return }
    element.checked = checked;
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

  showFormStepForm(step: Step) {
    /*
      Set private/public data sensitivity type.
      This wil eventually be used to determine if the data should be stored in
      the dataPoint database or in the private database.
    */
    if (step.private) {
      this.setInputChecked("private", "true", true);
    } else {
      this.setInputChecked("private", "false", true);
    }

    if (step.sensors) {
      for (var sensor of step.sensors) {
        this.setInputChecked("sensors", sensor, true);
      }
    }
  }

  setFormPrivate(stepId: string, isPrivate: boolean) {
    var step = this.getStep(stepId);
    if (!step) { return }
    step.private = isPrivate;
    this.edit.updateCurrentStudy();
  }

  toggleSensorEnabled(stepId: string, element: HTMLInputElement) {
    var sensor: string = element.value;
    var step = this.getStep(stepId);
    if (!step) { return }
    if (!step.sensors) { return }

    if (element.checked) {
      if (!step.sensors.includes(sensor)) {
        if (!step.sensors) { return }
        step.sensors.push(sensor);
      }
    } else {
      // Remove sensor from list of sensors
      step.sensors = step.sensors.filter(item => item !== sensor)
    }
    this.edit.updateCurrentStudy();
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
