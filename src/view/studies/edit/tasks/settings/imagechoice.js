// @flow
'use strict';

import { Cookies } from '../../../../lib/cookies';
import type { Survey } from '../../../../../control/studies/survey.type';

import Edit from '../../index';
import Navigation from '../../nav';

declare var currentStudy: Survey;

/**
 * Image choice settings management class.
 */
class ImageChoice {

  edit: Edit;
  nav: Navigation;

  constructor() {
    this.edit = new Edit();
    this.nav = new Navigation();
  }

  /**
   * Set icon image to the one specified in current study.
   *
   * Also, set drag and drop handler to update icon.
   */
  showImageForm() {
    var self: ImageChoice = this;

    var fileSelect: ?HTMLElement = document.getElementById("fileSelect");
    var fileElement: ?HTMLElement = document.getElementById("fileElement");
    if (!fileSelect || !fileElement) {
      throw "Could not find file elements";
    }

    (fileSelect: any).addEventListener("click", function (event: MouseEvent) {
      if (fileElement) {
        fileElement.click();
      }
      event.preventDefault(); // prevent navigation to "#"
    }, false);

    var dropbox = document.querySelector('body');
    (dropbox: any).addEventListener("dragenter", function (event: MouseEvent) {
      self.dragenter(event);
    }, false);
    (dropbox: any).addEventListener("dragover", function (event: MouseEvent) {
      self.dragover(event);
    }, false);
    (dropbox: any).addEventListener("drop", function (event: MouseEvent) {
      self.drop(event);
    }, false);
  }

  /**
   * Stop drag events from propagating.
   */
  dragenter(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Stop drag events from propagating.
   */
  dragover(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Handle drop events.
   */
  drop(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    var dataTransfer: DataTransfer = (event: any).dataTransfer;
    var files: FileList = dataTransfer.files;

    this.handleFiles(files);
  }

  /**
   * Handle files sent using drag and drop or using file selection dialog.
   *
   * @param {files} - The list of selected or dropped files.
   */
  handleFiles(files: FileList) {
    if (!Cookies.get('bearer')) {
      window.location.assign('/join?return=' + window.location.pathname);
    }

    if (files.length == 0) {
      return;
    }

    var iconimg: ?HTMLImageElement = ((document.getElementById('iconimg'): ?any): ?HTMLImageElement);
    if (!iconimg) { throw "Could not find iconimg element"; }
    (iconimg: any).file = files[0];

    var stepId = iconimg.getAttribute('step-id');

    var reader: FileReader = new FileReader();
    reader.onload = (function(img: HTMLImageElement) {
      return function(e) {
        (img: any).src = e.target.result;
      };
    })(iconimg);
    reader.readAsDataURL(files[0]);

    console.log("Uploading file...");
    var formData: FormData = new FormData();
    formData.append("file", files[0]);
    var self: ImageChoice = this;
    fetch('/studies/' + currentStudy.id + '/tasks/imageChoice/upload', {
      method: 'PUT',
      credentials: 'include',
      body: formData
    }).then(function(response) {
      return response.json();
    }).then(function(image) {
      if (!stepId) { throw "Could not find stepId"; }
      self.addImageInStep(image.path, stepId);
    }).catch(function(err) {
      console.log('Fetch error: ' + err);
    });

  }

  addImageInStep(src: string, stepId: string) {
    var self: ImageChoice = this;
    fetch('/studies/tasks/step/item/create/imagechoice', {
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
        var step = self.edit.getStep(stepId);
        if (!step) { return }

        if (!step.items) {
          step.items = Array();
        }
        var items = step.items;
        if (!items) { return }

        json["src"] = src;

        items.push(json);
        step.items = items;

        self.edit.updateCurrentStudy(function () {
          self.nav.setContent("/studies/" + currentStudy.id + "/tasks/" + stepId, function () {});
        });
      }
    ).catch(
      function(err) {
        console.log('Fetch error: ' + err);
      }
    );
  }

}

export default ImageChoice;

window.imageChoice = new ImageChoice();
