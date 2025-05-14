CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT NOT NULL,
      status      TEXT NOT NULL,
      start_date  TEXT,
      end_date    TEXT,
      priority    TEXT,
      created     INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      done        INTEGER NOT NULL DEFAULT 0,
      due_date    TEXT,
      created     INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT,
      date        TEXT NOT NULL,
      color       TEXT,
      created     INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notes (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text  TEXT NOT NULL,
      created INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      link TEXT,
      image TEXT,
      created INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      value REAL NOT NULL,
      created INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      target_value REAL NOT NULL,
      current_value REAL NOT NULL DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      activity_type TEXT,
      category TEXT NOT NULL,
      deadline TEXT,
      created INTEGER NOT NULL
    );