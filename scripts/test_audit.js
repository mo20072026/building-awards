/**
 * 自动核对链路测试（CI / 本地通用）
 * 1) 在 jsdom 里加载真实页面
 * 2) 用本地 data/*.json 冒充接口返回
 * 3) 断言：① 页面自检全过 ② 页面数值与核对基准全一致 ③ 核对面板渲染完整
 * 4) 变异测试：故意改一个数值，确认基准比对能抓到（防止"永远绿"）
 *
 * 用法：node scripts/test_audit.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { JSDOM } = require('jsdom');

function boot() {
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), {
    runScripts: 'outside-only',
    url: 'https://example.local/',
  });
  const w = dom.window;
  w.IntersectionObserver = class { constructor() {} observe() {} };
  w.fetch = (u) => {
    const f = path.join(ROOT, u.split('?')[0]);
    if (!fs.existsSync(f)) return Promise.reject(new Error('404 ' + u));
    return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(fs.readFileSync(f, 'utf8'))) });
  };
  w.eval(fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8'));
  return w;
}

const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let fails = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + label);
  if (!cond) fails++;
}

(async () => {
  const w = boot();
  await wait();
  const c = w.__getCheck();
  if (!c) { console.error('页面未完成核对初始化（fetch 桩未生效？）'); process.exit(1); }

  console.log('【L1 页面自检】');
  const l1bad = c.l1.filter((x) => !x.ok);
  ok(l1bad.length === 0, `全部断言通过 ${c.l1.length - l1bad.length}/${c.l1.length}`);
  l1bad.forEach((x) => console.log('     - ' + x.id + ' · ' + x.label + ' · ' + x.detail));

  console.log('【L2 基准比对】');
  const l2bad = c.l2.filter((x) => !x.ok);
  ok(l2bad.length === 0, `全部体系与核对基准一致 ${c.l2.length - l2bad.length}/${c.l2.length}`);
  l2bad.forEach((x) => console.log('     - ' + x.id + ' · ' + x.diffs.join('；')));

  console.log('【L3 巡检结果接入】');
  ok(c.l3.length === w.__SYSTEMS.length, `巡检行数 = 体系数（${c.l3.length}）`);
  ok(c.l3.every((x) => x.status !== 'pending' && x.status !== 'missing'), '每个体系都有巡检状态');

  console.log('【面板渲染】');
  const doc = w.document;
  ok(!!doc.querySelector('#autocheck'), '自动核对面板存在');
  ok(doc.querySelectorAll('.ac-card').length === 4, '四张状态卡存在');
  ok(doc.querySelectorAll('.ac-tbl tbody tr, .ac-tbl tr').length >= w.__SYSTEMS.length + 1, '明细表覆盖全部体系');
  ok(!!doc.querySelector('#acRefresh'), '「重新读取核对结果」按钮存在');
  ok(doc.querySelector('.src-line .st') !== null, '卡片依据行显示动态核对状态');

  console.log('【折叠与受限标注】');
  const acFold = doc.querySelector('#autocheck details.fold');
  const srcFold = doc.querySelector('#sources details.fold');
  ok(!!acFold && !acFold.open, '自动核对面板默认折叠');
  ok(!!srcFold && !srcFold.open, '数据核对记录默认折叠');
  ok(/① 自检/.test(acFold.querySelector('.fold-s').textContent), '折叠标题保留三层核对摘要');
  acFold.querySelector('summary').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(acFold.open === true, '手动点击后展开');
  const LIMITED = ['unreachable', 'archived'];
  const limited = c.l3.filter((x) => LIMITED.includes(x.status));
  const naBox = doc.querySelector('.na-box');
  if (limited.length) {
    ok(!!naBox, `抓取受限清单已渲染（${limited.length} 项）`);
    ok(doc.querySelectorAll('.na-item').length === limited.length, '清单逐条列出受限体系');
    ok(/存档|人工/.test(naBox.textContent), '清单标注了替代核对方式');
  } else {
    ok(!naBox, '无受限体系时不渲染清单');
  }
  const arcOne = c.l3.find((x) => x.status === 'archived');
  if (arcOne) ok(!!doc.querySelector('.st.arch'), '存档比对状态徽标已渲染');

  console.log('【变异测试：基准比对应能抓到改动】');
  const S = w.__SYSTEMS;
  const t = S.find((s) => s.id === 'leed');
  const backup = t.calc.total;
  t.calc.total = 999;
  const c2 = w.runChecks ? w.runChecks() : null;
  // runChecks 是函数声明，挂在 window 上
  ok(!!c2, 'runChecks 可重入');
  if (c2) ok(c2.l2.find((x) => x.id === 'leed').ok === false, '改动满分后被判定为不一致');
  t.calc.total = backup;
  if (c2) ok(w.runChecks().l2.every((x) => x.ok), '还原后重新一致');

  console.log(fails ? `\n${fails} 项失败` : '\n全部通过');
  process.exit(fails ? 1 : 0);
})();
