# streamline-mortgage

- [ ] Add the ability to store mortgage requests as JSON
- [ ] Add the ability to process mortgage requests for underwriting
- [ ] Add the ability to fabricate credit score data
- [ ] Add the ability to fabricate housing value data
- [ ] Add the ability to publish underwriting decisions
- [ ] Add the ability to retrieve mortgage requests by ID
- [ ] Add the ability to generate "loads" of mortgage requests with fabricated data
- [ ] Create a user interface to apply for a mortgage
- [ ] Create a user interface to monitor the portfolio risk
- [ ] Add the ability to dynamically change underwriting decisions
- [ ] Add the ability to learn the changes in the risk portfolio and adjust rules at runtime - _machine learning_.


## Data Sample

__Request__

```javascript
{
  applicants : [
    {
      firstName:'',
      lastName:'',
      birthDate:'',
      ssn:'',
      address: {
        street:'',
        city:'',
        state:'',
        zip:''
      }
    }
  ],

  property: {
    address: {
      street:'',
      city:'',
      state:'',
      zip:''
    }
  },

  loan : {
    requestedAmount:'',
    downPayment:'',
    term:''
  }
}
```
