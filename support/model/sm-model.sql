CREATE SCHEMA sm;


-- -----------------------------------------------------
-- Table sm.mortgage
--
-- id - Simply a unique identifier
-- resource - JSON representation of the mortgage resource
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS sm.mortgage (
  id BIGSERIAL NOT NULL,
  resource TEXT NOT NULL,

  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX mortgage_id_unique_idx ON sm.mortgage (id);

CREATE SCHEMA IF NOT EXISTS sm_metric;


CREATE TABLE IF NOT EXISTS sm_metric.api_log (
  request_path VARCHAR(100) NOT NULL,
  source_ip VARCHAR(20) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  agent VARCHAR(300));
