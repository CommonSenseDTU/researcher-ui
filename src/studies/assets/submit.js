var survey = (function () {

  var save = function (survey) {
    fetch('/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + Cookies.get('bearer')
      },
      body: JSON.stringify(survey)
    }).then(
        function(response) {
          if (response.status >= 400) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }
        
          console.log('Saved survey');
          
          // Examine the text in the response
          response.json().then(function(data) {
            console.log(data);
          });
        }
    ).catch(function(err) {  
      console.log('Fetch Error :-S', err);
    });
  }
  
  var create = function () {
    fetch('/studies/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: ''
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
            save(data);
          });
        }
    ).catch(function(err) {  
      console.log('Fetch Error :-S', err);
    });
    return false;
  }

  return {
    create: create,
    save: save
  }
})();

