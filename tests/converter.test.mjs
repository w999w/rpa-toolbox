import test from 'node:test';
import assert from 'node:assert/strict';
import { convertSql, BASIC_EXAMPLE, VARIABLE_EXAMPLE, ConversionError } from '../dist/assets/converter.mjs';

// Decode only the documented string / #variable# / 换行符() concatenation grammar.
// Never execute an expression or SQL provided by a user.
function decodeExpression(expression, variables = {}) {
  let i = 0;
  let result = '';
  while (i < expression.length) {
    while (/\s/.test(expression[i] ?? '') && i < expression.length) i++;
    if (expression[i] === "'") {
      i++;
      let closed = false;
      while (i < expression.length) {
        if (expression[i] === "'") {
          if (expression[i + 1] === "'") { result += "'"; i += 2; }
          else { i++; closed = true; break; }
        } else result += expression[i++];
      }
      assert.ok(closed, 'Unclosed script string');
    } else if (expression[i] === '#') {
      const end = expression.indexOf('#', i + 1);
      assert.ok(end > i + 1, 'Unclosed variable marker');
      const name = expression.slice(i, end + 1);
      result += variables[name] ?? name;
      i = end + 1;
    } else if (expression.startsWith('换行符()', i)) {
      result += '\n';
      i += '换行符()'.length;
    } else assert.fail('Unexpected script syntax at ' + expression.slice(i));
    while (/\s/.test(expression[i] ?? '') && i < expression.length) i++;
    if (i < expression.length) {
      assert.equal(expression[i], '+');
      i++;
      assert.ok(expression.slice(i).trim(), 'Trailing concatenation operator');
    }
  }
  return result;
}

function decodeChinese(script, variables) {
  return script.split('\n').map((line, index) => {
    const prefix = index ? 'SQL语句 = SQL语句 + ' : 'SQL语句 = ';
    assert.ok(line.startsWith(prefix));
    return decodeExpression(line.slice(prefix.length), variables);
  }).join('');
}

test('user example: exact wizard expression', () => {
  assert.equal(convertSql(BASIC_EXAMPLE, 'wizard').output, "'SELECT *' + 换行符() + 'FROM Database' + 换行符() + 'WHERE name = ''' + 'cat' + ''';'");
});

test('user example: Chinese assignment lines and required separators', () => {
  assert.equal(convertSql(BASIC_EXAMPLE).output, "SQL语句 = 'SELECT *' + 换行符()\nSQL语句 = SQL语句 + 'FROM Database' + 换行符()\nSQL语句 = SQL语句 + 'WHERE name = ''' + 'cat' + ''';'");
});

test('user variables: preserve spelling, case and boundary spaces', () => {
  const result = convertSql('select name #变量# From table', 'wizard');
  assert.equal(result.output, "'select name ' + #变量# + ' From table'");
  assert.equal(decodeExpression(result.output, { '#变量#': ', age' }), 'select name , age From table');
});

test('literal and variable cat are different', () => {
  assert.equal(convertSql("'cat'", 'wizard').output, "'''' + 'cat' + ''''");
  assert.equal(convertSql('#cat#', 'wizard').output, '#cat#');
  assert.equal(convertSql("'#cat#'", 'wizard').output, "'''' + #cat# + ''''");
});

test('quoted and unquoted variables reconstruct the intended SQL', () => {
  const variables = { '#姓名#': 'cat', '#客户号#': '42' };
  const expected = "SELECT name\nFROM Database\nWHERE name = 'cat'\n  AND id = 42;";
  assert.equal(decodeExpression(convertSql(VARIABLE_EXAMPLE, 'wizard').output, variables), expected);
  assert.equal(decodeChinese(convertSql(VARIABLE_EXAMPLE).output, variables), expected);
});

test('empty strings, escaped quotes and adjacent variables survive round trips', () => {
  const samples = [
    "SELECT '', 'O''Brien', '''', 'a''''b';",
    '#前缀##后缀#',
    "SELECT 'prefix#客户号#suffix', '#a##b#';",
    '  SELECT\tname\n\nFROM Database\nWHERE id = #id#;\n',
    'SELECT [owner\'s table], "a\'b", `a\'b` FROM Database;',
    "SELECT '</textarea><script>alert(1)</script>', 'a+b', '路径\\文件';",
    'SELECT *\r\nFROM Database\rWHERE id = #id#;',
  ];
  for (const input of samples) {
    const normalized = input.replace(/\r\n?/g, '\n');
    const wizard = convertSql(input, 'wizard').output;
    assert.doesNotMatch(wizard, /[\r\n]/);
    assert.equal(decodeExpression(wizard), normalized);
    assert.equal(decodeChinese(convertSql(input).output), normalized);
  }
});

test('wizard preserves comments and multiline quoted values exactly', () => {
  for (const input of ["SELECT 1 -- don't replace #markers#\n, 2;", "SELECT 'line1\nline2';", 'SELECT "line1\nline2";', "SELECT /* don't\nchange #this# */ 1;"]) {
    const wizard = convertSql(input, 'wizard').output;
    assert.doesNotMatch(wizard, /[\r\n]/);
    assert.equal(decodeExpression(wizard), input);
  }
});

test('Chinese mode reconstructs newline-dependent SQL without inserting spaces', () => {
  for (const input of ['SELECT 1 -- comment\n, 2;', "SELECT 'line1\nline2';", 'SELECT "line1\nline2";', 'SELECT /* comment\ncontinued */ 1;']) {
    assert.equal(decodeChinese(convertSql(input).output), input);
  }
});

test('leading, blank and trailing lines use exactly the original newline positions', () => {
  const input = '\nSELECT 1;\n\n';
  const wizard = convertSql(input, 'wizard').output;
  assert.equal(wizard, "'' + 换行符() + 'SELECT 1;' + 换行符() + '' + 换行符() + ''");
  assert.equal(decodeExpression(wizard), input);
  const chinese = convertSql(input).output;
  assert.equal(chinese, "SQL语句 = '' + 换行符()\nSQL语句 = SQL语句 + 'SELECT 1;' + 换行符()\nSQL语句 = SQL语句 + '' + 换行符()\nSQL语句 = SQL语句 + ''");
  assert.equal(decodeChinese(chinese), input);
});

test('invalid SQL quoting returns actionable errors', () => {
  for (const input of ["SELECT 'cat", 'SELECT "name', 'SELECT [name', 'SELECT `name', 'SELECT /* comment']) {
    assert.throws(() => convertSql(input, 'wizard'), ConversionError);
  }
});

test('empty input produces no script', () => {
  for (const mode of ['chinese', 'wizard']) assert.equal(convertSql(' \t\n', mode).output, '');
});

test('unpaired, empty, and whitespace-only markers remain text with a warning', () => {
  for (const input of ['SELECT #客户号', 'SELECT ##', 'SELECT # #', "SELECT '#';"]) {
    const result = convertSql(input, 'wizard');
    assert.equal(decodeExpression(result.output), input);
    assert.equal(result.variables.length, 0);
    assert.ok(result.warnings.length);
  }
});

test('variable list deduplicates markers; values are not evaluated', () => {
  assert.deepEqual(convertSql('SELECT #id#, #id#, #姓名#', 'wizard').variables, ['#id#', '#姓名#']);
});

test('curly quotes are preserved and surfaced rather than silently replaced', () => {
  const input = 'SELECT ‘cat’;';
  const result = convertSql(input, 'wizard');
  assert.equal(decodeExpression(result.output), input);
  assert.ok(result.warnings.some((warning) => warning.includes('弯引号')));
});

test('unrecognized output mode is rejected', () => {
  assert.throws(() => convertSql('SELECT 1;', 'other'), /脚本类型/);
});
