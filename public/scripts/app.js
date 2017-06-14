$('#applicantForm').on('click', '#next', function() {
  $('#applicantForm').hide();
  $('#propertyForm').show();
});

$('#propertyForm').on('click', '#prev', function() {
  $('#applicantForm').show();
  $('#propertyForm').hide();
});

$('#propertyForm').submit(function(e) {
  $('#loadingDiv').show();
  $('#loadingDiv #second').hide();
  $('#propertyForm').hide();
  e.preventDefault();
  setTimeout(function() {
    $('#loadingDiv #first').hide();
    $('#loadingDiv #second').show();
    setTimeout(function() {
      $('#loadingDiv #first').show();
      $('#loadingDiv').hide();
      $('#propertyForm').show();
    }, 2500);
  }, 2500);
});

var $loading = $('#loadingDiv').hide();
$(document)
  .ajaxStart(function() {
    $loading.show();
  })
  .ajaxStop(function() {
    sleep(5000);
    $loading.hide();
  });


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}
