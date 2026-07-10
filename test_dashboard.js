const { JSDOM } = require('jsdom');
const fs = require('fs');
const DASH_DIR = process.env.DASH_DIR;
process.chdir(DASH_DIR);
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
const scripts = ['data/dashboard-data.js','data/occupation-descriptions.js','data/work-context-data.js','data/industry-data.js','data/wage-data.js','assets/app.js'];
for(const f of scripts){
  try { window.eval(fs.readFileSync(f, 'utf8')); }
  catch(e){ console.error('ERR loading', f, ':', e.message.slice(0,200)); }
}
setTimeout(() => {
  console.log('AI Benefit weights:', JSON.stringify(window.SCORE_WEIGHTS.aiBenefit));
  console.log('default _customSort:', JSON.stringify(window._customSort));
  if(typeof window.showView === 'function') window.showView('tbl');
  setTimeout(() => {
    const tb = document.getElementById('tb');
    const mainTh = document.getElementById('mainTh');
    const headRow = mainTh && mainTh.querySelector('tr');
    console.log('Head ths:', headRow ? headRow.children.length : 'n/a');
    const rows = tb ? tb.querySelectorAll('tr') : [];
    console.log('Body rows:', rows.length, 'cells/row:', rows[0] ? rows[0].children.length : 'n/a');
    if(rows.length>=3){
      console.log('Top 3 by default sort:');
      [0,1,2].forEach(i => {
        const id = rows[i].getAttribute('data-id');
        console.log('  ', id, 'benefit=', window.getAiBenefit(id).toFixed(3));
      });
    }
    let benTh = null;
    for(let i=0;i<headRow.children.length;i++){
      if(headRow.children[i].dataset && headRow.children[i].dataset.aiCustomCol === 'benefit') benTh = headRow.children[i];
    }
    if(benTh){
      console.log('--- Click AI Benefit (toggle to asc) ---');
      const t0 = Date.now();
      benTh.click();
      setTimeout(() => {
        console.log('  click took', Date.now()-t0, 'ms');
        console.log('  _customSort after:', JSON.stringify(window._customSort));
        const rows2 = tb.querySelectorAll('tr');
        if(rows2.length>=3){
          [0,1,2].forEach(i => {
            const id = rows2[i].getAttribute('data-id');
            console.log('  row', i, ':', id, 'benefit=', window.getAiBenefit(id).toFixed(3));
          });
        }
        console.log('--- Click msort("s") (built-in Aug sort) ---');
        const t1 = Date.now();
        window.msort('s');
        setTimeout(() => {
          console.log('  msort took', Date.now()-t1, 'ms (incl async)');
          console.log('  _customSort after msort:', JSON.stringify(window._customSort));
          const rows3 = tb.querySelectorAll('tr');
          console.log('  rows after msort:', rows3.length, 'cells row 0:', rows3[0] ? rows3[0].children.length : 'n/a');
          if(rows3.length>=3){
            [0,1,2].forEach(i => {
              const id = rows3[i].getAttribute('data-id');
              console.log('  row', i, ':', id, 'aug z=', window.getAiAugZ(id).toFixed(3));
            });
          }
          console.log('=== test completed without freeze ===');
          process.exit(0);
        }, 200);
      }, 200);
    } else {
      console.log('no benTh found');
      process.exit(1);
    }
  }, 500);
}, 500);
