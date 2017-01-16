// @flow
'use strict';

import { Cookies } from '../../lib/cookies';
import type { Survey } from '../../../control/studies/survey.type';

/**
 * Ensure that global header variable is defined.
 */
import '../header';

declare var currentStudy: Survey;
declare var dialogPolyfill: any;

class Edit {
  updateCurrentStudy() {
    if (!Cookies.get('bearer')) {
      window.location.assign('/join?return=' + window.location.pathname);
    }
    fetch('/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + Cookies.get('bearer')
      },
      body: JSON.stringify(currentStudy)
    }).catch(function(err) {
      console.log('Fetch error: ' + err);
    });
  }

  readInfoForm(): boolean {
    var form: ?HTMLFormElement = ((document.querySelector('form'): ?any): ?HTMLFormElement);
    if (!form) {
      console.log("Could not find form element");
      return false;
    }
    var surveyname: ?HTMLInputElement = ((form.elements.namedItem('surveyname'): ?any): ?HTMLInputElement);
    if (!surveyname) {
      console.log("Could not find surveyname in form");
      return false;
    }
    currentStudy.title = surveyname.value;

    // TODO: add other fields to survey

    this.updateCurrentStudy();
    return false;
  }

  showInfoForm() {
    var studyname: ?HTMLElement = document.getElementById('surveyname');
    if (!studyname) {
      throw "Could not find surveyname element";
    }
    var parentElement: ?Element = studyname.parentElement;
    if (!parentElement) {
      throw "surveyname has no parent";
    }
    (parentElement: any).MaterialTextfield.change(currentStudy.title);

    // TODO: read other attributes from survey
  }

  showIconForm() {
    var self: Edit = this;
    var iconimg: ?HTMLImageElement = ((document.getElementById('iconimg'): ?any): ?HTMLImageElement);
    if (!iconimg) {
      throw "Could not find iconimg element";
    }
    iconimg.src = currentStudy.icon;

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

  dragenter(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  dragover(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  drop(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    var dataTransfer: DataTransfer = (event: any).dataTransfer;
    var files: FileList = dataTransfer.files;

    this.handleFiles(files);
  }

  handleFiles(files: FileList) {
    if (files.length == 0) {
      return;
    }

    var iconimg: ?HTMLImageElement = ((document.getElementById('iconimg'): ?any): ?HTMLImageElement);
    if (!iconimg) {
      throw "Could not find iconimg element";
    }
    (iconimg: any).file = files[0];

    var reader: FileReader = new FileReader();
    reader.onload = (function(img: HTMLImageElement) {
      return function(e) {
        (img: any).src = e.target.result;
      };
    })(iconimg);
    reader.readAsDataURL(files[0]);

    // TODO: upload image and set icon property of currentStudy
  }

  showDialog(dialogId: string) {
    var dialog: ?any = document.getElementById(dialogId);
    if (!dialog) {
      throw "Could not find dialog element";
    }
    if (!dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }
    var close: ?HTMLElement = dialog.querySelector('.close');
    if (close) {
      close.addEventListener('click', function() {
        if (!dialog) {
          throw "Could not find dialog element";
        }
        dialog.close();
      });
    }
    (dialog: any).showModal();
    (dialog: any).show();
  }
}

export default Edit;

window.edit = new Edit();
