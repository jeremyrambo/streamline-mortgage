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



-- -----------------------------------------------------
-- Table sm.api_events
--
-- id - Simply a unique identifier
-- path - Request path generating the API event.
-- method - Request method generating the API event.
-- response - JSON representation of the API event reponse body.
--
-- -----------------------------------------------------

CREATE TABLE IF NOT EXISTS sm.api_events (
  id BIGSERIAL NOT NULL,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  response TEXT NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id)
);
CREATE UNIQUE INDEX api_events_id_unique_idx ON sm.api_events (id);
