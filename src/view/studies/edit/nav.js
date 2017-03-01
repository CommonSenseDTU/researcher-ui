// @flow
'use strict';

import { Cookies } from '../../lib/cookies';
import { MDLSelect } from '../../lib/getmdl-select';

declare var getmdlSelect: MDLSelect;

class Navigation {
  setContent(url: string, completion: Function) {
    fetch(url, {
      credentials: "include"
    }).then(
        function(response) {
          if (!Cookies.get('bearer')) {
            window.location.assign('/join?return=' + document.location.pathname);
          }

          if (response.status >= 400) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }

          response.text().then(function(text) {
            var content: ?HTMLElement = document.getElementById("content");
            if (!content) {
              throw "Could not find content element";
            }
            while (content.firstChild) {
                content.removeChild(content.firstChild);
            }
            var parser: DOMParser = new DOMParser();
            var fetchedDocument: Document = parser.parseFromString(text, "text/html");
            var fetched: ?HTMLElement = fetchedDocument.querySelector("body");
            if (!fetched) {
              throw "No body found in fetched document";
            }
            if (fetched.childNodes) {
              while (fetched.childNodes.length > 0) {
                  content.appendChild(fetched.childNodes[0]);
              }
            }

            // Re-init mdlSelect component to ensure functional dropdown
            getmdlSelect.init('.getmdl-select');

            completion();
          });
        }
    ).catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
  }
}

export default Navigation;

window.nav = new Navigation();
