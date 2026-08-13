const test = require('node:test');
const assert = require('node:assert');
const SqlParser = require('../index.js');

// A fresh parser with one database and a 3-column table holding two rows.
function freshDb() {
  const p = new SqlParser();
  p.Parse('CREATE DATABASE d;');
  p.Parse('CREATE TABLE t (a INT, b INT, c INT);');
  p.Parse('INSERT INTO t (a, b, c) VALUES (1, 2, 3);');
  p.Parse('INSERT INTO t (a, b, c) VALUES (4, 5, 6);');
  return p;
}

test('SELECT * returns every row', () => {
  const p = freshDb();
  assert.deepStrictEqual(p.Parse('SELECT * FROM t;'), [['1', '2', '3'], ['4', '5', '6']]);
});

test('SELECT a subset projects the correct columns', () => {
  const p = freshDb();
  assert.deepStrictEqual(p.Parse('SELECT a, c FROM t;'), [['1', '3'], ['4', '6']]);
});

test('SELECT respects the requested column order', () => {
  const p = freshDb();
  assert.deepStrictEqual(p.Parse('SELECT c, a FROM t;'), [['3', '1'], ['6', '4']]);
});

test('SELECT * ... WHERE filters rows', () => {
  const p = freshDb();
  assert.deepStrictEqual(p.Parse('SELECT * FROM t WHERE b=5;'), [['4', '5', '6']]);
});

test('SELECT cols ... WHERE filters and projects', () => {
  const p = freshDb();
  assert.deepStrictEqual(p.Parse('SELECT a, c FROM t WHERE a=1;'), [['1', '3']]);
});

test('tables are resolved by name across multiple tables', () => {
  const p = freshDb();
  p.Parse('CREATE TABLE u (x INT);');
  p.Parse('INSERT INTO u (x) VALUES (9);');
  assert.deepStrictEqual(p.Parse('SELECT * FROM u;'), [['9']]);
  assert.deepStrictEqual(p.Parse('SELECT * FROM t;'), [['1', '2', '3'], ['4', '5', '6']]);
});

test('DROP TABLE removes the table', () => {
  const p = freshDb();
  assert.doesNotThrow(() => p.Parse('DROP TABLE t;'));
  assert.throws(() => p.Parse('SELECT * FROM t;'), /TABLE not found/);
});

test('USE switches the active database', () => {
  const p = new SqlParser();
  p.Parse('CREATE DATABASE d1;');
  p.Parse('CREATE TABLE t (a INT);');
  p.Parse('INSERT INTO t (a) VALUES (1);');
  p.Parse('CREATE DATABASE d2;'); // d2 becomes current
  p.Parse('CREATE TABLE t (a INT);');
  p.Parse('INSERT INTO t (a) VALUES (2);');
  p.Parse('USE d1;');
  assert.deepStrictEqual(p.Parse('SELECT * FROM t;'), [['1']]);
});

test('SELECT before choosing a database throws', () => {
  const p = new SqlParser();
  assert.throws(() => p.Parse('SELECT * FROM t;'), /No Database selected/);
});

test('SELECT from a missing table throws', () => {
  const p = freshDb();
  assert.throws(() => p.Parse('SELECT * FROM missing;'), /TABLE not found/);
});

test('unsupported statements throw', () => {
  const p = freshDb();
  assert.throws(() => p.Parse('UPDATE t SET a=1;'), /not supported/);
});
