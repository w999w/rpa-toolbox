export class ConversionError extends Error {}

export const BASIC_EXAMPLE = "SELECT *\nFROM Database\nWHERE name = 'cat';";
export const VARIABLE_EXAMPLE = "SELECT name\nFROM Database\nWHERE name = '#姓名#'\n  AND id = #客户号#;";

const quote = (value) => "'" + value.replaceAll("'", "''") + "'";

function tokenize(sql) {
  const parts = [];
  const variables = new Set();
  const warnings = new Set();
  let buffer = '';

  function interpolate(value, keepEmpty = false) {
    const pattern = /#[^#\n]+#/g;
    let start = 0;
    let match;
    while ((match = pattern.exec(value))) {
      if (!match[0].slice(1, -1).trim()) continue;
      if (match.index > start) parts.push({ kind: 'text', value: value.slice(start, match.index) });
      parts.push({ kind: 'variable', value: match[0] });
      variables.add(match[0]);
      start = match.index + match[0].length;
    }
    const remainder = value.slice(start);
    if (remainder || (keepEmpty && !value)) parts.push({ kind: 'text', value: remainder });
    const unmatched = value.replace(/#([^#\n]+)#/g, (marker, name) => name.trim() ? '' : marker);
    if (unmatched.includes('#')) warnings.add('发现未配对或为空的 # 标记，已按普通文本保留。变量请写成 #变量名#。');
  }

  function flush() {
    if (buffer) interpolate(buffer);
    buffer = '';
  }

  for (let i = 0; i < sql.length;) {
    if (sql.startsWith('--', i)) {
      flush();
      const end = sql.indexOf('\n', i);
      parts.push({ kind: 'text', value: sql.slice(i, end === -1 ? sql.length : end) });
      i = end === -1 ? sql.length : end;
      continue;
    }
    if (sql.startsWith('/*', i)) {
      flush();
      const end = sql.indexOf('*/', i + 2);
      if (end === -1) throw new ConversionError('SQL 的 /* 注释没有闭合，请补上 */。');
      parts.push({ kind: 'text', value: sql.slice(i, end + 2) });
      i = end + 2;
      continue;
    }
    if (sql[i] === "'") {
      buffer += "'";
      flush();
      const start = ++i;
      while (i < sql.length) {
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") { i += 2; continue; }
          break;
        }
        i++;
      }
      if (i === sql.length) throw new ConversionError('SQL 的英文单引号没有闭合，请检查字符串。');
      const content = sql.slice(start, i);
      interpolate(content, true);
      buffer = "'";
      i++;
      continue;
    }
    if ('"`['.includes(sql[i])) {
      const start = i;
      const closer = sql[i] === '[' ? ']' : sql[i];
      i++;
      while (i < sql.length) {
        if (sql[i] === closer) {
          if (sql[i + 1] === closer) { i += 2; continue; }
          break;
        }
        i++;
      }
      if (i === sql.length) throw new ConversionError('SQL 的标识符引号没有闭合，请检查双引号、反引号或方括号。');
      const content = sql.slice(start, ++i);
      buffer += content;
      continue;
    }
    buffer += sql[i++];
  }
  flush();
  if (/[‘’“”]/.test(sql)) warnings.add('检测到中文弯引号，已保留原文。SQL 字符串和脚本语法请使用英文半角引号。');
  return { parts, variables: [...variables], warnings: [...warnings] };
}

function expression(parts) {
  return parts.length ? parts.map((part) => part.kind === 'variable' ? part.value : quote(part.value)).join(' + ') : "''";
}

export function convertSql(input, mode = 'chinese') {
  if (!['chinese', 'wizard'].includes(mode)) throw new ConversionError('未知的脚本类型。');
  const sql = input.replace(/\r\n?/g, '\n');
  if (!sql.trim()) return { output: '', variables: [], warnings: [], lineCount: 0 };
  const result = tokenize(sql);
  const lines = [[]];
  for (const part of result.parts) {
    if (part.kind === 'variable') { lines.at(-1).push(part); continue; }
    const pieces = part.value.split('\n');
    pieces.forEach((value, index) => {
      if (index) lines.push([]);
      if (value || part.value === '') lines.at(-1).push({ kind: 'text', value });
    });
  }

  let output;
  if (mode === 'wizard') {
    output = lines.map(expression).join(' + 换行符() + ');
  } else {
    output = lines.map((parts, index) => {
      return `${index ? 'SQL语句 = SQL语句 + ' : 'SQL语句 = '}${expression(parts)}${index < lines.length - 1 ? ' + 换行符()' : ''}`;
    }).join('\n');
  }
  return { output, variables: result.variables, warnings: result.warnings, lineCount: sql.split('\n').length };
}
