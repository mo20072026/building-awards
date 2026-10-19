/* 冒烟测试：jsdom 加载页面，验证渲染与计算器 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'http://localhost/' });
const { window } = dom;
window.IntersectionObserver = class { constructor(){} observe(){} disconnect(){} };

let pass = 0, fail = 0;
const ok = (cond, name) => { if (cond) { pass++; } else { fail++; console.log('  ✗ ' + name); } };

// 执行 app.js
const appCode = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
try { window.eval(appCode); } catch (e) { console.log('执行失败:', e.message); process.exit(1); }
const doc = window.document;

// 1. 侧栏与主渲染
ok(doc.querySelectorAll('.sidebar a').length > 15, '侧栏链接数');
ok(doc.querySelectorAll('.cert').length === 19, '认证卡片数 = 19');
ok(doc.querySelector('#compare'), '对比区存在且唯一');
ok(doc.querySelectorAll('[id="compare"]').length === 1, '对比区不重复');
ok(doc.querySelector('#sources'), '数据核对记录区存在');
ok(doc.querySelectorAll('#sources tbody tr, #sources tr').length >= 20, '核对记录覆盖全部体系');
ok(doc.querySelectorAll('.src-line').length === 19, '每个体系都有依据行');

// 2. 展开卡片 + 选项卡（LEED/三星默认已展开，用 BREEAM 测试切换）
doc.querySelector('[data-toggle="breeam"]').click();
ok(doc.querySelector('#cert-breeam').classList.contains('open'), '点击展开卡片');

// 3. LEED 计算器：填满分应得 Platinum
const leedInputs = doc.querySelectorAll('[data-calc="leed"] [data-ci]');
const leedMax = [16,10,11,33,13,16,1,6,4];
leedInputs.forEach((inp,i)=>inp.value = leedMax[i]);
leedInputs[0].dispatchEvent(new window.Event('input', {bubbles:true}));
let out = doc.querySelector('[data-out="leed"]');
ok(/Platinum/.test(out.innerHTML), 'LEED 满分 → Platinum，实际: ' + out.textContent.trim());

// 4. 绿建三星：控制项+较高分 → 三星
doc.querySelector('[data-toggle="cn3star"]').click();
const gb = i => doc.querySelector(`[data-gb="${i}"]`);
[80,80,80,160,80].forEach((v,i)=>gb(i).value=v);
gb(0).dispatchEvent(new window.Event('input', {bubbles:true}));
let gout = doc.querySelector('[data-out="cn3star"]');
// Q = (400+480)/10 = 88 ≥85 → 三星
ok(/三星/.test(gout.innerHTML), '绿建三星高分 → 三星级，实际: ' + gout.textContent.trim());

// 5. 绿建三星：某类不足30%
gb(3).value = 50; // 资源节约 50 < 60（30% of 200）
gb(3).dispatchEvent(new window.Event('input', {bubbles:true}));
ok(/暂不达星/.test(doc.querySelector('[data-out="cn3star"]').innerHTML), '绿建三星单类<30% 提示');

// 6. 健康建筑：运行评价 高分 → 三星
doc.querySelector('[data-toggle="cnhealth"]').click();
const hh = i => doc.querySelector(`[data-hh="${i}"]`);
[90,90,90,90,90,90,5].forEach((v,i)=>hh(i).value=v);
hh(0).dispatchEvent(new window.Event('input', {bubbles:true}));
let hout = doc.querySelector('[data-out="cnhealth"]');
// Σ=0.25*90+0.2*90+0.25*90+0.1*90+0.1*90+0.1*90+5 = 90*0.9+5=86 → 三星
ok(/三星/.test(hout.innerHTML), '健康建筑运行高分 → 三星，实际: ' + hout.textContent.trim());

// 7. 被动房全勾 → Classic
doc.querySelector('[data-toggle="passive"]').click();
doc.querySelectorAll('[data-calc="passive"] [data-ck]').forEach(cb=>{ cb.checked=true; });
doc.querySelector('[data-calc="passive"] [data-ck]').dispatchEvent(new window.Event('change', {bubbles:true}));
ok(/Premium/.test(doc.querySelector('[data-out="passive"]').innerHTML), '被动房全达标+可再生≥120 → Premium');

// 8. EDGE 只勾两项 → 未达标
doc.querySelector('[data-toggle="edge"]').click();
const ecks = doc.querySelectorAll('[data-calc="edge"] [data-ck]');
ecks[0].checked = true; ecks[1].checked = true;
ecks[0].dispatchEvent(new window.Event('change', {bubbles:true}));
ok(/尚未达标|三项须同时/.test(doc.querySelector('[data-out="edge"]').innerHTML), 'EDGE 两项 → 未达标');

// 9. NABERS 滑杆
const slider = doc.querySelector('[data-slider="nabers"]');
slider.value = 6; slider.dispatchEvent(new window.Event('input', {bubbles:true}));
ok(/市场领先/.test(doc.querySelector('[data-out="nabers"]').innerHTML), 'NABERS 6星 → 市场领先');

// 10. 搜索
const sb = doc.querySelector('#searchBox');
sb.value = '被动'; sb.dispatchEvent(new window.Event('input', {bubbles:true}));
ok(doc.querySelectorAll('.cert').length < 19 && /被动房/.test(doc.querySelector('#main').textContent), '搜索过滤');
sb.value = ''; sb.dispatchEvent(new window.Event('input', {bubbles:true}));

console.log(`\n结果: ${pass} 通过, ${fail} 失败`);
process.exit(fail ? 1 : 0);
