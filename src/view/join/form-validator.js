// @flow
'use strict';

declare var clientAuth: string;

import { Cookies } from '../../lib/cookies/assets/cookies.type';

class FormValidator {

  submitted: boolean;

  constructor() {
    this.submitted = false;
  }

  create(): boolean {
    if (this.submitted) {
      return false;
    }
    this.submitted = true;

    var self = this;
    var form: ?HTMLFormElement = ((document.querySelector('form'):?any): ?HTMLFormElement);
    if (!form) {
      this.submitted = false;
      throw "Could not find element 'form'";
    }
    var username: ?HTMLInputElement = ((form.elements.namedItem('username'): ?any): ?HTMLInputElement);
    var userpass: ?HTMLInputElement = ((form.elements.namedItem('userpass'): ?any): ?HTMLInputElement);
    if (!username || !userpass) {
      this.submitted = false;
      throw "Missing elements in form";
    }
    fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: userpass.value
      })
    }).then(
        function(response) {
          self.submitted = false;
          if (response.status == 409) {
            if (!username) {
              throw "Missing username in form";
            }
            var parentElement: ?HTMLElement = ((username.parentElement: ?any): ?HTMLElement);
            if (parentElement) {
              parentElement.classList.add('is-invalid');
            }
            // Attempt login to handle user pressing create in stead of login
            self.login();
            return;
          }

          if (response.status !== 201) {
            throw 'Looks like there was a problem. Status Code: ' + response.status;
          }

          console.log('Created user');

          // Immediately send login request to get bearer token
          self.login();
        }
    ).catch(function(err) {
      self.submitted = false;
      console.log('Fetch error: ' + err);
    });
    return false;
  }

  login(): boolean {
    if (this.submitted) {
      return false;
    }
    this.submitted = true;

    console.log('Login submit...');
    var form: ?HTMLFormElement = ((document.querySelector('form'): ?any): ?HTMLFormElement);
    if (!form) {
      this.submitted = false;
      throw "Could not find element 'form'";
    }
    var username: ?HTMLInputElement = ((form.elements.namedItem('username'): ?any): ?HTMLInputElement);
    var userpass: ?HTMLInputElement = ((form.elements.namedItem('userpass'): ?any): ?HTMLInputElement);
    if (!username || !userpass) {
      this.submitted = false;
      console.log("Missing elements in form");
      return false;
    }
    var formData: FormData = new FormData();
    formData.append('grant_type', 'password');
    formData.append('username', username.value);
    formData.append('password', userpass.value);
    var self = this;
    fetch('/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(clientAuth)
      },
      body: formData
    }).then(
      function(response) {
        self.submitted = false;
        if (response.status !== 200) {
          var passerror: ?HTMLElement = document.getElementById("passerror");
          if (passerror) {
            passerror.textContent = 'Username and password do not match!';
          }
          if (userpass) {
            var parentElement: ?HTMLElement = ((userpass.parentElement: ?any): ?HTMLElement);
            if (parentElement) {
              parentElement.classList.add('is-invalid');
            }
          }
          throw 'Looks like there was a problem. Status Code: ' + response.status;
        }

        console.log('Authenticated');

        response.json().then(function(data) {
          if (!username) {
            throw "Missing username in form";
          }
          Cookies.set('bearer', data.access_token, { expires: data.expires_in });
          Cookies.set('refresh', data.refresh_token, { expires: Infinity });
          Cookies.set('userid', username.value, { expires: data.expires_in });
          var urlParams: URLSearchParams = new URLSearchParams(window.location.search);
          if (urlParams.has('return')) {
            window.location.replace(urlParams.get('return'));
          } else {
            window.location.replace('/');
          }
        });
      }
    ).catch(function(err) {
      console.log('Fetch error: ' + err);
      self.submitted = false;
    });
    return false;
  }

  passwordFocus() {
    var form: ?HTMLFormElement = ((document.querySelector('form'): ?any): ?HTMLFormElement);
    if (!form) {
      console.log("Could not find element 'form'");
      return;
    }
    var username: ?HTMLInputElement = ((form.elements.namedItem('username'): ?any): ?HTMLInputElement);
    var userpass: ?HTMLInputElement = ((form.elements.namedItem('userpass'): ?any): ?HTMLInputElement);
    var usererror: ?HTMLElement = ((document.getElementById("usererror"): ?any): ?HTMLElement);
    if (!username) {
      console.log("Could not find username in form");
      return;
    }
    var parentElement: ?HTMLElement = ((username.parentElement: ?any): ?HTMLElement);
    if (parentElement) {
      parentElement.classList.remove('is-invalid');
    }
    var passerror: ?HTMLElement = ((document.getElementById("passerror"): ?any): ?HTMLElement);
    if (passerror && passerror.textContent === 'Username and password do not match!') {
      passerror.textContent = 'Minimum 4 characters, please!';
      if (userpass) {
        var parentElement: ?HTMLElement = ((userpass.parentElement: ?any): ?HTMLElement);
        if (parentElement) {
          parentElement.classList.remove('is-invalid');
        }
      }
    }
  }
}

window.formValidator = new FormValidator();
