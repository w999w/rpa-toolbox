import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSql } from '../dist/assets/validator.mjs';

test('accepts the comprehensive examples', async () => {
  const { BASIC_EXAMPLE, VARIABLE_EXAMPLE } = await import('../dist/assets/converter.mjs');
  assert.deepEqual(validateSql(BASIC_EXAMPLE), []);
  assert.deepEqual(validateSql(VARIABLE_EXAMPLE), []);
});

test('reports obvious structural errors with line numbers', () => {
  const messages = validateSql('SELECT\nFROM users\nWHERE AND id = 1\nORDER BY;').map((issue) => `${issue.line}:${issue.message}`);
  assert.ok(messages.includes('1:SELECT 后缺少查询字段。'));
  assert.ok(messages.includes('3:条件开头不能直接使用 AND 或 OR。'));
  assert.ok(messages.includes('4:ORDER BY 后缺少排序字段。'));
});

test('reports unmatched parentheses and incomplete update statements', () => {
  const issues = validateSql('UPDATE users\nSET\nWHERE id IN (1, 2');
  assert.ok(issues.some((issue) => issue.message.includes('SET 后')));
  assert.ok(issues.some((issue) => issue.message.includes('左圆括号')));
});

test('ignores syntax-like text inside strings and comments', () => {
  assert.deepEqual(validateSql("SELECT 'WHERE (' AS note -- ORDER BY\nFROM users;"), []);
});
