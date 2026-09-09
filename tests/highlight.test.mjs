import test from 'node:test';
import assert from 'node:assert/strict';
import { detectSqlStatement, highlightSql } from '../dist/assets/highlight.mjs';

test('detects common SQL statement families', () => {
  assert.deepEqual(detectSqlStatement('-- note\nSELECT * FROM users'), { type: 'query', label: '查询语句' });
  assert.deepEqual(detectSqlStatement('INSERT INTO users VALUES (1)'), { type: 'insert', label: '新增语句' });
  assert.deepEqual(detectSqlStatement('UPDATE users SET name = 1'), { type: 'update', label: '更新语句' });
  assert.deepEqual(detectSqlStatement('DELETE FROM users'), { type: 'delete', label: '删除语句' });
});

test('highlights keywords, variables, strings, numbers and comments safely', () => {
  const html = highlightSql("SELECT #客户号# FROM users WHERE id = 12 AND name = 'cat'; -- <note>");
  assert.match(html, /token-keyword">SELECT/);
  assert.match(html, /token-variable">#客户号#/);
  assert.match(html, /token-number">12/);
  assert.match(html, /token-string">'cat'/);
  assert.match(html, /token-comment">-- &lt;note&gt;/);
  assert.doesNotMatch(html, /<note>/);
});
