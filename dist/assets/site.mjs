import { BASIC_EXAMPLE, VARIABLE_EXAMPLE, convertSql } from './converter.mjs';
import { PROJECT } from './config.mjs';

export const PLATFORMS = [
  { id: 'jinzhiwei', name: '金智维 RPA', description: '把常用的脚本处理步骤，变成顺手的小工具。', path: 'tools/jinzhiwei/', tools: [
    { name: 'SQL 语句转换', description: '处理英文单引号与 #变量#，生成中文脚本或向导脚本。', path: 'tools/jinzhiwei/sql/' },
  ] },
];

const ROOT = new URL('../', import.meta.url);
const link = (path = '') => new URL(path, ROOT).href;
const githubUrl = PROJECT.repositoryUrl || PROJECT.authorUrl;
const githubLabel = PROJECT.repositoryUrl ? 'GitHub 项目' : '作者 GitHub';
const icons = {
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="3"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.01"/>',
  github: '<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.4-3.7 1.4a12.7 12.7 0 0 0-6.7 0C5.8.4 4.7.8 4.7.8a4.8 4.8 0 0 0-.1 3.6A5.2 5.2 0 0 0 3.2 8c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6v4"/>',
};
const icon = (name, className = '') => `<svg class="icon ${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const page = document.body.dataset.page;

function header() {
  return `<a class="skip-link" href="#main">跳到主要内容</a><header class="site-header glass"><a class="brand" href="${link()}"><span class="brand-icon">${icon('code')}</span><span>RPA <span class="brand-light">工具箱</span></span></a><nav class="main-nav" aria-label="主导航"><a class="${page === 'home' ? 'active' : ''}" ${page === 'home' ? 'aria-current="page"' : ''} href="${link()}">首页</a><a class="${page !== 'home' ? 'active' : ''}" href="${link('#platforms')}">RPA 工具</a></nav><a class="github-link" href="${githubUrl}" target="_blank" rel="noopener noreferrer" aria-label="${githubLabel}，打开新窗口">${icon('github')}<span>${githubLabel}</span>${icon('external', 'external-icon')}</a></header>`;
}

function footer() {
  return `<footer class="site-footer"><a class="footer-brand" href="${link()}">${icon('code')} RPA 工具箱</a><span>让每一次自动化开发，更轻松一点。</span><a href="${githubUrl}" target="_blank" rel="noopener noreferrer">w999w ${icon('external')}</a></footer>`;
}

function home() {
  return `<main id="main" class="home-main"><section class="hero"><div class="hero-copy"><span class="eyebrow"><span class="tiny-square"></span> 为 RPA 开发而建</span><h1>少一点重复，<br>多一点<span class="blue-word">顺手。</span></h1><p>把脚本转换等常用操作，收进一个轻巧的工具箱。<br class="desktop-break">从金智维开始，逐步扩展到更多 RPA 平台。</p><a class="button primary" href="#platforms">选择 RPA 工具 ${icon('arrow')}</a><div class="hero-note">${icon('lock')} 本地转换，即用即走</div></div><div class="hero-example" aria-label="SQL 转换示例"><div class="example-card example-source glass"><div class="example-label"><span class="code-dot"></span>原始 SQL<span class="mini-label">SQL</span></div><pre><span class="syntax-keyword">SELECT</span> *
<span class="syntax-keyword">FROM</span> Database
<span class="syntax-keyword">WHERE</span> name = <span class="syntax-string">'#姓名#'</span>;</pre></div><div class="transform-symbol">${icon('arrow')}</div><div class="example-card example-output glass"><div class="example-label"><span class="code-dot blue"></span>向导脚本<span class="small-tag">转换后</span></div><pre style="white-space: pre; overflow-x: auto;"><span class="syntax-string">'SELECT *'</span> + 换行符() + <span class="syntax-string">'FROM Database'</span> + 换行符() + <span class="syntax-string">'WHERE name = '''</span> + <span class="syntax-variable">#姓名#</span> + <span class="syntax-string">''';'</span></pre><div class="example-caption">${icon('check')} 引号处理与变量拼接，一步完成</div></div></div></section><section class="platform-section" id="platforms" aria-labelledby="platform-heading"><div class="section-heading"><div><span class="eyebrow">工具，从这里开始</span><h2 id="platform-heading">选择你的 RPA 平台</h2></div><span class="section-meta">目前支持 1 个平台</span></div><div class="platform-grid"><a class="platform-card glass" href="${link(PLATFORMS[0].path)}"><div class="platform-top"><span class="platform-icon">K</span><span class="soft-badge">1 个工具</span></div><h3>金智维 RPA</h3><p>SQL 脚本转换，少写一点重复的拼接。</p><div class="card-bottom"><span>进入工具箱</span><span class="circle-arrow">${icon('arrow')}</span></div></a><div class="future-card"><span class="future-icon">${icon('layers')}</span><div><h3>更多平台，逐步加入</h3><p>为后续的 RPA 小工具，留一个位置。</p></div><span class="muted-badge">敬请期待</span></div></div></section><section class="project-note"><span class="note-icon">${icon('info')}</span><p>这是一个按平台整理的 RPA 实用工具项目。首个工具支持两种金智维脚本格式，并保留 <code>#变量#</code> 标记，方便你在流程中使用。</p></section></main>`;
}

function breadcrumb(current) {
  return `<nav class="breadcrumb" aria-label="当前位置"><a href="${link()}">首页</a>${icon('chevron')}${current === '金智维 RPA' ? '<span aria-current="page">金智维 RPA</span>' : `<a href="${link(PLATFORMS[0].path)}">金智维 RPA</a>${icon('chevron')}<span aria-current="page">${current}</span>`}</nav>`;
}

function platform() {
  return `<main id="main" class="inner-main">${breadcrumb('金智维 RPA')}<section class="platform-intro"><span class="platform-icon large">K</span><div><span class="eyebrow">平台工具箱</span><h1>金智维 RPA</h1><p>${PLATFORMS[0].description}</p></div></section><div class="section-heading tool-list-heading"><h2>全部工具</h2><span class="section-meta">1 个工具</span></div><a class="tool-card glass" href="${link(PLATFORMS[0].tools[0].path)}"><span class="tool-icon">${icon('code')}</span><div class="tool-card-copy"><span class="soft-badge">脚本处理</span><h2>SQL 语句转换</h2><p>${PLATFORMS[0].tools[0].description}</p><div class="tool-tags"><span>中文脚本</span><span>向导脚本</span><span>变量拼接</span></div></div><span class="circle-arrow">${icon('arrow')}</span></a><p class="platform-footnote">后续金智维小工具会在这里继续添加。</p></main>`;
}

function converter() {
  return `<main id="main" class="inner-main converter-main">${breadcrumb('SQL 语句转换')}<div class="tool-title-row"><div><span class="eyebrow">金智维 RPA · 脚本处理</span><h1>SQL 语句转换</h1><p>粘贴 SQL，自动处理引号和变量拼接。</p></div><a class="text-link" href="#rules">${icon('info')} 转换规则</a></div><div class="converter-toolbar"><fieldset class="segmented-control"><legend class="sr-only">输出脚本类型</legend><label><input type="radio" name="mode" value="chinese" checked><span>中文脚本</span></label><label><input type="radio" name="mode" value="wizard"><span>向导脚本</span></label></fieldset><span class="toolbar-note" id="mode-description">逐行赋值，使用 + 换行符() 拼接换行</span></div><div class="editor-grid"><section class="editor-panel glass"><div class="editor-heading"><label for="sql-input"><span class="panel-number">01</span>原始 SQL</label><div class="editor-actions"><button class="text-button" id="example-button" type="button">变量示例</button><button class="text-button muted" id="clear-button" type="button">清空</button></div></div><div class="code-editor"><div class="line-numbers" id="input-lines" aria-hidden="true"></div><textarea id="sql-input" aria-describedby="variable-tip" placeholder="在这里粘贴你的 SQL 语句…" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off"></textarea></div><div class="editor-footer"><span id="input-stats">3 行</span><span>SQL</span></div></section><section class="editor-panel result-panel glass"><div class="editor-heading"><label for="sql-output"><span class="panel-number">02</span>转换结果</label><span class="live-label">实时转换</span></div><div class="code-editor"><div class="line-numbers" id="output-lines" aria-hidden="true"></div><textarea id="sql-output" readonly aria-describedby="conversion-status" placeholder="转换结果会显示在这里…" spellcheck="false" wrap="off"></textarea></div><div class="editor-footer result-footer"><span id="result-meta">中文脚本</span><button class="button primary copy-button" id="copy-button" type="button">${icon('copy')}<span>复制结果</span></button></div></section></div><div class="feedback" id="conversion-status" role="status" aria-live="polite"></div><div class="variable-tip" id="variable-tip"><span class="tip-symbol">#</span><p>变量以 <code>#</code> 开头、以 <code>#</code> 结尾，例如 <code>#客户号#</code>。转换时原样保留，并用英文 <code>+</code> 连接两侧文本。</p></div><section class="rules-section" id="rules"><div class="rules-heading"><h2>转换规则</h2><span>按原文处理，保留必要空格</span></div><div class="rules-table-wrap glass"><table class="rules-table"><thead><tr><th scope="col">场景</th><th scope="col">原始 SQL 片段</th><th scope="col">转换后的表达式</th></tr></thead><tbody><tr><th scope="row">英文单引号</th><td><code>name = 'cat'</code></td><td><code>'name = ''' + 'cat' + ''''</code></td></tr><tr><th scope="row">直接拼接变量</th><td><code>id = #客户号#</code></td><td><code>'id = ' + #客户号#</code></td></tr><tr><th scope="row">带引号的变量</th><td><code>name = '#姓名#'</code></td><td><code>'name = ''' + #姓名# + ''''</code></td></tr></tbody></table></div><p class="rules-note">两种模式均用 <code> + 换行符()</code> 拼接原 SQL 的换行。中文脚本逐行赋值；向导脚本的完整表达式为一行，运行后才产生换行。<code>'cat'</code> 是固定文本，<code>#cat#</code> 才是变量。这里只转换表达式，不执行 SQL，也不处理变量运行时的值。</p></section><p class="privacy-note">${icon('lock')} 所有转换均在浏览器内完成，SQL 不会上传。</p></main>`;
}

document.querySelector('#app').innerHTML = header() + (page === 'converter' ? converter() : page === 'platform' ? platform() : home()) + footer();

if (page === 'converter') {
  const input = document.querySelector('#sql-input');
  const output = document.querySelector('#sql-output');
  const copyButton = document.querySelector('#copy-button');
  const status = document.querySelector('#conversion-status');
  const exampleButton = document.querySelector('#example-button');
  let copyTimer;
  let revision = 0;
  input.value = BASIC_EXAMPLE;

  function lineNumbers(textarea, target) {
    document.querySelector(target).textContent = Array.from({ length: Math.max(1, textarea.value.split('\n').length) }, (_, i) => i + 1).join('\n');
    document.querySelector(target).scrollTop = textarea.scrollTop;
  }

  function refresh() {
    revision++;
    clearTimeout(copyTimer);
    copyButton.innerHTML = `${icon('copy')}<span>复制结果</span>`;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    document.querySelector('#mode-description').textContent = mode === 'chinese' ? '逐行赋值，使用 + 换行符() 拼接换行' : '单行表达式，使用 + 换行符() 拼接换行';
    status.className = 'feedback';
    status.textContent = '';
    try {
      const converted = convertSql(input.value, mode);
      output.value = converted.output;
      const label = mode === 'chinese' ? '中文脚本' : '向导脚本';
      document.querySelector('#result-meta').textContent = converted.output ? `${label}${converted.variables.length ? ' · ' + converted.variables.length + ' 个变量' : ''}` : '等待输入 SQL';
      if (converted.warnings.length) {
        status.textContent = converted.warnings.join(' ');
        status.classList.add('warning');
      }
    } catch (error) {
      output.value = '';
      document.querySelector('#result-meta').textContent = '请检查输入';
      status.textContent = error.message;
      status.classList.add('error');
    }
    copyButton.disabled = !output.value;
    document.querySelector('#input-stats').textContent = `${input.value ? input.value.split('\n').length : 0} 行 · ${input.value.length} 字符`;
    lineNumbers(input, '#input-lines');
    lineNumbers(output, '#output-lines');
  }

  input.addEventListener('input', refresh);
  document.querySelectorAll('input[name="mode"]').forEach((radio) => radio.addEventListener('change', refresh));
  input.addEventListener('scroll', () => { document.querySelector('#input-lines').scrollTop = input.scrollTop; });
  output.addEventListener('scroll', () => { document.querySelector('#output-lines').scrollTop = output.scrollTop; });
  document.querySelector('#clear-button').addEventListener('click', () => { input.value = ''; refresh(); input.focus(); });
  exampleButton.addEventListener('click', () => {
    const useBasic = input.value === VARIABLE_EXAMPLE;
    input.value = useBasic ? BASIC_EXAMPLE : VARIABLE_EXAMPLE;
    exampleButton.textContent = useBasic ? '变量示例' : '基础示例';
    refresh();
  });
  copyButton.addEventListener('click', async () => {
    if (!output.value) return;
    const currentRevision = revision;
    try {
      await navigator.clipboard.writeText(output.value);
      if (currentRevision !== revision) return;
      copyButton.innerHTML = `${icon('check')}<span>已复制</span>`;
      copyTimer = setTimeout(() => { copyButton.innerHTML = `${icon('copy')}<span>复制结果</span>`; }, 1800);
    } catch {
      if (currentRevision !== revision) return;
      output.focus();
      output.select();
      status.textContent = '浏览器未允许自动复制，已选中结果，请手动复制。';
      status.className = 'feedback warning';
    }
  });
  refresh();
}
