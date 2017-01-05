var edit = (function () {

  var updateCurrentStudy = function () {
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
      console.log('Fetch Error :-S', err);
    });
  }

  var readInfoForm = function () {
    var form = document.querySelector('form');
    currentStudy.title = form.elements['surveyname'].value;
    // TODO: add other fields to survey
    
    updateCurrentStudy();
    return false;
  }
  
  var showInfoForm = function () {
    var studyname = document.getElementById('surveyname');
    studyname.parentElement.MaterialTextfield.change(currentStudy.title);

    // TODO: read other attributes from survey
  }

  return {
    readInfoForm: readInfoForm,
    showInfoForm: showInfoForm,
    updateCurrentStudy: updateCurrentStudy
  }
})();

