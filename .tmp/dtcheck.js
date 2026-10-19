const fs=require('fs'),{JSDOM}=require('jsdom');
const facts=JSON.parse(fs.readFileSync('data/facts.json','utf8'));
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{runScripts:'outside-only',url:'https://x.local/'});
const w=dom.window; w.IntersectionObserver=class{constructor(){}observe(){}};
const audit=JSON.parse(fs.readFileSync('data/audit.json','utf8'));
w.fetch=u=>Promise.resolve({ok:true,json:()=>Promise.resolve(String(u).includes('audit')?audit:facts)});
w.eval(fs.readFileSync('app.js','utf8'));
setTimeout(()=>{
  const d=w.document, card=d.querySelector('#cert-well');
  const dt=card.querySelector('.dt-sum'), groups=[...card.querySelectorAll('.dt')];
  console.log('细项块存在',!!dt,'分组数',groups.length,'特性行',card.querySelectorAll('.dt-tbl tr').length-1*groups.length);
  console.log('汇总行',[...dt.querySelectorAll('tr')].slice(1).map(r=>[...r.children].map(c=>c.textContent).join('|')).join('  ||  '));
  console.log('第一组标题',groups[0].querySelector('summary b').textContent,'|',groups[0].querySelector('.dt-m').textContent);
  console.log('首组前3行',[...groups[0].querySelectorAll('tr')].slice(1,4).map(r=>[...r.children].map(c=>c.textContent.trim()).join(' | ')).join('   ;   '));
  const c=w.__getCheck();
  console.log('L1',c.l1.filter(x=>x.ok).length+'/'+c.l1.length,'L2',c.l2.filter(x=>x.ok).length+'/'+c.l2.length);
  console.log('指标列示例',[...card.querySelectorAll('[data-pane=levels] table.tbl')][0].rows[1].textContent.replace(/\s+/g,' '));
},400);
