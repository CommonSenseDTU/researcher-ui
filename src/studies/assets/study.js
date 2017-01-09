var study = (function () {

  var save = function (study) {
    fetch('/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + Cookies.get('bearer')
      },
      body: JSON.stringify(study)
    }).then(
        function(response) {
          if (response.status >= 400) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }
        
          document.location.assign('/studies/' + study.id);
        }
    ).catch(function(err) {  
      console.log('Fetch Error :-S', err);
    });
  }
  
  var create = function () {
    fetch('/studies/create').then(
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

