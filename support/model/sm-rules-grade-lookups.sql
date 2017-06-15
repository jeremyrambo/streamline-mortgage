CREATE SCHEMA sm_rules;


CREATE TABLE IF NOT EXISTS sm_rules.income (
  min INT NOT NULL,
  max INT NOT NULL,
  factor INT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO sm_rules.income (min, max, factor) VALUES (0, 10000, 0), (10001, 20000, 1), (20001, 40000, 2), (40001, 70000, 3), (70001, 100000, 4), (100000, 100000000, 5);

CREATE TABLE IF NOT EXISTS sm_rules.credit_score (
  min INT NOT NULL,
  max INT NOT NULL,
  factor INT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sm_rules.credit_score (min, max, factor) VALUES (0, 100, 0), (101, 200, 1), (201, 400, 2), (401, 500, 3), (501, 600, 4), (601, 100000000, 5);

CREATE TABLE IF NOT EXISTS sm_rules.grade (
  factor INT NOT NULL,
  grade CHAR(1) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sm_rules.grade (factor, grade) VALUES (0, 'G'), (1, 'F'), (2, 'E'), (3, 'E'), (4, 'D'), (5, 'D'), (6, 'C'), (7, 'C'), (8, 'B'), (9, 'B'), (10, 'A');
