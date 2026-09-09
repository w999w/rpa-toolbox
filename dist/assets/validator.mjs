function maskLiteralsAndComments(sql) {
  const chars = [...sql];
  let state = 'plain';
  let closer = '';

  for (let index = 0; index < chars.length; index++) {
    const current = chars[index];
    const next = chars[index + 1];
    if (state === 'line-comment') {
      if (current === '\n') state = 'plain';
      else chars[index] = ' ';
      continue;
    }
    if (state === 'block-comment') {
      if (current === '*' && next === '/') {
        chars[index] = chars[index + 1] = ' ';
        index++;
        state = 'plain';
      } else if (current !== '\n') chars[index] = ' ';
      continue;
    }
    if (state === 'quoted') {
      if (current === closer) {
        if (next === closer && closer !== ']') {
          chars[index] = chars[index + 1] = ' ';
          index++;
        } else {
          chars[index] = ' ';
          state = 'plain';
        }
      } else if (current !== '\n') chars[index] = ' ';
      continue;
    }
    if (current === '-' && next === '-') {
      chars[index] = chars[index + 1] = ' ';
      index++;
      state = 'line-comment';
    } else if (current === '/' && next === '*') {
      chars[index] = chars[index + 1] = ' ';
      index++;
      state = 'block-comment';
    } else if (current === "'" || current === '"' || current === '`' || current === '[') {
      closer = current === '[' ? ']' : current;
      chars[index] = ' ';
      state = 'quoted';
    }
  }
  return chars.join('');
}

const lineAt = (value, index) => value.slice(0, index).split('\n').length;

export function validateSql(sql) {
  if (!sql.trim()) return [];
  const masked = maskLiteralsAndComments(sql);
  const issues = [];
  const add = (severity, message, index = 0) => issues.push({ severity, message, line: lineAt(masked, index) });

  const parentheses = [];
  for (let index = 0; index < masked.length; index++) {
    if (masked[index] === '(') parentheses.push(index);
    if (masked[index] === ')') {
      if (parentheses.length) parentheses.pop();
      else add('error', '发现多余的右圆括号。', index);
    }
  }
  for (const index of parentheses) add('error', '左圆括号没有闭合。', index);

  const checks = [
    [/\bSELECT\s*(?=FROM\b|$|;)/i, 'SELECT 后缺少查询字段。'],
    [/\bFROM\s*(?=$|;|\b(?:WHERE|GROUP|ORDER|HAVING|LIMIT|UNION)\b)/i, 'FROM 后缺少表名。'],
    [/^\s*UPDATE\s*(?=SET\b|$|;)/i, 'UPDATE 后缺少表名。'],
    [/\bSET\s*(?=$|;|\bWHERE\b)/i, 'SET 后缺少更新内容。'],
    [/^\s*INSERT\s+(?!OR\b)(?!INTO\b)/i, 'INSERT 语句缺少 INTO。'],
    [/\bINTO\s*(?=$|;|\b(?:VALUES|SELECT)\b)/i, 'INTO 后缺少表名。'],
    [/^\s*DELETE\s*(?!FROM\b)/i, 'DELETE 语句缺少 FROM。'],
    [/\bJOIN\s*(?=$|;|\b(?:ON|USING|WHERE|GROUP|ORDER|HAVING|LIMIT)\b)/i, 'JOIN 后缺少表名。'],
    [/\bWHERE\s*(?=$|;|\b(?:GROUP|ORDER|HAVING|LIMIT|UNION)\b)/i, 'WHERE 后缺少筛选条件。'],
    [/\bHAVING\s*(?=$|;|\b(?:ORDER|LIMIT|UNION)\b)/i, 'HAVING 后缺少筛选条件。'],
    [/\bGROUP\s+BY\s*(?=$|;|\b(?:HAVING|ORDER|LIMIT|UNION)\b)/i, 'GROUP BY 后缺少分组字段。'],
    [/\bORDER\s+BY\s*(?=$|;|\b(?:LIMIT|UNION)\b)/i, 'ORDER BY 后缺少排序字段。'],
    [/\b(?:WHERE|HAVING|ON)\s+(?:AND|OR)\b/i, '条件开头不能直接使用 AND 或 OR。'],
    [/,(?=\s*\bFROM\b)/i, 'FROM 前存在多余的逗号。'],
  ];
  for (const [pattern, message] of checks) {
    const match = pattern.exec(masked);
    if (match) add('error', message, match.index);
  }

  const ending = masked.trimEnd().replace(/;\s*$/, '').trimEnd();
  const dangling = /(?:\b(?:AND|OR|WHERE|HAVING|ON|BY|SET|INTO)|[,=<>+\-*\/])$/i.exec(ending);
  if (dangling) add('warning', `语句不能以 ${dangling[0].trim()} 结尾。`, masked.lastIndexOf(dangling[0]));

  return issues.filter((issue, index) => issues.findIndex((item) => item.message === issue.message && item.line === issue.line) === index);
}
