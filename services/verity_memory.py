"""Local, persistent memory and lexical retrieval for Verity.

This module has no third-party dependencies and may be used independently of
the desktop UI. Retrieval treats stored content as data, never instructions.
"""
import re
import sqlite3
import time
from pathlib import Path


class MemoryStore:
    def __init__(self, path):
        self.path = str(path)
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(self.path)
        self.db.execute('PRAGMA foreign_keys = ON')
        self.db.executescript('''
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY, content TEXT NOT NULL,
                kind TEXT NOT NULL, created_at REAL NOT NULL
            );
            CREATE VIRTUAL TABLE IF NOT EXISTS memory_search USING fts5(
                content, content='memories', content_rowid='id'
            );
            CREATE TRIGGER IF NOT EXISTS memory_insert AFTER INSERT ON memories BEGIN
                INSERT INTO memory_search(rowid, content) VALUES (new.id, new.content);
            END;
            CREATE TRIGGER IF NOT EXISTS memory_delete AFTER DELETE ON memories BEGIN
                INSERT INTO memory_search(memory_search, rowid, content)
                VALUES ('delete', old.id, old.content);
            END;
            CREATE TABLE IF NOT EXISTS entities (
                id INTEGER PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE UNIQUE
            );
            CREATE TABLE IF NOT EXISTS relations (
                id INTEGER PRIMARY KEY, subject_id INTEGER NOT NULL REFERENCES entities(id),
                predicate TEXT NOT NULL, object_id INTEGER NOT NULL REFERENCES entities(id),
                memory_id INTEGER REFERENCES memories(id) ON DELETE CASCADE,
                UNIQUE(subject_id, predicate, object_id, memory_id)
            );
        ''')
        self.db.commit()

    def add(self, content, kind='note'):
        content = content.strip()
        if not content:
            raise ValueError('Memory must not be empty')
        with self.db:
            cur = self.db.execute('INSERT INTO memories(content, kind, created_at) VALUES (?, ?, ?)',
                                  (content, kind, time.time()))
        return cur.lastrowid

    def delete(self, memory_id):
        with self.db:
            return self.db.execute('DELETE FROM memories WHERE id = ?', (memory_id,)).rowcount > 0

    def relate(self, subject, predicate, obj, memory_id=None):
        subject, predicate, obj = (x.strip() for x in (subject, predicate, obj))
        if not all((subject, predicate, obj)):
            raise ValueError('Relation fields must not be empty')
        with self.db:
            for name in (subject, obj):
                self.db.execute('INSERT OR IGNORE INTO entities(name) VALUES (?)', (name,))
            self.db.execute('''INSERT INTO relations(subject_id, predicate, object_id, memory_id)
                VALUES ((SELECT id FROM entities WHERE name = ?), ?,
                        (SELECT id FROM entities WHERE name = ?), ?)''',
                        (subject, predicate, obj, memory_id))

    def search(self, query, limit=5, max_chars=2400):
        terms = re.findall(r'[^\W_]+', query, re.UNICODE)[:20]
        if not terms or limit <= 0 or max_chars <= 0:
            return []
        expression = ' OR '.join('"' + term.replace('"', '""') + '"' for term in terms)
        rows = self.db.execute('''SELECT m.id, m.content, m.kind FROM memory_search s
            JOIN memories m ON m.id = s.rowid WHERE memory_search MATCH ?
            ORDER BY bm25(memory_search), m.created_at DESC LIMIT ?''',
            (expression, min(limit, 50))).fetchall()
        results, remaining = [], max_chars
        for memory_id, content, kind in rows:
            if remaining <= 0:
                break
            excerpt = content[:remaining]
            results.append({'id': memory_id, 'content': excerpt, 'kind': kind})
            remaining -= len(excerpt)
        return results

    def neighbors(self, name, limit=20):
        rows = self.db.execute('''SELECT s.name, r.predicate, o.name, r.memory_id
            FROM relations r JOIN entities s ON s.id = r.subject_id
            JOIN entities o ON o.id = r.object_id
            WHERE s.name = ? OR o.name = ? ORDER BY r.id DESC LIMIT ?''',
            (name, name, max(0, min(limit, 100)))).fetchall()
        return [{'subject': s, 'predicate': p, 'object': o, 'memory_id': m}
                for s, p, o, m in rows]

    def close(self):
        self.db.close()
