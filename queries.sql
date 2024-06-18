CREATE TABLE playopia (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Creating index on username
CREATE INDEX idx_username ON playopia(username);

-- Creating index on email
CREATE INDEX idx_email ON playopia(email);

CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
) WITH (OIDS=FALSE);

-- Creating index on expire
CREATE INDEX "IDX_session_expire" ON session (expire);
