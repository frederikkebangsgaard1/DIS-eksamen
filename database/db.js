const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

module.exports = db;


/* SQL Schema for database.db
CREATE TABLE Users (
    user_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT NOT NULL CHECK(length(name) <= 100),
    email          TEXT NOT NULL UNIQUE CHECK(length(email) <= 255),
    phone_number   TEXT CHECK(length(phone_number) <= 20),
    password_hash  TEXT NOT NULL,
);

CREATE TABLE Events (
    event_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL CHECK(length(name) <= 200),
    date_time    DATETIME NOT NULL,
    location     TEXT CHECK(length(location) <= 255)
);

CREATE TABLE EventParticipants (
    event_participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id              INTEGER NOT NULL,
    event_id             INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id),
    UNIQUE (user_id, event_id)
);
*/