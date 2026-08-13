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

test('WHERE matching several rows returns all of them', () => {
  const p = freshDb();
  p.Parse('INSERT INTO t (a, b, c) VALUES (1, 9, 9);');
  assert.deepStrictEqual(p.Parse('SELECT * FROM t WHERE a=1;'), [['1', '2', '3'], ['1', '9', '9']]);
});

test('WHERE matching nothing returns an empty result', () => {
  const p = freshDb();
  assert.deepStrictEqual(p.Parse('SELECT * FROM t WHERE a=99;'), []);
});

test('statements are case-insensitive', () => {
  const p = freshDb();
  assert.deepStrictEqual(p.Parse('SeLeCt * FROM T;'), [['1', '2', '3'], ['4', '5', '6']]);
});

test('the trailing semicolon is optional', () => {
  const p = freshDb();
  assert.deepStrictEqual(p.Parse('SELECT * FROM t'), [['1', '2', '3'], ['4', '5', '6']]);
});

test('SELECT of an unknown column throws', () => {
  const p = freshDb();
  assert.throws(() => p.Parse('SELECT z FROM t;'), /COLUMN\(S\) not found/);
});

test('WHERE on an unknown column throws', () => {
  const p = freshDb();
  assert.throws(() => p.Parse('SELECT * FROM t WHERE z=1;'), /COLUMN\(S\) not found/);
});

test('INSERT into a missing table throws', () => {
  const p = freshDb();
  assert.throws(() => p.Parse('INSERT INTO missing (a) VALUES (1);'), /TABLE not found/);
});

test('CREATE TABLE before choosing a database throws', () => {
  const p = new SqlParser();
  assert.throws(() => p.Parse('CREATE TABLE t (a INT);'), /No Database selected/);
});

test('INSERT before choosing a database throws', () => {
  const p = new SqlParser();
  assert.throws(() => p.Parse('INSERT INTO t (a) VALUES (1);'), /No Database selected/);
});

test('DROP DATABASE clears the active database', () => {
  const p = freshDb();
  p.Parse('DROP DATABASE d;');
  assert.strictEqual(p.getCurrentDatabase(), null);
  assert.throws(() => p.Parse('SELECT * FROM t;'), /No Database selected/);
});

test('DROP TABLE leaves the other tables alone', () => {
  const p = freshDb();
  p.Parse('CREATE TABLE u (x INT);');
  p.Parse('INSERT INTO u (x) VALUES (9);');
  p.Parse('DROP TABLE t;');
  assert.deepStrictEqual(p.Parse('SELECT * FROM u;'), [['9']]);
  assert.strictEqual(p.getCurrentDatabase().getTables().length, 1);
});
