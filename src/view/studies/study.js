// @flow
'use strict';

import { Cookies } from '../lib/cookies';
import type { Survey } from '../../control/studies/survey.type';

class Study {
  save(study: Survey) {
    fetch('/v1/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + Cookies.get('bearer')
      },
      body: JSON.stringify(study)
    }).then(
        function(response) {
          if (response.status >= 400) {
            throw "Looks like there was a problem. Status Code: " + response.status;
          }

          document.location.assign('/studies/' + study.id);
        }
    ).catch(function(err) {
      console.log('Fetch error: ' + err);
    });
  }

  create(): boolean {
    var self: Study = this;
    fetch('/studies/create', {
      credentials: "include"
    }).then(
        function(response) {
          if (response.status !== 201) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }

          console.log('Created survey');

          // Immediately save the newly created survey
          response.json().then(function(data) {
            self.save(data);
          });
        }
    ).catch(function(err) {
      console.log('Fetch error: ' + err);
    });
    return false;
    }
}

window.study = new Study();

export default Study;
