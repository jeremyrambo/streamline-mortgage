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
