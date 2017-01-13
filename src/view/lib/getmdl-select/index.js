// @flow
'use strict';

export class MDLSelect {
  addEventListeners(dropdown: HTMLElement) {
    var input: ?HTMLInputElement = ((dropdown.querySelector('input'): ?any): ?HTMLInputElement);
    var list: NodeList<HTMLElement> = dropdown.querySelectorAll('li');

    [].forEach.call(list, function (li) {
        li.onclick = function () {
          if (!input) {
            console.log("input element not found in dropdown");
            return;
          }
          input.value = li.textContent;
          if ("createEvent" in document) {
              var evt: Event = document.createEvent("HTMLEvents");
              evt.initEvent("change", false, true);
              input.dispatchEvent(evt);
          } else {
              (input: any).fireEvent("onchange");
          }
        }
    });
  }

  init(selector: string) {
    var dropdowns: NodeList<HTMLElement> = document.querySelectorAll(selector);
    var self = this;
    [].forEach.call(dropdowns, function (i) {
        self.addEventListeners(i);
    });
  }
}

window.getmdlSelect = new MDLSelect();
