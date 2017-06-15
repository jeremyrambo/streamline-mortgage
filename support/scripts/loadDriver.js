var dataGen = require("../../utils/generateData");

function simulateLoad(count) {
  var requests = [];
  for(var i = 0; i < count; i++) {
    requests[i] = {};
    requests[i].applicants = [dataGen.generate.applicant()];
    requests[i].property = dataGen.generate.property();
    requests[i].loan = dataGen.generate.loan();
  }
  return requests;
}
