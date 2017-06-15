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
  var req = {};
  req.applicants = [];
  req.applicants[0] = {};
  req.applicants[0].firstName = $("#firstName").val();
  req.applicants[0].lastName = $("#lastName").val();
  req.applicants[0].ssn = $("#ssn").val();
  req.applicants[0].income = $("#income").val();
  req.applicants[0].address = {};
  var addressParts = $("#address").val().split(',');
  req.applicants[0].address.street = addressParts[0];
  req.applicants[0].address.city = addressParts[1];
  req.applicants[0].address.state = addressParts[2];
  req.applicants[0].address.zip = addressParts[3];

  var propertyAddressParts = $("#propertyAddress").val().split(',');
  req.property = {};
  req.property.address = {};
  req.property.address.street = propertyAddressParts[0];
  req.property.address.city = propertyAddressParts[1];
  req.property.address.state = propertyAddressParts[2];
  req.property.address.zip = propertyAddressParts[3];

  req.loan = {};
  req.loan.purchasePrice = $("#purchasePrice").val();
  req.loan.downPayment = $("#downPayment").val();
  req.loan.term = $("#term").val();

  setTimeout(function() {
    $('#loadingDiv #first').hide();
    $('#loadingDiv #second').show();
    simulateTyping('Loading home details', '#loadingDiv #second');
    setTimeout(function() {
      $('#loadingDiv #first').show();
      $('#loadingDiv').hide();
      $('#result').show();
    }, 3000);
  }, 3000);
  setTimeout(function() {
    simulateTyping('Retrieving credit score', '#loadingDiv #first');
  }, 0);
  $.post("/api/apply/mortgage", req, function(data) {
    $.get("/api/apply/mortgage/" + data.id, function(data) {
      $.get("/template", function(template) {
        var result = JSON.parse(data.resource);
        result.loan.total = result.loan.purchasePrice - result.loan.downPayment;

        var balance = result.loan.total; // for example
        var periods = result.loan.term * 12; // 30 years
        var monthlyRate = (0.065) / 12; // 0.065= APR of 6.5% as decimal
        var monthlyPayment = (monthlyRate / (1 - (Math.pow((1 + monthlyRate), -(periods))))) * balance;

        for (var i = 0; i < periods; i++) {
          var interestForMonth = balance * monthlyRate;
          var principalForMonth = monthlyPayment - interestForMonth;
          balance -= principalForMonth;
          if (balance < 0) {
            balance = 0;
          }
          console.log("Payment #" + (i + 1) + " " + balance);
        }
        result.loan.monthlyPayment = Math.round(monthlyPayment * 100) / 100;
        result.response.rate = Math.round(result.response.rate * 100) / 100;
        $('#result').html(Mustache.render(template, result));
      });
    });
  });
});

function simulateTyping(str, element) {
  var currentCharIndex = 0;

  function typeChar(element) {
    if (currentCharIndex >= str.length)
      return;
    var char = str[currentCharIndex];
    $(element).text($(element).text() + char);
    currentCharIndex++;
    setTimeout(function() {
      typeChar(element);
    }, Math.floor(Math.random() * 100) + 60);
  }
  typeChar(element);

}
