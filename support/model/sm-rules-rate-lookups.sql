CREATE SCHEMA sm_rules;


CREATE TABLE IF NOT EXISTS sm_rules.income_to_loan_ratio (
  min DECIMAL NOT NULL,
  max DECIMAL NOT NULL,
  multiplier DECIMAL NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO sm_rules.income_to_loan_ratio (min, max, multiplier) VALUES (0, .1, .5), (.1, .3, .4), (.3, .4, .3), (.4, .5, .19), (.5, .7, .08), (.7, .9, .04), (.9, 999999, .01);

CREATE TABLE IF NOT EXISTS sm_rules.year_built (
  min INT NOT NULL,
  max INT NOT NULL,
  multiplier DECIMAL NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sm_rules.year_built (min, max, multiplier) VALUES (0, 1950, .005), (1951, 1970, .003), (1971, 2000, .002), (2001, 9999, .001);

CREATE TABLE IF NOT EXISTS sm_rules.grade_multiplier (
  grade CHAR(1) NOT NULL,
  multiplier DECIMAL NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sm_rules.grade_multiplier (grade, multiplier) VALUES ('G', 1.5), ('F', 1.2), ('E', 1), ('D', .95), ('C', .75), ('B', .55), ('A', .125);

CREATE TABLE IF NOT EXISTS sm_rules.base_rate (
  rate DECIMAL NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sm_rules.base_rate (rate) VALUES (4.99);
