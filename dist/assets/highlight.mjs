const KEYWORDS = new Set([
  'ADD', 'ALL', 'ALTER', 'AND', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE', 'CREATE',
  'CROSS', 'DELETE', 'DESC', 'DISTINCT', 'DROP', 'ELSE', 'END', 'EXISTS', 'FROM',
  'FULL', 'GROUP', 'HAVING', 'IN', 'INNER', 'INSERT', 'INTO', 'IS', 'JOIN', 'LEFT',
  'LIKE', 'LIMIT', 'MERGE', 'NOT', 'NULL', 'ON', 'OR', 'ORDER', 'OUTER', 'RIGHT',
  'SELECT', 'SET', 'TABLE', 'THEN', 'UNION', 'UPDATE', 'VALUES', 'WHEN', 'WHERE',
  'WITH'
]);

const STATEMENTS = {
  SELECT: ['query', '查询语句'],
  WITH: ['query', '查询语句'],
  INSERT: ['insert', '新增语句'],
  UPDATE: ['update', '更新语句'],
  DELETE: ['delete', '删除语句'],
  CREATE: ['definition', '定义语句'],
  ALTER: ['definition', '定义语句'],
  DROP: ['definition', '定义语句'],
  MERGE: ['update', '合并语句'],
};

function escapeHtml(value) {
  return value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);
}

export function detectSqlStatement(value) {
  const withoutComments = value.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/--[^\n]*/g, ' ');
  const keyword = withoutComments.match(/\b(SELECT|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|MERGE)\b/i)?.[1]?.toUpperCase();
  const [type, label] = STATEMENTS[keyword] || ['unknown', 'SQL 语句'];
  return { type, label };
}

export function highlightSql(value) {
  const tokenPattern = /(--[^\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|#[^#\r\n]+#|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;
  let result = '';
  let cursor = 0;

  for (const match of value.matchAll(tokenPattern)) {
    result += escapeHtml(value.slice(cursor, match.index));
    const token = match[0];
    const upper = token.toUpperCase();
    let className = '';
    if (token.startsWith('--') || token.startsWith('/*')) className = 'token-comment';
    else if (token.startsWith('#')) className = 'token-variable';
    else if (token.startsWith("'")) className = 'token-string';
    else if (/^\d/.test(token)) className = 'token-number';
    else if (KEYWORDS.has(upper)) className = 'token-keyword';
    result += className ? `<span class="${className}">${escapeHtml(token)}</span>` : escapeHtml(token);
    cursor = match.index + token.length;
  }

  return result + escapeHtml(value.slice(cursor)) + '\n';
}
