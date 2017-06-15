$('#applicantForm').on('click', '#next', function() {
  $('#applicantForm').hide();
  $('#propertyForm').show();
});

$('#propertyForm').on('click', '#prev', function() {
  $('#applicantForm').show();
  $('#propertyForm').hide();
});

$('#propertyForm').submit(function(e) {
  e.preventDefault();
  $('#loadingDiv').show();
  $('#loadingDiv #second').hide();
  $('#propertyForm').hide();
  setTimeout(function() {
    $('#loadingDiv #first').hide();
    $('#loadingDiv #second').show();
    simulateTyping('Loading home details', '#loadingDiv #second');
    setTimeout(function() {
      $('#loadingDiv #first').show();
      $('#loadingDiv').hide();
      $('#propertyForm').show();
    }, 3000);
  }, 3000);
  $.get("/api/live");
  simulateTyping('Retrieving credit score', '#loadingDiv #first');
});

  function simulateTyping(str, element) {
    var currentCharIndex = 0;
    function typeChar(element){
      if (currentCharIndex >= str.length)
        return;
      var char = str[currentCharIndex];
      $(element).text($(element).text() + char);
      currentCharIndex++;
      setTimeout(function(){typeChar(element);}, Math.floor(Math.random() * 100) + 60);
    }
    typeChar(element);

  }
