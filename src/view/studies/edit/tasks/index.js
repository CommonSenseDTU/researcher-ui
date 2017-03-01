// @flow
'use strict';

import { Cookies } from '../../../lib/cookies';
import type { Survey } from '../../../../control/studies/survey.type';
import type { Step } from '../../../../control/studies/survey.type';
import Edit from '../index';
import Navigation from '../nav';

/**
 * Ensure that global header variable is defined.
 */
import '../../header';

declare var currentStudy: Survey;
declare var dialogPolyfill: any;
declare var nav: any;

/**
 * Task management class.
 */
class Tasks {

  edit: Edit;
  nav: Navigation;

  constructor() {
    this.edit = new Edit();
    this.nav = new Navigation();
  }

  /**
   * Request a task from backend, add it to currentStudy and show it.
   *
   * @param {string} type - the consent section type
   */
  addTask(type: string) {
    var self: Tasks = this;
    fetch('/studies/tasks/step/create/' + type, {
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
        currentStudy.task.steps.push(json);
        self.edit.updateCurrentStudy(function () {
          self.nav.setContent("/studies/" + currentStudy.id + "/tasks", function () {});
        });
      }
    ).catch(
      function(err) {
        console.log('Fetch error: ' + err);
      }
    );
  }

  /**
   * Delete a task.
   *
   * @param {string} stepId - id of the task step to delete
   */
  deleteStep(stepId: string) {
    var dialog: ?any = document.getElementById('task-delete-' + stepId);
    if (dialog) {
      dialog.close();
    }
    var steps: Step[] = currentStudy.task.steps;
    for (var index: number = 0 ; index < steps.length ; index++ ) {
      if (steps[index].id == stepId) {
        steps.splice(index, 1);
        break;
      }
    }
    var self: Tasks = this;
    this.edit.updateCurrentStudy(function () {
      self.nav.setContent("/studies/" + currentStudy.id + "/tasks", function () {});
    });
  }

  /**
   * Update the title of a task step and update the current study.
   *
   * @param {string} stepId - the id of the task step to update.
   * @param {HTMLElement} element - the html element containing the new title.
   */
  setStepTitle(stepId: string, element: HTMLElement) {
    var steps: Step[] = currentStudy.task.steps;
    for (var step: Step of currentStudy.task.steps) {
      if (step.id == stepId) {
        step.title = element.textContent;
        break;
      }
    }
    this.edit.updateCurrentStudy();
  }

}

export default Tasks;

window.task = new Tasks();
