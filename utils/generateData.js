var faker = require('faker');
var Chance = require('chance');

var chance = new Chance();
var terms = [10, 15, 20, 30];
var roofs = ["asphalt", "steel", "ceramic", "paper", "tin"];

function generateApplicant() {
  var applicant = {};
  applicant.firstName = faker.name.firstName();
  applicant.lastName = faker.name.lastName();
  applicant.birthDate = faker.date.between('1917-01-01', '1999-01-01');
  applicant.ssn = chance.ssn();
  applicant.address = generateAddress();
  return applicant;
}

function generateAddress() {
  var address = {};
  address.street = faker.address.streetAddress();
  address.city = faker.address.city();
  address.state = faker.address.stateAbbr();
  address.zip = faker.address.zipCode();
  return address;
}

function generateApplicants(count) {
  if(count === 1) {
    return generateApplicant();
  } else {
    var applicants = [];
    for(var i = 0; i < count; i++) {
      applicants[i] = generateApplicant();
    }
  }
}

function generateProperty() {
  var property = {};
  property.address = generateAddress();
}

function generateLoan() {
  var loan = {};
  loan.purchasePrice = faker.finance.amount() * 1000;
  loan.downPayment = faker.finance.amount() * 100;
  loan.term = terms[chance.integer({min: 0, max: 3})];
}

function generateCreditScoreResponse() {
  var response = generateApplicant;
  response.birthDate = null;
  response.score = chance.integer({min: 0, max: 900});
}

function generateZillowResponse() {
  var response = {};
  response.address = generateAddress();
  response.estimatedValue = faker.finance.amount() * 1000;
  response.parcelNumber = chance.integer({min: 100000000, max:999999999});
  var features = {};
  features.beds = chance.integer({min: 1, max: 8});
  features.baths = chance.integer({min: 1, max: 8});
  features.yearBuilt = chance.year({min: 1890, max: 2017});
  features.sqft = chance.integer({min: 900, max: 9000});
  features.lotSize = chance.integer({min: 5000, max: 1000000});
  features.garage = chance.integer({min: 0, max: 5});
  features.roof = roofs[chance.integer({min: 0, max: 4})];
  response.features = features;
}

module.exports = {
  generate : {
    applicant : function() {
      return generateApplicants(1);
    },
    applicants : function(count) {
      return generateApplicants(count);
    },
    address : function() {
      return generateAddress();
    },
    property : function() {
      return generateProperty();
    },
    loan : function() {
      return generateLoan();
    },
    creditScore : function() {
      return generateCreditScoreResponse();
    },
    zillowResponse : function() {
      return generateZillowResponse();
    }
  }
};
