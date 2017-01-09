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
  
  var showIconForm = function () {
    var iconimg = document.getElementById('iconimg');
    iconimg.src = currentStudy.icon;
    
    var fileSelect = document.getElementById("fileSelect");
    var fileElement = document.getElementById("fileElement");

    fileSelect.addEventListener("click", function (e) {
      if (fileElement) {
        fileElement.click();
      }
      e.preventDefault(); // prevent navigation to "#"
    }, false);
    
    var dropbox = document.querySelector('body');
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);
  }
  
  var dragenter = function (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  var dragover = function (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  var drop = function (event) {
    event.stopPropagation();
    event.preventDefault();

    var dataTransfer = event.dataTransfer;
    var files = dataTransfer.files;

    handleFiles(files);
  }

  var handleFiles = function (files) {
    if (files.length == 0) {
      return;
    }
    
    var iconimg = document.getElementById('iconimg');
    iconimg.file = files[0];

    var reader = new FileReader();
    reader.onload = (function(img) {
      return function(e) {
        img.src = e.target.result;
      };
    })(iconimg);
    reader.readAsDataURL(files[0]);
    
    // TODO: upload image and set icon property of currentStudy
  }

  var showDialog = function (dialogId) {
    var dialog = document.getElementById(dialogId);
    if (!dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }
    dialog.querySelector('.close').addEventListener('click', function() {
      dialog.close();
    });
    dialog.showModal();
    dialog.show();
  }
  
  return {
    readInfoForm: readInfoForm,
    showInfoForm: showInfoForm,
    showIconForm: showIconForm,
    updateCurrentStudy: updateCurrentStudy,
    handleFiles: handleFiles,
    showDialog: showDialog,
    updateCurrentStudy: updateCurrentStudy
  }
})();

