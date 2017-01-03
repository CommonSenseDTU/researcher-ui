var formValidator = (function () {

  var submitted = false;

  function submit() {
    submitted = true;
  
  }

  var create = function () {
    if (submitted) {
      return false;
    }
    submit();
  
    var form = document.querySelector('form');
    fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: form.elements['username'].value,
        password: form.elements['userpass'].value
      })
    }).then(
        function(response) {
          submitted = false;
          if (response.status == 409) {
            var username = form.elements['username'];
            username.parentNode.classList.add('is-invalid');
            // Attempt login to handle user pressing create in stead of login
            login();
            return;
          }
          
          if (response.status !== 201) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }
        
          console.log('Created user');
          
          // Immediately send login request to get bearer token
          login();
        }
    ).catch(function(err) {  
      console.log('Fetch Error :-S', err);
      submitted = false;
    });
    return false;
  }

  var login = function () {
    if (submitted) {
      return false;
    }
    submit();

    console.log('Login submit...');
    var form = document.querySelector('form');
    var formData = new FormData();
    formData.append('grant_type', 'password');
    formData.append('username', form.elements['username'].value);
    formData.append('password', form.elements['userpass'].value);
    fetch('/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(clientAuth)
      },
      body: formData
    }).then(
        function(response) {
          if (response.status !== 200) {
            var form = document.querySelector('form');
            var userpass = form.elements['userpass'];
            var passerror = document.getElementById("passerror");
            passerror.textContent = 'Username and password do not match!';
            userpass.parentNode.classList.add('is-invalid');
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            submitted = false;
            return;
          }
        
          console.log('Authenticated');
        
          response.json().then(function(data) {
            var form = document.querySelector('form');
            console.log('data: ' + JSON.stringify(data));
            Cookies.set('bearer', data.access_token, { expires: data.expires_in });
            Cookies.set('refresh', data.refresh_token, { expires: Infinity });
            Cookies.set('userid', form.elements['username'].value, { expires: data.expires_in });
            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('return')) {
              window.location.replace(urlParams.get('return'));
            } else {
              window.location.replace('/');
            }
          });
        
          submitted = false;
        }
    ).catch(function(err) {  
      console.log('Fetch Error :-S', err);
      submitted = false;
    });
    return false;
  }
  
  var passwordFocus = function() {
    var form = document.querySelector('form');
    var username = form.elements['username'];
    var userpass = form.elements['userpass'];
    var usererror = document.getElementById("usererror");
    username.parentNode.classList.remove('is-invalid');
    var passerror = document.getElementById("passerror");
    if (passerror.textContent === 'Username and password do not match!') {
      passerror.textContent = 'Minimum 4 characters, please!';
      userpass.parentNode.classList.remove('is-invalid');
    }
  }
  
  return {
    create: create,
    login: login,
    passwordFocus: passwordFocus
  }
})();

