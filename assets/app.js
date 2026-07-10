(function(){
  if (!window.DASHBOARD_DATA) {
    console.error('Missing dashboard data. Make sure data/dashboard-data.js is loaded before assets/app.js.');
    return;
  }

  var OCC = window.DASHBOARD_DATA.OCC || [];
  var TSK = window.DASHBOARD_DATA.TSK || {};
  var LS = window.DASHBOARD_DATA.LS || [];
  var SOCM = window.DASHBOARD_DATA.SOCM || {};
  var INDUSTRY_ROWS = (window.DASHBOARD_DATA.INDUSTRY && window.DASHBOARD_DATA.INDUSTRY.occupationRows) || [];
  var OCC_PRIMARY_MAP = {};
  for (var ipi = 0; ipi < INDUSTRY_ROWS.length; ipi++) {
    var ir = INDUSTRY_ROWS[ipi] || {};
    var iid = String(ir.id || '');
    var ip = String(ir.primaryIndustry || 'Unspecified').trim() || 'Unspecified';
    if (iid && !OCC_PRIMARY_MAP[iid]) OCC_PRIMARY_MAP[iid] = ip;
    var ib = iid.split('.')[0];
    if (ib && !OCC_PRIMARY_MAP[ib]) OCC_PRIMARY_MAP[ib] = ip;
  }

var LSM={};for(var lsi=0;lsi<LS.length;lsi++)LSM[LS[lsi].id]=LS[lsi];

var SL={ch:"Chat"};
var CL={B:"Augmented",R:"At Risk",N:"Neutral"};
var src="ch",srt="custom",cat="all",qry="",mainPrimary="",dsrc="ch",curId="",tSort="sc",tSortDir=-1;
var mSort="benefit",mSortDir=-1;
var lsQry="",lsSort="c",lsSortDir=-1,lsCurId="",sumHoverId="";
var LSGL={all:"All",detailed:"Detailed",broad:"Broad",minor:"Minor",major:"Major",total:"Total"};

function pct(v){return(v*100).toFixed(1)+"%"}
function cls(v){return v>0?"p":v<0?"n":"z"}
function f2(v){return v.toFixed(2)}
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function fql(a){if(a<=0)return"N/A";if(a<=2)return"Yearly";if(a<=6)return"Quarterly";if(a<=18)return"Monthly";if(a<=40)return"Twice/mo";if(a<=80)return"Weekly";if(a<=180)return"Few/wk";if(a<=350)return"Daily";if(a<=600)return"Multi/day";if(a<=900)return"Several/day";return"Hourly+"}
function tip(label,desc){return'<span class="tip-wrap">'+label+'<span class="tip-box">'+desc+'</span></span>'}
function tipDown(label,desc){return'<span class="tip-wrap tip-down">'+label+'<span class="tip-box">'+desc+'</span></span>'}
function nil(v){return v===null||v===undefined||v===""}
function fmtNum(v,d){if(nil(v))return"—";if(typeof v==="number")return v.toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});return esc(String(v))}
function fmtScore(v){return nil(v)?"—":fmtNum(v,2)}
function fmtPct2(v){if(nil(v))return"—";if(typeof v==="number")return(v*100).toFixed(2)+"%";return esc(String(v))}
function fmtMoney0(v){if(nil(v))return"—";if(typeof v==="number")return"$"+Math.round(v).toLocaleString();return esc(String(v))}
function fmtInt(v){if(nil(v))return"—";if(typeof v==="number")return Math.round(v).toLocaleString();return esc(String(v))}
function fmtK(v){if(nil(v))return"—";if(typeof v==="number")return v.toLocaleString(undefined,{minimumFractionDigits:1,maximumFractionDigits:1});return esc(String(v))}
function grpBadge(g){return'<span class="grp-badge">'+(LSGL[g]||esc(String(g)))+'</span>'}
function pctArrow(v){return nil(v)?"":(v>0?" ↑":v<0?" ↓":"")}
function scoreHue(v){if(nil(v))return 0;var t=Math.max(0,Math.min(1,(Number(v)-1)/4));return Math.round(t*120)}
function scoreChip(v,lg){if(nil(v))return '<span class="score-chip na'+(lg?' lg':'')+'">—</span>';var h=scoreHue(v),bg='hsla('+h+',78%,55%,.12)',bd='hsla('+h+',78%,55%,.34)',tx='hsl('+h+',78%,64%)';return '<span class="score-chip'+(lg?' lg':'')+'" style="background:'+bg+';border-color:'+bd+';color:'+tx+'">'+fmtNum(v,2)+'</span>'}
function trimLabel(s,m){return !s?"":(s.length>m?s.slice(0,m-1)+'…':s)}
function baseSoc(id){return String(id).split('.')[0]}
var PRIMARY_CACHE={};
function primaryIndustryForId(id){var k=String(id||'');var c=PRIMARY_CACHE[k];if(c!==undefined)return c;c=OCC_PRIMARY_MAP[k]||OCC_PRIMARY_MAP[baseSoc(k)]||'Unspecified';PRIMARY_CACHE[k]=c;return c}
window.primaryIndustryForId=primaryIndustryForId
/* Debounce helper for search inputs: coalesces keystrokes so full table
   rebuilds happen once per pause instead of once per keypress. */
function debInput(fn,ms){var t=null;return function(){var s=this,a=arguments;if(t)clearTimeout(t);t=setTimeout(function(){t=null;fn.apply(s,a)},ms||90)}}
window.__debInput=debInput;
/* Lazy per-row search-string cache: build "name\nid\nindustry" once, reuse forever. */
function searchBlob(o){if(o._q===undefined)o._q=(String(o.n||o.occupation||'')+'\n'+String(o.id||'')+'\n'+String(primaryIndustryForId(o.id))).toLowerCase();return o._q}
window.__searchBlob=searchBlob;
var MAIN_PRIMARY_LIST=(function(){var seen={},out=[];for(var k in OCC_PRIMARY_MAP){if(!Object.prototype.hasOwnProperty.call(OCC_PRIMARY_MAP,k))continue;var p=String(OCC_PRIMARY_MAP[k]||'Unspecified').trim()||'Unspecified';if(!seen[p]){seen[p]=1;out.push(p)}}return out.sort(function(a,b){a=a.toLowerCase();b=b.toLowerCase();return a<b?-1:a>b?1:0})})();
function mainPrimaryOptionsHtml(selected){var h='<option value="">All primary industries</option>';for(var i=0;i<MAIN_PRIMARY_LIST.length;i++)h+='<option value="'+esc(MAIN_PRIMARY_LIST[i])+'"'+(MAIN_PRIMARY_LIST[i]===selected?' selected':'')+'>'+esc(MAIN_PRIMARY_LIST[i])+'</option>';return h}
function lsForOcc(id){return LSM[baseSoc(id)]||null}
function upperBound(arr,val){var lo=0,hi=arr.length;while(lo<hi){var mid=(lo+hi)>>1;if(arr[mid]<=val)lo=mid+1;else hi=mid}return lo}
function pctRankSorted(arr,val){if(!arr.length)return .5;if(arr.length===1)return 1;var idx=Math.max(0,upperBound(arr,val)-1);return idx/(arr.length-1)}
function fmtSigned2(v){if(nil(v))return '—';return (v>0?'+':'')+f2(v)}

function socKey(id){
  id=String(id||'');
  return SOCM[id]?id:(SOCM[baseSoc(id)]?baseSoc(id):'');
}
window.socInfo=function(id){
  var k=socKey(id);
  return k?SOCM[k]:null;
};
window.buildSocDescBox=function(id,label){
  var k=socKey(id),info=k?SOCM[k]:null,desc=info&&info[1]?info[1]:'',cap=label||'Job description';
  if(k&&String(id)!==k)cap+=' (base SOC '+k+')';
  else if(k)cap+=' ('+k+')';
  if(desc)return '<div class="soc-desc"><div class="soc-cap">'+esc(cap)+'</div><div class="soc-copy">'+esc(desc)+'</div></div>';
  return '<div class="soc-desc"><div class="soc-cap">'+esc(cap)+'</div><div class="soc-copy miss">BLS does not publish a narrative definition for this SOC level in the referenced workbook.</div></div>';
};



function tObj(t,sk){
  var o={tk:t[0],im:t[1],rl:t[2],fa:t[3],fw:t[4],hu:t[5],ai:t[6]};
  if(t[6]===1){var a=t[7];
    o.e=a[0];o.au=a[1];o.ag=a[2];o.sc=a[3];o.d=a[4];o.fb=a[5];o.ti=a[6];o.v=a[7];o.l=a[8];o.u=a[9];
  }else{o.e=0;o.au=0;o.ag=0;o.sc=0;o.d=0;o.fb=0;o.ti=0;o.v=0;o.l=0;o.u=0;}
  return o
}

function stats(){
  var b=0,r=0,n=0;
  for(var i=0;i<OCC.length;i++){var c=OCC[i][src].ct;if(c==="B")b++;else if(c==="R")r++;else n++}
  document.getElementById("sts").innerHTML='<div class="st"><div class="d g"></div><b>'+b+'</b><span>Augmented</span></div><div class="st"><div class="d r"></div><b>'+r+'</b><span>At Risk</span></div><div class="st"><div class="d y"></div><b>'+n+'</b><span>Neutral</span></div>'
}

/* Main table columns config */
var mainCols=[
  {k:"n",  l:"Occupation",          t:"O*NET occupation title. Click any row for detailed task breakdown.",s:"min-width:240px"},
  {k:"primaryIndustry",l:"Primary Industry",t:"Higher-level industry grouping used for filtering in the investment tabs.",s:"min-width:180px"},
  {k:"benefit",l:"AI Benefit Score (Z Score)",t:"Weighted average of Augmentation Z and Differentiation Z, with differentiation gated so it only boosts when both signals are positive. Click to sort.", main:true},
  {k:"s",  l:"Augmentation Score (Z Score)", t:"Z-score of the occupation's Augmentation Score across all plotted occupations."},
  {k:"diff",l:"Differentiation (Z Score)",  t:"Z-score of (P90 wage − P10 wage) / median wage. Higher = more wage dispersion within the occupation. Click to sort."},
  {k:"ct", l:"Category",            t:"Augmented (positive score), At Risk (negative), or Neutral (zero/below threshold)."},
  {k:"ai", l:"AI Tasks",            t:"Tasks with a non-zero displayed AI score / total O*NET tasks."},
  {k:"cv", l:"Coverage",            t:"% of occupation tasks with a non-zero displayed AI score."},
  {k:"au", l:"Avg Automation",      t:"Mean automation share (Directive + Feedback Loop) across tasks with a non-zero displayed AI score."},
  {k:"ag", l:"Avg Augmentation",    t:"Mean augmentation share (Task Iteration + Validation + Learning) across tasks with a non-zero displayed AI score."}
];
/* Signals downstream patches that render() already emits the AI Benefit and
   Differentiation columns, so the MutationObserver re-injection pass is skipped. */
window._mainHasBenefitCols=true;

function renderMainTh(){
  var h="";
  for(var i=0;i<mainCols.length;i++){
    var c=mainCols[i];
    var isSorted=c.k===mSort;
    var arrow=isSorted?(mSortDir===1?" &#9650;":" &#9660;"):" &#8597;";
    h+='<th'+(c.s?' style="'+c.s+'"':'')+' class="'+(isSorted?"sorted ":"")+(c.main?'primary-col-head':'')+'" onclick="msort(\''+c.k+'\')">';
    h+=tipDown(c.l+'<span class="sa">'+arrow+'</span>',c.t);
    h+='</th>';
  }
  document.getElementById("mainTh").querySelector("tr").innerHTML=h;
}

window.msort=function(col){
  if(mSort===col){mSortDir*=-1}else{mSort=col;mSortDir=(col==="n"||col==="primaryIndustry")?1:-1}
  srt="custom";
  var ps=document.querySelectorAll("#srtP .pl");for(var i=0;i<ps.length;i++)ps[i].classList.remove("on");
  render();
renderLS();
};

function render(){
  var _vt=document.getElementById("vTbl"); if(_vt&&_vt.style.display==="none") return;
  renderMainTh();
  var gB=window.getAiBenefit,gZ=window.getAiAugZ,gD=window.getDifferentiationZ;
  var hasZ=typeof gB==="function"&&typeof gZ==="function"&&typeof gD==="function";
  var hasWage=!!(window.DASHBOARD_DATA&&window.DASHBOARD_DATA.WAGE);
  var list=OCC.slice();
  if(qry){var q=qry.toLowerCase();list=list.filter(function(o){return searchBlob(o).indexOf(q)>=0})}
  if(mainPrimary)list=list.filter(function(o){return primaryIndustryForId(o.id)===mainPrimary});
  if(cat!=="all")list=list.filter(function(o){return o[src].ct===cat});
  if(srt==="aug"){list.sort(function(a,b){return b[src].s-a[src].s})}
  else if(srt==="risk"){list.sort(function(a,b){return a[src].s-b[src].s})}
  else if(srt==="az"){list.sort(function(a,b){return a.n.localeCompare(b.n)})}
  else{
    var sk=mSort,dir=mSortDir;
    list.sort(function(a,b){
      var va,vb;
      if(sk==="n"){va=a.n.toLowerCase();vb=b.n.toLowerCase();return dir*(va<vb?-1:va>vb?1:0)}
      else if(sk==="primaryIndustry"){va=primaryIndustryForId(a.id).toLowerCase();vb=primaryIndustryForId(b.id).toLowerCase();return dir*(va<vb?-1:va>vb?1:0)}
      else if(sk==="ct"){va=a[src].ct;vb=b[src].ct;return dir*(va<vb?-1:va>vb?1:0)}
      else if(sk==="ai"){va=a[src].ai;vb=b[src].ai;return dir*(va-vb)}
      else if(sk==="benefit"){va=hasZ?gB(a.id):0;vb=hasZ?gB(b.id):0;return dir*(va-vb)}
      else if(sk==="diff"){va=hasZ?gD(a.id):0;vb=hasZ?gD(b.id):0;return dir*(va-vb)}
      else{va=a[src][sk];vb=b[src][sk];return dir*(va-vb)}
    });
  }
  document.getElementById("cnt").textContent=list.length+" occupations";
  function signed(v){var n=isFinite(v)?Number(v):0;return {c:n>0?"p":n<0?"n":"z",t:(n>0?"+":"")+n.toFixed(2)}}
  var h="";
  for(var i=0;i<list.length;i++){var o=list[i],d=o[src];
    var ben=signed(hasZ?gB(o.id):0),az=signed(hasZ?gZ(o.id):0),df=signed(hasZ?gD(o.id):0);
    h+='<tr data-id="'+o.id+'" class="clickable-row" title="Click for drill-down"><td class="tn">'+esc(o.n)+'</td><td>'+esc(primaryIndustryForId(o.id))+'</td>'
      +'<td class="m primary-col-cell '+ben.c+'" style="font-weight:700">'+ben.t+'</td>'
      +'<td><div class="m '+az.c+'" style="font-weight:700">'+az.t+'</div><div class="subcd" style="color:var(--t4);margin-top:1px">raw: '+f2(d.s)+'</div></td>'
      +'<td class="m '+df.c+'">'+(hasWage?df.t:'<span style="color:var(--t4)">—</span>')+'</td>'
      +'<td><span class="bg '+d.ct+'">'+CL[d.ct]+'</span></td><td class="m">'+d.ai+' <span style="color:var(--t4)">/</span> '+o.t+'</td><td class="m">'+pct(d.cv)+'</td><td class="m n">'+pct(d.au)+'</td><td class="m p">'+pct(d.ag)+'</td></tr>'}
  document.getElementById("tb").innerHTML=h;stats()
}

/* Detail panel */
function sortTasks(tasks,sk,col,dir){
  var parsed=[];for(var i=0;i<tasks.length;i++)parsed.push(tObj(tasks[i],sk));
  parsed.sort(function(a,b){var va,vb;
    if(col==="tk"){va=a.tk.toLowerCase();vb=b.tk.toLowerCase();return dir*(va<vb?-1:va>vb?1:0)}
    va=a[col];vb=b[col];return dir*(va-vb)});
  return parsed
}

function buildTaskTable(id,sk,sortCol,sortDir){
  var raw=TSK[id]||[];
  if(!raw.length)return'<div class="sct" style="color:var(--t4);margin-top:12px">No task data.</div>';
  var tasks=sortTasks(raw,sk,sortCol,sortDir,id);
  var aiCount=0,scoreEligibleCount=0;for(var i=0;i<tasks.length;i++){if(tasks[i].ai)aiCount++;if(isScoreEligibleAiTask(tasks[i]))scoreEligibleCount++;}
  var h='<div class="sct">All Tasks ('+tasks.length+' total, '+scoreEligibleCount+' score-eligible AI tasks, '+aiCount+' with any AI data)</div>';
  h+='<div class="scs">Interaction values show % of total interactions per task. Freq Wt% = share of this occupation\'s total frequency weight. Click column headers to sort.</div>';
  h+='<div style="background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);padding:10px 14px;margin-bottom:14px;font-size:.76rem;color:var(--t3);line-height:1.5"><span style="color:var(--amb);font-weight:600">[human]</span> = Task requires physical presence or face-to-face interaction (e.g. examining patients, classroom teaching, operating machinery). These tasks are excluded from AI scoring even if AI interaction data exists, because the task itself cannot be performed by AI.</div>';
  h+='<div style="overflow-x:auto;border:1px solid var(--b1);border-radius:var(--r)"><table class="tt"><thead>';
  h+='<tr><th colspan="5" style="border-right:1px solid var(--b2)">Task Details</th>';
  h+='<th colspan="2" style="border-right:1px solid var(--b2)">Scores</th>';
  h+='<th colspan="3" class="cg-auto" style="border-right:1px solid var(--b2);text-align:center">Automation (Dir + FB)</th>';
  h+='<th colspan="4" class="cg-aug" style="border-right:1px solid var(--b2);text-align:center">Augmentation (TI + Val + Lrn)</th>';
  h+='<th>Other</th></tr><tr>';
  var cols=[
    ["tk","Task","O*NET task description.",""],
    ["im","Imp","Importance (1-5).",""],
    ["rl","Rel","Relevance (0-100).",""],
    ["fa","Freq","How often performed.",""],
    ["fw","FW%","Share of occupation frequency weight.|border-right:1px solid var(--b2)"],
    ["sc","Score","Task score for chat data.|"],
    ["au","A/A%","Visual: red=automation, green=augmentation.|border-right:1px solid var(--b2)"],
    ["d","Dir%","Directive: human delegates complete task execution to AI with minimal interaction. Counted as automation.|cg-auto"],
    ["fb","FB%","Feedback Loop: human and AI engage in iterative dialogue to complete the task, with the human mainly providing feedback from the environment. Counted as automation.|cg-auto"],
    ["au","Tot%","Total automation share (Directive + Feedback Loop).|cg-auto|border-right:1px solid var(--b2)"],
    ["ti","TI%","Task Iteration: human and AI engage in iterative dialogue to complete a task, with the human refining the AI outputs. Counted as augmentation.|cg-aug"],
    ["v","Val%","Validation: human uses AI to check or validate their own work. Counted as augmentation.|cg-aug"],
    ["l","Lrn%","Learning: human seeks understanding and explanation rather than direct task completion. Counted as augmentation.|cg-aug"],
    ["ta","Tot Aug%","Total augmentation (TI+Val+Lrn).|cg-aug|border-right:1px solid var(--b2)"],
    ["u","Unc%","Unclassified %."]
  ];
  for(var i=0;i<cols.length;i++){
    var c=cols[i],parts=c[2].split("|"),desc=parts[0],extra="",cls2="";
    for(var p=1;p<parts.length;p++){if(parts[p].indexOf("cg-")===0)cls2=" "+parts[p];else extra+=parts[p]+";"}
    var isSorted=c[0]===sortCol;
    var arrow=isSorted?(sortDir===1?" &#9650;":" &#9660;"):" &#8597;";
    h+='<th class="'+(isSorted?"sorted":"")+cls2+'" style="cursor:pointer;'+(extra||"")+'" onclick="tsort(\''+c[0]+'\')">';
    h+=tip(c[1]+'<span class="sa">'+arrow+'</span>',desc);
    h+='</th>'
  }
  h+='</tr></thead><tbody>';
  for(var j=0;j<tasks.length;j++){
    var t=tasks[j],isAI=t.ai===1,rc=isAI?"":"no-ai-row",hfl=t.hu?'<span class="hf">[human]</span>':'';
    h+='<tr class="'+rc+'"><td class="tx">'+esc(t.tk)+hfl+'</td>';
    h+='<td class="m">'+t.im+'</td><td class="m">'+t.rl+'</td>';
    h+='<td class="fl">'+fql(t.fa)+'</td>';
    h+='<td class="m" style="border-right:1px solid var(--b2)">'+t.fw+'%</td>';
    if(isAI){
      h+='<td class="m '+cls(t.sc)+'">'+t.sc.toFixed(1)+'</td>';
      h+='<td style="border-right:1px solid var(--b2)"><div style="display:flex;height:7px;border-radius:4px;overflow:hidden;min-width:50px"><div style="width:'+pct(t.au)+';background:var(--red)"></div><div style="width:'+pct(t.ag)+';background:var(--grn)"></div></div></td>';
      h+='<td class="m n">'+t.d+'%</td><td class="m n">'+t.fb+'%</td>';
      h+='<td class="m n" style="border-right:1px solid var(--b2);font-weight:600">'+pct(t.au)+'</td>';
      h+='<td class="m p">'+t.ti+'%</td><td class="m p">'+t.v+'%</td>';
      h+='<td class="m p">'+t.l+'%</td>';
      var totAug = (Number(t.ti)||0) + (Number(t.v)||0) + (Number(t.l)||0);
      h+='<td class="m p" style="border-right:1px solid var(--b2);font-weight:600">'+totAug.toFixed(1)+'%</td>';
      h+='<td class="m z">'+t.u+'%</td>'
    }else{h+='<td class="m z" colspan="10" style="text-align:center;font-style:italic">No AI interaction data</td>'}
    h+='</tr>'
  }
  h+='</tbody></table></div>';return h
}

function buildDetail(id){
  var o=null;for(var i=0;i<OCC.length;i++){if(OCC[i].id===id){o=OCC[i];break}}
  if(!o)return"";curId=id;
  var s=dsrc,d=o[s];
  var h='<button class="x" id="xb">&times;</button>';
  h+='<div class="dt">'+esc(o.n)+'</div>';
  h+='<div class="dc">'+o.id+' &middot; '+o.t+' total tasks</div>';
  h+='<div class="dw"><span>Data source:</span><span class="grp-badge">AI usage data</span></div>';
  h+='<div class="sc-row">';
  h+='<div class="sc-box" style="flex:0 1 170px;min-width:150px"><div class="lb">Score ('+SL[s]+')</div><div class="vl '+cls(d.s)+'">'+f2(d.s)+'</div><div class="mt"><span class="bg '+d.ct+'" style="font-size:.6rem;padding:1px 7px">'+CL[d.ct]+'</span></div></div>';
  h+='<div class="sc-box" style="flex:2;min-width:330px"><div class="lb">How the Score Is Built</div>'
    +'<div class="fx-row">'
    +'<span class="fx-sum">&Sigma;<span class="fx-sub">tasks</span></span>'
    +'<span class="fx-par">(</span>'
    +tipDown('<span class="fx-chip fx-aug">Aug %</span>','Share of the task\'s AI interactions that assist the worker: Task Iteration + Validation + Learning.')
    +'<span class="fx-op">&minus;</span>'
    +tipDown('<span class="fx-chip fx-auto">Auto %</span>','Share of the task\'s AI interactions that do the task outright: Directive + Feedback Loop.')
    +'<span class="fx-par">)</span>'
    +'<span class="fx-op">&times;</span>'
    +tipDown('<span class="fx-chip">Importance</span>','O*NET task importance (1&ndash;5), rescaled so trivial tasks count for less.')
    +'<span class="fx-op">&times;</span>'
    +tipDown('<span class="fx-chip">Freq Wt%</span>','The task\'s share of how often this occupation\'s work actually happens.')
    +'</div>'
    +'<div class="mt">Each task\'s augmentation-vs-automation balance, weighted by how important and how frequent the task is, summed across eligible AI tasks. Hover each piece for detail.</div></div>';
  var detailTasks=sortTasks(TSK[id]||[],s,tSort,tSortDir,id),eligibleAiCount=0;
    for(var k=0;k<detailTasks.length;k++){if(isScoreEligibleAiTask(detailTasks[k]))eligibleAiCount++}
    var eligibleCoverage=o.t?eligibleAiCount/o.t:0;
    h+='<div class="sc-box" style="flex:0 1 150px;min-width:125px"><div class="lb">AI Coverage</div><div class="vl" style="font-size:1.3rem">'+eligibleAiCount+' <span style="font-size:.85rem;color:var(--t3)">/ '+o.t+'</span></div><div class="mt">'+pct(eligibleCoverage)+' coverage</div></div>';
  h+='<div class="sc-box"><div class="lb">Automation vs Augmentation</div><div style="margin-top:8px"><div class="br"><div class="bl">Auto</div><div class="bt"><div class="bfa" style="width:'+pct(d.au)+'"></div></div><div class="bv n">'+pct(d.au)+'</div></div><div class="br"><div class="bl">Aug</div><div class="bt"><div class="bfg" style="width:'+pct(d.ag)+'"></div></div><div class="bv p">'+pct(d.ag)+'</div></div></div></div>';
  h+='</div>';
  if((eligibleAiCount<=1) || (eligibleCoverage<0.10)) h+='<div class="inline-note">Note: an occupation\'s AI score is set to 0 when it has only one AI-exposed task, or when fewer than 10% of its tasks show AI usage — too little evidence to score it reliably. This occupation has '+eligibleAiCount+' AI-exposed task'+(eligibleAiCount===1?'':'s')+' across '+o.t+' tasks ('+pct(eligibleCoverage)+' coverage), so its AI score is shown as 0 even if that task leans toward augmentation.</div>';
  h+='<div id="ta">'+buildTaskTable(id,dsrc,tSort,tSortDir)+'</div>';
  h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
  return h
}

function detail(id){dsrc=src;tSort="sc";tSortDir=-1;document.getElementById("pnl").innerHTML=buildDetail(id);document.getElementById("ov").classList.add("open");document.body.style.overflow="hidden";document.getElementById("xb").onclick=cld}
window.detail=detail;
window.ssrc=function(ns){dsrc="ch";tSort="sc";tSortDir=-1;document.getElementById("pnl").innerHTML=buildDetail(curId);document.getElementById("xb").onclick=cld};
window.tsort=function(col){if(tSort===col){tSortDir*=-1}else{tSort=col;tSortDir=-1}document.getElementById("ta").innerHTML=buildTaskTable(curId,dsrc,tSort,tSortDir)};
function cld(){document.getElementById("ov").classList.remove("open");document.body.style.overflow=""}


var lsCols=[
  {k:"n",l:"Occupation",t:"BLS/SOC occupation title. Click any row for score and history details.",s:"min-width:320px"},
  {k:"c",l:"Composite",t:"Equal-weight average of projected employment, wage, and actual employment scores when all three are available."},
  {k:"ps",l:"Proj Emp Score",t:"1–5 score derived from the occupation’s 2024–2034 projected employment CAGR percentile rank."},
  {k:"ws",l:"Wage Score",t:"1–5 score derived from the occupation’s actual wage CAGR percentile rank."},
  {k:"es",l:"Act Emp Score",t:"1–5 score derived from the occupation’s actual employment CAGR percentile rank."},
  {k:"g",l:"Group",t:"SOC aggregation level from the workbook: detailed, broad, minor, major, or total."}
];

function lsCompare(a,b,key,dir){
  var va=a[key],vb=b[key],an=nil(va),bn=nil(vb);
  if(key==="n"||key==="g"){
    if(an&&bn)return 0;if(an)return 1;if(bn)return -1;
    va=String(va).toLowerCase();vb=String(vb).toLowerCase();
    return dir*(va<vb?-1:va>vb?1:0);
  }
  if(an&&bn)return 0;
  if(an)return 1;
  if(bn)return -1;
  return dir*(va-vb);
}

function renderLsTh(){
  var h="";
  for(var i=0;i<lsCols.length;i++){
    var c=lsCols[i],isSorted=c.k===lsSort;
    var arrow=isSorted?(lsSortDir===1?" &#9650;":" &#9660;"):" &#8597;";
    h+='<th'+(c.s?' style="'+c.s+'"':'')+' class="'+(isSorted?"sorted":"")+'" onclick="lssort(\''+c.k+'\')">';
    h+=tipDown(c.l+'<span class="sa">'+arrow+'</span>',c.t);
    h+='</th>';
  }
  document.getElementById("lsTh").querySelector("tr").innerHTML=h;
}

function renderLS(){
  /* The labor-shortage table was removed from the page; without this guard every
     msort() header click threw here and aborted the rest of the handler. */
  if(!document.getElementById("lsTh")||!document.getElementById("lsTb"))return;
  renderLsTh();
  var list=LS.slice();
  if(lsQry){
    var q=lsQry.toLowerCase();
    list=list.filter(function(o){return o.n.toLowerCase().indexOf(q)>=0||o.id.toLowerCase().indexOf(q)>=0});
  }
  list.sort(function(a,b){return lsCompare(a,b,lsSort,lsSortDir)});
  document.getElementById("lsCnt").textContent=list.length.toLocaleString()+" occupations";
  var h="";
  for(var j=0;j<list.length;j++){
    var o=list[j];
    h+='<tr data-id="'+o.id+'">';
    h+='<td><div class="tn">'+esc(o.n)+'</div></td>';
    h+='<td>'+scoreChip(o.c)+'</td>';
    h+='<td>'+scoreChip(o.ps)+'</td>';
    h+='<td>'+scoreChip(o.ws)+'</td>';
    h+='<td>'+scoreChip(o.es)+'</td>';
    h+='<td>'+grpBadge(o.g)+'</td>';
    h+='</tr>';
  }
  document.getElementById("lsTb").innerHTML=h;
}

function lsMetricRow(label,val){return '<div class="k">'+label+'</div><div class="v">'+val+'</div>'}

function buildLSDetail(id){
  var o=LSM[id];
  if(!o)return"";
  lsCurId=id;
  var h='<button class="x" id="xb">&times;</button>';
  h+='<div class="dt">'+esc(o.n)+'</div>';
  h+='<div class="dc">'+o.id+' &middot; '+(LSGL[o.g]||o.g)+'</div>';
  h+='<div class="sc-row">';
  h+='<div class="sc-box"><div class="lb">Composite Score</div><div class="vl">'+scoreChip(o.c,true)+'</div><div class="mt">Equal-weight average of available pillars</div></div>';
  h+='<div class="sc-box"><div class="lb">Projected Employment Score</div><div class="vl">'+scoreChip(o.ps,true)+'</div><div class="mt">From 2024–2034 projected employment CAGR</div></div>';
  h+='<div class="sc-box"><div class="lb">Wage Score</div><div class="vl">'+scoreChip(o.ws,true)+'</div><div class="mt">From actual wage CAGR</div></div>';
  h+='<div class="sc-box"><div class="lb">Actual Employment Score</div><div class="vl">'+scoreChip(o.es,true)+'</div><div class="mt">From actual employment CAGR</div></div>';
  h+='</div>';
  h+='<div class="sc-row">';
  h+='<div class="sc-box"><div class="lb">Projected Employment CAGR</div><div class="vl '+cls(nil(o.pc)?0:o.pc)+'">'+fmtPct2(o.pc)+'</div><div class="mt">2024–2034 BLS projection</div></div>';
  h+='<div class="sc-box"><div class="lb">Wage CAGR Used</div><div class="vl '+cls(nil(o.wc)?0:o.wc)+'">'+fmtPct2(o.wc)+'</div><div class="mt">Window: '+(o.wb?o.wb.replace(/-/g,'–'):'N/A')+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Actual Employment CAGR Used</div><div class="vl '+cls(nil(o.ec)?0:o.ec)+'">'+fmtPct2(o.ec)+'</div><div class="mt">Window: '+(o.eb?o.eb.replace(/-/g,'–'):'N/A')+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Score Coverage</div><div class="vl" style="font-size:1.05rem;line-height:1.45;font-family:inherit">'+grpBadge(o.g)+'</div><div class="mt">Workbook SOC level for this row</div></div>';
  h+='</div>';
  if(nil(o.ps))h+='<div class="inline-note">Projected employment fields are blank for this occupation code in the workbook’s projection match, so the projected employment score and composite score are also blank.</div>';
  h+='<div class="sct">Actual Wage and Employment History</div>';
  h+='<div class="scs">These are the 2019–2024 values carried into the dashboard from the workbook. The wage score uses the annual wage series; the actual employment score uses the employment series.</div>';
  h+='<div style="overflow-x:auto;border:1px solid var(--b1);border-radius:var(--r);margin-bottom:16px"><table class="tt"><thead><tr><th>Year</th><th>Mean Annual Wage</th><th>Employment</th></tr></thead><tbody>';
  for(var yr=2019;yr<=2024;yr++){
    var idx=yr-2019;
    h+='<tr><td class="m">'+yr+'</td><td class="m">'+fmtMoney0(o.wa[idx])+'</td><td class="m">'+fmtInt(o.em[idx])+'</td></tr>';
  }
  h+='</tbody></table></div>';
  h+='<div class="sct">Projected Employment CAGR</div>';
  h+='<div class="scs">This drill-down now shows only the projected employment CAGR from the workbook’s BLS Employment Projections source.</div>';
  h+='<div class="kv">';
  h+=lsMetricRow('Projected employment CAGR, 2024–2034',fmtPct2(o.pc));
  h+='</div>';
  h+='<div class="inline-note">The workbook keeps only the fields needed here. Any special BLS markers in the history series (for example, <span class="m">*</span> or <span class="m">**</span>) are carried through unchanged rather than inferred.</div>';
  h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
  return h;
}

function lsDetail(id){document.getElementById("pnl").innerHTML=buildLSDetail(id);document.getElementById("ov").classList.add("open");document.body.style.overflow="hidden";document.getElementById("xb").onclick=cld}
window.lssort=function(col){if(lsSort===col){lsSortDir*=-1}else{lsSort=col;lsSortDir=(col==="n"||col==="g")?1:-1}renderLS()};

function syncSourceButtons(){
  var groups=["srcP","sumSrcP"];
  for(var gi=0;gi<groups.length;gi++){
    var el=document.getElementById(groups[gi]);
    if(!el)continue;
    var bs=el.querySelectorAll('.pl');
    for(var bi=0;bi<bs.length;bi++)bs[bi].classList.toggle('on',bs[bi].getAttribute('data-s')===src);
  }
}

function setSource(ns){src="ch";syncSourceButtons();render();renderSummary()}

function buildSummaryData(){
  var pts=[];
  for(var i=0;i<OCC.length;i++){
    var o=OCC[i],l=lsForOcc(o.id);
    if(!l||nil(l.c))continue;
    var d=o[src];
    if(!d||nil(d.s))continue;
    pts.push({id:o.id,n:o.n,base:baseSoc(o.id),x:d.s,y:l.c,auto:d.au,aug:d.ag,cat:d.ct,lab:l});
  }
  var xs=[],ys=[];
  for(var j=0;j<pts.length;j++){xs.push(pts[j].x);ys.push(pts[j].y)}
  xs.sort(function(a,b){return a-b});
  ys.sort(function(a,b){return a-b});
  for(var k=0;k<pts.length;k++){
    pts[k].xp=pctRankSorted(xs,pts[k].x);
    pts[k].yp=pctRankSorted(ys,pts[k].y);
    pts[k].benefit=pts[k].x>0?(pts[k].xp+pts[k].yp):-999;
    pts[k].suffer=pts[k].x<0?((1-pts[k].xp)+(1-pts[k].yp)):-999;
  }
  var benefit=pts.filter(function(p){return p.x>0}).slice().sort(function(a,b){return b.benefit-a.benefit||b.x-a.x||b.y-a.y}).slice(0,20);
  var suffer=pts.filter(function(p){return p.x<0}).slice().sort(function(a,b){return b.suffer-a.suffer||a.x-b.x||a.y-b.y}).slice(0,20);
  var marks={};
  for(var bi=0;bi<benefit.length;bi++)marks[benefit[bi].id]={kind:'benefit',rank:bi+1};
  for(var si=0;si<suffer.length;si++)marks[suffer[si].id]={kind:'suffer',rank:si+1};
  return {points:pts,benefit:benefit,suffer:suffer,marks:marks};
}

function makeSummaryList(arr,kind){
  function headCell(label,tip,extraCls){
    return '<div class="cell'+(extraCls?' '+extraCls:'')+'" title="'+esc(tip)+'"><span class="tip-label">'+esc(label)+'</span></div>';
  }
  var sumTip=kind==='benefit'
    ? 'AI percentile plus labor shortage percentile. Higher values indicate occupations that rank more strongly on both AI upside and labor shortage pressure.'
    : 'AI percentile plus labor shortage percentile. Lower values indicate occupations with more downside exposure; this table is ordered from the lowest combined percentiles upward.';
  var h='<div class="sum-list-head">'+
    headCell('#','Rank within this top-20 list.')+
    headCell('Occupation','Occupation title from O*NET.')+
    headCell('AI augmentation vs. automation score','Net AI score for the occupation. Positive values suggest more augmentation upside; negative values suggest more automation exposure.','num')+
    headCell('AI percentile','Percentile rank of the occupation\'s AI augmentation vs. automation score across plotted occupations.','num')+
    headCell('Labor shortage score','Composite labor shortage score for the occupation. Higher values indicate tighter labor market pressure.','num')+
    headCell('Labor percentile','Percentile rank of the occupation\'s labor shortage score across plotted occupations.','num')+
    headCell('Sum of percentiles',sumTip,'num')+
  '</div>';
  for(var i=0;i<arr.length;i++){
    var p=arr[i],sumVal=p.xp+p.yp,sumCls=kind==='benefit'?'p':'n',aiCls=p.x>0?'p':p.x<0?'n':'z';
    h+='<div class="sum-item" data-id="'+p.id+'">'+
      '<div class="cell rk">'+(i+1)+'</div>'+
      '<div class="cell nm">'+esc(p.n)+'</div>'+
      '<div class="cell num m '+aiCls+'">'+fmtSigned2(p.x)+'</div>'+
      '<div class="cell num m pctv">'+pct(p.xp)+'</div>'+
      '<div class="cell num">'+scoreChip(p.y)+'</div>'+
      '<div class="cell num m pctv">'+pct(p.yp)+'</div>'+
      '<div class="cell num m sumv '+sumCls+'">'+f2(sumVal)+'</div>'+
    '</div>';
  }
  return h;
}

function showSumTip(ev,p){
  var tip=document.getElementById('sumTip'),card=document.getElementById('quadCard');
  if(!tip||!card)return;
  tip.innerHTML='<b>'+esc(p.n)+'</b><br><span style="font-family:IBM Plex Mono,monospace;color:var(--t4)">'+p.id+' &middot; SOC '+p.base+'</span><br>AI score: <span class="'+(p.x>0?'p':p.x<0?'n':'z')+'">'+fmtSigned2(p.x)+'</span><br>Labor shortage composite: '+fmtNum(p.y,2)+'<br>Automation: '+pct(p.auto)+' &middot; Augmentation: '+pct(p.aug)+'<br>Click to open the AI task drill-down';
  tip.style.display='block';
  var rect=card.getBoundingClientRect();
  var x=ev.clientX-rect.left+14,y=ev.clientY-rect.top+14;
  x=Math.min(x,rect.width-330); y=Math.min(y,rect.height-120);
  if(x<10)x=10; if(y<10)y=10;
  tip.style.left=x+'px'; tip.style.top=y+'px';
}
function hideSumTip(){var tip=document.getElementById('sumTip');if(tip)tip.style.display='none'}

function renderSummary(){
  var svg=document.getElementById('quadSvg');
  if(!svg)return;
  syncSourceButtons();
  var data=buildSummaryData();
  document.getElementById('sumNote').textContent=data.points.length.toLocaleString()+' occupations are plotted because they have both an AI score for '+SL[src]+' and a composite labor shortage score. Labels are shown for the 20 strongest AI tailwinds and the 20 strongest AI headwinds, ranked by combined percentile across the two axes.';
  document.getElementById('sumBenefit').innerHTML=makeSummaryList(data.benefit,'benefit');
  document.getElementById('sumSuffer').innerHTML=makeSummaryList(data.suffer,'suffer');
  var W=1200,H=620,L=260,R=940,T=34,B=542,PW=R-L,PH=B-T;
  var absRaw=1;
  for(var i=0;i<data.points.length;i++)absRaw=Math.max(absRaw,Math.abs(data.points[i].x));
  var absX=Math.ceil(absRaw*1.1);
  if(absX<5)absX=5;
  var xMin=-absX,xMax=absX,yMin=1,yMax=5;
  function xScale(v){return L+(v-xMin)/(xMax-xMin)*PW}
  function yScale(v){return T+(yMax-v)/(yMax-yMin)*PH}
  var x0=xScale(0),y3=yScale(3);
  function axisLabel(v){var av=Math.abs(v);var s=av>=10?String(Math.round(v)):String(Math.round(v*10)/10);return s.replace(/\.0$/,'')}
  function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function place(items,top,bottom,gap){items=items.slice().sort(function(a,b){return a.cy-b.cy});for(var i=0;i<items.length;i++)items[i].ly=Math.max(top,Math.min(bottom,items[i].cy));for(var j=1;j<items.length;j++)if(items[j].ly<items[j-1].ly+gap)items[j].ly=items[j-1].ly+gap;if(items.length&&items[items.length-1].ly>bottom){items[items.length-1].ly=bottom;for(var k=items.length-2;k>=0;k--)if(items[k].ly>items[k+1].ly-gap)items[k].ly=items[k+1].ly-gap;if(items[0].ly<top){items[0].ly=top;for(var m=1;m<items.length;m++)if(items[m].ly<items[m-1].ly+gap)items[m].ly=items[m-1].ly+gap;}}return items}
  function labelSpec(p,kind){var txt=trimLabel(p.n,26),est=txt.length*5.2,x,anchor;if(kind==='benefit'){x=p.cx+8;anchor='start';if(x+est>R-4){x=p.cx-8;anchor='end'}}else{x=p.cx-8;anchor='end';if(x-est<L+4){x=p.cx+8;anchor='start'}}return {text:txt,x:x,anchor:anchor}}
    var h='';
    h+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="transparent"/>';
    h+='<rect x="'+L+'" y="'+T+'" width="'+(x0-L)+'" height="'+(y3-T)+'" fill="rgba(251,191,36,.04)"/>';
    h+='<rect x="'+x0+'" y="'+T+'" width="'+(R-x0)+'" height="'+(y3-T)+'" fill="rgba(52,211,153,.05)"/>';
    h+='<rect x="'+L+'" y="'+y3+'" width="'+(x0-L)+'" height="'+(B-y3)+'" fill="rgba(248,113,113,.05)"/>';
    h+='<rect x="'+x0+'" y="'+y3+'" width="'+(R-x0)+'" height="'+(B-y3)+'" fill="rgba(76,154,255,.04)"/>';
    for(var y=1;y<=5;y++){var yy=yScale(y);h+='<line x1="'+L+'" y1="'+yy+'" x2="'+R+'" y2="'+yy+'" stroke="rgba(255,255,255,.07)" stroke-width="1"/>';h+='<text x="'+(L-12)+'" y="'+(yy+4)+'" fill="var(--t4)" font-size="12" text-anchor="end">'+y+'</text>'}
    var xticks=[xMin,xMin/2,0,xMax/2,xMax];
    for(var xt=0;xt<xticks.length;xt++){var xv=xticks[xt],xx=xScale(xv);h+='<line x1="'+xx+'" y1="'+T+'" x2="'+xx+'" y2="'+B+'" stroke="rgba(255,255,255,.05)" stroke-width="1"/>';h+='<text x="'+xx+'" y="'+(B+22)+'" fill="var(--t4)" font-size="12" text-anchor="middle">'+axisLabel(xv)+'</text>'}
    h+='<line x1="'+L+'" y1="'+y3+'" x2="'+R+'" y2="'+y3+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
    h+='<line x1="'+x0+'" y1="'+T+'" x2="'+x0+'" y2="'+B+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
    h+='<rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+PH+'" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>';
    h+='<text x="'+(L+16)+'" y="'+(T+18)+'" fill="rgba(251,191,36,.9)" font-size="12" font-weight="700">High shortage, automation risk</text>';
    h+='<text x="'+(R-16)+'" y="'+(T+18)+'" fill="rgba(52,211,153,.95)" font-size="12" font-weight="700" text-anchor="end">Benefit from AI</text>';
    h+='<text x="'+(L+16)+'" y="'+(B-14)+'" fill="rgba(248,113,113,.95)" font-size="12" font-weight="700">Suffer most from AI</text>';
    h+='<text x="'+(R-16)+'" y="'+(B-14)+'" fill="rgba(76,154,255,.95)" font-size="12" font-weight="700" text-anchor="end">AI lift, softer shortage</text>';
    h+='<text x="'+((L+R)/2)+'" y="'+(H-18)+'" fill="var(--t3)" font-size="13" text-anchor="middle">AI augmentation vs. automation score</text>';
    h+='<text x="'+(L+6)+'" y="'+(H-36)+'" fill="var(--red)" font-size="12">More automation risk</text>';
    h+='<text x="'+(R-6)+'" y="'+(H-36)+'" fill="var(--grn)" font-size="12" text-anchor="end">More augmentation gain</text>';
    h+='<text transform="translate(32 '+((T+B)/2)+') rotate(-90)" fill="var(--t3)" font-size="13" text-anchor="middle">Labor shortage composite score</text>';
    for(var pi=0;pi<data.points.length;pi++){
      var p=data.points[pi],mark=data.marks[p.id],cx=xScale(p.x),cy=yScale(p.y),fill=p.x>0?'#34d399':p.x<0?'#f87171':'#a8b8cc',op=mark?.95:.33,r=mark?5.6:3.2;
      p.cx=cx; p.cy=cy;
      h+='<circle class="sum-pt" data-id="'+escAttr(p.id)+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" fill-opacity="'+op+'" stroke="'+fill+'" stroke-opacity="'+(mark?.55:.18)+'" stroke-width="'+(mark?1.6:1)+'" style="cursor:pointer" />';
    }
    var rightItems=place(data.benefit,T+18,B-8,15),leftItems=place(data.suffer,T+18,B-8,15);
    for(var ri=0;ri<rightItems.length;ri++){
      var rp=rightItems[ri],rs=labelSpec(rp,'benefit');
      h+='<text x="'+rs.x+'" y="'+(rp.ly+3.5)+'" fill="rgba(52,211,153,.98)" font-size="9.25" font-weight="600" text-anchor="'+rs.anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(rs.text)+'</text>';
    }
    for(var li=0;li<leftItems.length;li++){
      var lp=leftItems[li],ls=labelSpec(lp,'suffer');
      h+='<text x="'+ls.x+'" y="'+(lp.ly+3.5)+'" fill="rgba(248,113,113,.98)" font-size="9.25" font-weight="600" text-anchor="'+ls.anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(ls.text)+'</text>';
    }
    svg.innerHTML=h;
    /* Event delegation: 3 listeners on the svg + an id->point map instead of
       3 listeners per circle with a linear scan on every mousemove. */
    var ptById={};for(var qi=0;qi<data.points.length;qi++)ptById[data.points[qi].id]=data.points[qi];
    function sumPt(ev){var t=ev.target;return(t&&t.classList&&t.classList.contains('sum-pt'))?t:null}
    svg.onmousemove=function(ev){var t=sumPt(ev);if(t){var p=ptById[t.getAttribute('data-id')];if(p)showSumTip(ev,p)}};
    svg.onmouseout=function(ev){if(sumPt(ev))hideSumTip()};
    svg.onclick=function(ev){var t=sumPt(ev);if(t)detail(t.getAttribute('data-id'))};
  };

  var nav=document.getElementById('nav'),sumBtn=nav?nav.querySelector('[data-v="sum"]'):null;
  if(nav&&sumBtn)nav.insertBefore(sumBtn,nav.firstChild);

  var qryEl=document.getElementById('qry'); if(qryEl) qryEl.oninput=debInput(function(e){if(e.target.value===qry)return;qry=e.target.value;render()});
  var mainPrimaryEl=document.getElementById('mainPrimary'); if(mainPrimaryEl){mainPrimaryEl.innerHTML=mainPrimaryOptionsHtml(mainPrimary);mainPrimaryEl.onchange=function(e){mainPrimary=e.target.value;render()}};
  var mainBenefitEl=document.getElementById('mainBenefit'); if(mainBenefitEl) mainBenefitEl.onchange=function(e){cat=e.target.value;render()};
  var srcEl=document.getElementById('srcP'); if(srcEl) srcEl.onclick=function(e){var b=e.target;if(!b.classList.contains('pl'))return;setSource(b.getAttribute('data-s'))};
  var sumSrcEl=document.getElementById('sumSrcP'); if(sumSrcEl) sumSrcEl.onclick=function(e){var b=e.target;if(!b.classList.contains('pl'))return;setSource(b.getAttribute('data-s'))};

  function showView(v){
    if(['take','tbl','wc','aiwc','met'].indexOf(v)<0) v='take';
    var bs=document.querySelectorAll('.nb');
    for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on',bs[i].getAttribute('data-v')===v);
    var map={vTake:'take',vTbl:'tbl',vWc:'wc',vAiWc:'aiwc',vMet:'met'};
    for(var mid in map){ var mel=document.getElementById(mid); if(mel) mel.style.display=v===map[mid]?'':'none'; }
    if(v==='wc'&&typeof renderWC==='function') renderWC();
    if(v==='aiwc'&&typeof renderAiWc==='function') renderAiWc();
  }
  window.showView=showView;

  if(nav) nav.onclick=function(e){
    var b=e.target; if(!b.classList.contains('nb')) return;
    var v=b.getAttribute('data-v');
    (window.showView||showView)(v);
    try{ location.hash=v; }catch(err){}
  };
  var tbEl=document.getElementById('tb'); if(tbEl) tbEl.onclick=function(e){ var tr=e.target.closest('tr'); if(tr){ var id=tr.getAttribute('data-id'); if(id) detail(id); } };
  var lsTbEl=document.getElementById('lsTb'); if(lsTbEl) lsTbEl.onclick=function(e){ var tr=e.target.closest('tr'); if(tr){ var id=tr.getAttribute('data-id'); if(id) lsDetail(id); } };
  var ovEl=document.getElementById('ov'); if(ovEl) ovEl.onclick=function(e){ if(e.target===ovEl) cld(); };
  document.onkeydown=function(e){ if(e.key==='Escape') cld(); };

  /* Floating tooltip for drill-down task tables (.tt): their scroll container
     (overflow-x:auto) clips the CSS tooltips, so we render one fixed-position
     tooltip at the viewport level instead. */
  (function(){
    var ft=null;
    function hideFt(){ if(ft) ft.style.display='none'; }
    document.addEventListener('mouseover',function(e){
      var w=e.target&&e.target.closest?e.target.closest('.tt .tip-wrap'):null;
      if(!w){ hideFt(); return; }
      var box=w.querySelector('.tip-box'); if(!box) return;
      if(!ft){ ft=document.createElement('div'); ft.className='float-tip'; document.body.appendChild(ft); }
      ft.innerHTML=box.innerHTML;
      ft.style.display='block';
      var r=w.getBoundingClientRect(), tw=ft.offsetWidth||250, th=ft.offsetHeight||60;
      var x=Math.min(Math.max(8,r.left),(window.innerWidth||1200)-tw-8);
      var y=r.bottom+8;
      if(y+th>(window.innerHeight||800)-8) y=r.top-th-8;
      ft.style.left=x+'px'; ft.style.top=y+'px';
    });
    document.addEventListener('scroll',hideFt,true);
  })();

  window.pct=pct; window.cls=cls; window.f2=f2; window.esc=esc; window.nil=nil;
  window.fmtNum=fmtNum; window.fmtScore=fmtScore; window.fmtPct2=fmtPct2; window.fmtMoney0=fmtMoney0; window.fmtInt=fmtInt;
  window.fmtK=fmtK; window.fmtSigned2=fmtSigned2; window.baseSoc=baseSoc; window.tip=tip; window.tipDown=tipDown;
  window.scoreHue=scoreHue; window.scoreChip=scoreChip; window.trimLabel=trimLabel; window.fql=fql;
  window.OCC=OCC; window.TSK=TSK; window.LS=LS; window.SOCM=SOCM; window.LSM=LSM;
  window.src=src; window.dsrc=dsrc; window.curId=curId; window.CL=CL; window.SL=SL;
  window.lsForOcc=lsForOcc; window.upperBound=upperBound; window.pctRankSorted=pctRankSorted; window.cld=cld;
  window.render=render; window.mainCols=mainCols;

  syncSourceButtons();
  render();
  showView((location.hash||'#take').replace('#',''));
})();
/* ---- end dashboard patch ---- */

/* ---- work context + ai vs work context patch ---- */
var WC=(window.DASHBOARD_DATA&&window.DASHBOARD_DATA.WC)||[];
var WCM={};
var wcQry="",wcSort="res",wcSortDir=-1;
var WC_LABELS={
  res:"AI Resilience",
  team:"Work With or Contribute to a Work Group or Team",
  public:"Deal With External Customers or the Public in General",
  error:"Consequence of Error",
  decision:"Frequency of Decision Making",
  exact:"Importance of Being Exact or Accurate",
  lead:"Coordinate or Lead Others in Accomplishing Work Activities",
  automation:"Degree of Automation",
  repeat:"Importance of Repeating Same Tasks"
};
function wcImportanceLabel(v){
  if(nil(v))return null;
  if(v>=4.5)return 'Extremely important';
  if(v>=3.5)return 'Very important';
  if(v>=2.5)return 'Important';
  if(v>=1.5)return 'Fairly important';
  return 'Not important at all';
}
function wcSeriousnessLabel(v){
  if(nil(v))return null;
  if(v>=4.5)return 'Extremely serious';
  if(v>=3.5)return 'Very serious';
  if(v>=2.5)return 'Serious';
  if(v>=1.5)return 'Fairly serious';
  return 'Not serious at all';
}
function wcDecisionFreqLabel(v){
  if(nil(v))return null;
  if(v>=4.5)return 'Every day';
  if(v>=3.5)return 'Once a week or more but not every day';
  if(v>=2.5)return 'Once a month or more but not every week';
  if(v>=1.5)return 'Once a year or more but not every month';
  return 'Never';
}
function wcAutomationLabel(v){
  if(nil(v))return null;
  if(v>=4.5)return 'Completely automated';
  if(v>=3.5)return 'Highly automated';
  if(v>=2.5)return 'Moderately automated';
  if(v>=1.5)return 'Slightly automated';
  return 'Not automated at all';
}
function wcMetricDisplay(name,raw,fallback){
  if(nil(raw))return fallback||'—';
  var r=Number(raw),num=fmtNum(r,1),label=null;
  if(name==='Work With or Contribute to a Work Group or Team' || name==='Deal With External Customers or the Public in General' || name==='Coordinate or Lead Others in Accomplishing Work Activities' || name==='Importance of Being Exact or Accurate' || name==='Importance of Repeating Same Tasks')label=wcImportanceLabel(r);
  else if(name==='Consequence of Error')label=wcSeriousnessLabel(r);
  else if(name==='Frequency of Decision Making')label=wcDecisionFreqLabel(r);
  else if(name==='Degree of Automation')label=wcAutomationLabel(r);
  if(label)return num+' - '+label;
  if(fallback&&/^\s*\d+(?:\.\d+)?\s*-/.test(String(fallback)))return String(fallback).replace(/^\s*\d+(?:\.\d+)?/,num);
  return fallback||num;
}
function wcMetric(rec,key){
  /* Memoized: the underlying O*NET values never change, but this is called
     ~5k times per table render and ~18k times per column sort. */
  if(rec){var mc=rec._mc||(rec._mc={});var hit=mc[key];if(hit)return hit}
  var v=rec&&rec[key]?rec[key]:null,out;
  if(v&&typeof v==='object'){
    var r=nil(v.r)?null:Number(v.r);
    var name=WC_LABELS[key]||key;
    var d=wcMetricDisplay(name,r,v.d?String(v.d):(!nil(r)?fmtNum(r,1):'—'));
    out={d:d,r:r};
  }
  else if(nil(v))out={d:'—',r:null};
  else{var num=Number(v);out=isFinite(num)?{d:fmtNum(num,1),r:num}:{d:String(v),r:null}}
  if(rec)rec._mc[key]=out;
  return out;
}
function calcWcResilience(rec){
  var keys=['team','public','error','decision','exact'],vals=[];
  for(var i=0;i<keys.length;i++){
    var m=wcMetric(rec,keys[i]);
    if(!nil(m.r))vals.push(Math.abs(m.r));
  }
  return vals.length?vals.reduce(function(a,b){return a+b},0)/vals.length:null;
}
for(var wci=0;wci<WC.length;wci++){
  var wr=WC[wci];
  if(!wr)continue;
  wr.res=calcWcResilience(wr);
  WCM[wr.id]=wr;
  var wb=baseSoc(wr.id);
  if(wb&&!WCM[wb])WCM[wb]=wr;
}
wcCols=[
  {k:"n",l:"Occupation",t:"O*NET occupation title. Click any row for full work context detail.",s:"min-width:300px"},
  {k:"primaryIndustry",l:"Primary Industry",t:"Higher-level industry grouping used for filtering in the investment tabs.",s:"min-width:180px"},
  {k:"res",l:"AI Resilience",t:"Average of the five featured work-context values.", main:true},
  {k:"team",l:"Work Group or Team",t:WC_LABELS.team},
  {k:"public",l:"External Customers/Public",t:WC_LABELS.public},
  {k:"error",l:"Consequence of Error",t:WC_LABELS.error},
  {k:"decision",l:"Decision Making",t:WC_LABELS.decision},
  {k:"exact",l:"Exact or Accurate",t:WC_LABELS.exact}
];
function wcMetricChip(m){
  if(m._c!==undefined)return m._c; /* chip HTML cached on the memoized metric object */
  var out;
  if(nil(m.r))out='<span style="color:var(--t3)">'+esc(m.d)+'</span>';
  else{
    var h=scoreHue(m.r);
    out='<span class="wc-chip" style="border-color:hsla('+h+',78%,55%,.34);background:hsla('+h+',78%,55%,.12);color:hsl('+h+',78%,64%)">'+esc(m.d)+'</span>';
  }
  m._c=out;
  return out;
}
function wcCompare(a,b,key,dir){
  if(key==='n' || key==='primaryIndustry'){
    var va=String(key==='n'?(a.n||''):primaryIndustryForId(a.id)).toLowerCase(),vb=String(key==='n'?(b.n||''):primaryIndustryForId(b.id)).toLowerCase();
    if(va<vb)return -1*dir; if(va>vb)return 1*dir; return 0;
  }
  var av=key==='res'?a.res:wcMetric(a,key).r, bv=key==='res'?b.res:wcMetric(b,key).r;
  var an=nil(av),bn=nil(bv);
  if(an&&bn)return String(a.n||'').localeCompare(String(b.n||''));
  if(an)return 1; if(bn)return -1;
  if(av===bv)return String(a.n||'').localeCompare(String(b.n||''));
  return dir*(av-bv);
}
renderWcTh=function(){
  var h='';
  for(var i=0;i<wcCols.length;i++){
    var c=wcCols[i],isSorted=c.k===wcSort;
    var arrow=isSorted?(wcSortDir===1?' &#9650;':' &#9660;'):' &#8597;';
    h+='<th'+(c.s?' style="'+c.s+'"':'')+' class="'+(isSorted?'sorted ':'')+(c.main?'primary-col-head':'')+'" onclick="wcsort(\''+c.k+'\')">';
    h+=tipDown(c.l+'<span class="sa">'+arrow+'</span>',c.t);
    h+='</th>';
  }
  var th=document.getElementById('wcTh');
  if(th)th.querySelector('tr').innerHTML=h;
};
renderWC=function(){
  var _vw=document.getElementById('vWc'); if(_vw&&_vw.style.display==='none') return;
  var tb=document.getElementById('wcTb');
  if(!tb)return;
  renderWcTh();
  var list=WC.slice();
  if(window.wcPrimaryFilter){list=list.filter(function(o){return primaryIndustryForId(o.id)===window.wcPrimaryFilter})}
  if(wcQry){var q=wcQry.toLowerCase();list=list.filter(function(o){return window.__searchBlob(o).indexOf(q)>=0})}
  list.sort(function(a,b){return wcCompare(a,b,wcSort,wcSortDir)});
  var cnt=document.getElementById('wcCnt'); if(cnt)cnt.textContent=list.length.toLocaleString()+' occupations';
  /* Resilience Z is rendered inline here (single pass) instead of the old
     post-render per-row rewrite in patchRenderWC. */
  var hasResZ=typeof window.getResilienceZ==='function';
  var h='';
  for(var i=0;i<list.length;i++){
    var o=list[i];
    h+='<tr data-id="'+esc(o.id)+'" class="clickable-row" title="Click for drill-down"><td class="tn" style="white-space:normal;max-width:none"><div>'+esc(o.n)+'</div><div class="subcd">'+esc(o.id)+'</div></td>';
    h+='<td>'+esc(primaryIndustryForId(o.id))+'</td>';
    if(hasResZ){
      var z=Number(window.getResilienceZ(o.id));if(!isFinite(z))z=0;
      var raw=window.getResilienceRaw?window.getResilienceRaw(o.id):null;
      var rawTxt=(raw==null||!isFinite(Number(raw)))?'':(' <span style="color:var(--t4);font-weight:400">(raw: '+Number(raw).toFixed(2)+')</span>');
      h+='<td class="primary-col-cell"><span class="m '+(z>0?'p':z<0?'n':'z')+'" style="font-weight:700">'+(z>0?'+':'')+z.toFixed(2)+'</span>'+rawTxt+'</td>';
    }else{
      h+='<td class="primary-col-cell">'+wcMetricChip({d:fmtNum(o.res,1),r:o.res})+'</td>';
    }
    for(var j=3;j<wcCols.length;j++)h+='<td class="wc-cell">'+wcMetricChip(wcMetric(o,wcCols[j].k))+'</td>';
    h+='</tr>';
  }
  tb.innerHTML=h;
};
window._wcHasZCol=true;
window.wcsort=function(col){if(wcSort===col){wcSortDir*=-1}else{wcSort=col;wcSortDir=(col==='n'||col==='primaryIndustry')?1:-1}renderWC()};
function wcDisplayRow(label,m){return '<tr><td class="tx">'+esc(label)+'</td><td class="m">'+wcMetricChip(m)+'</td></tr>'}
function wcAllMetrics(rec,excludeFeatured){
  var featuredNames={
    'Work With or Contribute to a Work Group or Team':1,
    'Deal With External Customers or the Public in General':1,
    'Consequence of Error':1,
    'Frequency of Decision Making':1,
    'Importance of Being Exact or Accurate':1
  };
  if(rec&&Array.isArray(rec.allMetrics)&&rec.allMetrics.length){
    var rows=[];
    for(var i=0;i<rec.allMetrics.length;i++){
      var a=rec.allMetrics[i]||[];
      var name=a[0],raw=a[1],disp=a[2];
      if(excludeFeatured&&featuredNames[name])continue;
      rows.push({label:name,m:{d:wcMetricDisplay(name,nil(raw)?null:Number(raw),nil(disp)?'—':String(disp)),r:nil(raw)?null:Number(raw)}});
    }
    return rows;
  }
  var order=['team','public','lead','error','decision','automation','exact','repeat'],rows=[];
  for(var j=0;j<order.length;j++){
    var k=order[j];
    if(excludeFeatured&&featuredNames[WC_LABELS[k]])continue;
    rows.push({label:WC_LABELS[k]||k,m:wcMetric(rec,k)});
  }
  return rows;
}
function buildWCDetail(id){
  var o=WCM[id]||WCM[baseSoc(id)]||null;
  if(!o)return '';
  var title=o.n||((function(){for(var i=0;i<OCC.length;i++)if(OCC[i].id===id)return OCC[i].n;return id})());
  var h='<button class="x" id="xb">&times;</button>';
  h+='<div class="dt">'+esc(title)+'</div>';
  h+='<div class="dc">'+esc(id)+' &middot; Work Context drill-down</div>';
  h+=buildSocDescBox(id,'Job description');
  h+='<div class="sc-row">';
  h+='<div class="sc-box"><div class="lb">AI Resilience</div><div class="vl">'+wcMetricChip({d:fmtNum(o.res,1),r:o.res})+'</div><div class="mt">Average of the five featured work-context values</div></div>';
  h+='<div class="sc-box"><div class="lb">Work Group or Team</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'team'))+'</div></div>';
  h+='<div class="sc-box"><div class="lb">External Customers/Public</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'public'))+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Consequence of Error</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'error'))+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Decision Making</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'decision'))+'</div></div>';
  h+='<div class="sc-box"><div class="lb">Exact or Accurate</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'exact'))+'</div></div>';
  h+='</div>';
  var allRows=wcAllMetrics(o,true);
  h+='<div class="sct">All Other Work Context Scores</div><div class="scs">These are the additional work-context measures available for this occupation in the loaded workbook.</div>';
  h+='<div style="overflow-x:auto;border:1px solid var(--b1);border-radius:var(--r);margin-bottom:16px"><table class="tt"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>';
  for(var i=0;i<allRows.length;i++)h+=wcDisplayRow(allRows[i].label,allRows[i].m);
  h+='</tbody></table></div>';
  h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
  return h;
}
function wcDetail(id){var pnl=document.getElementById('pnl'); if(!pnl)return; pnl.innerHTML=buildWCDetail(id); document.getElementById('ov').classList.add('open'); document.body.style.overflow='hidden'; var xb=document.getElementById('xb'); if(xb)xb.onclick=cld}
window.wcDetail=wcDetail;
function buildAiWcData(){
  var pts=[];
  for(var i=0;i<OCC.length;i++){
    var o=OCC[i],d=o[src],w=WCM[o.id]||WCM[baseSoc(o.id)];
    if(!d||nil(d.s)||!w||nil(w.res))continue;
    pts.push({id:o.id,n:o.n,base:baseSoc(o.id),x:d.s,y:w.res,auto:d.au,aug:d.ag,cat:d.ct,wc:w});
  }
  var xs=[],ys=[];
  for(var j=0;j<pts.length;j++){xs.push(pts[j].x);ys.push(pts[j].y)}
  xs.sort(function(a,b){return a-b}); ys.sort(function(a,b){return a-b});
  for(var k=0;k<pts.length;k++){
    pts[k].xp=pctRankSorted(xs,pts[k].x);
    pts[k].yp=pctRankSorted(ys,pts[k].y);
    pts[k].benefit=pts[k].x>0?(pts[k].xp+pts[k].yp):-999;
    pts[k].suffer=pts[k].x<0?((1-pts[k].xp)+(1-pts[k].yp)):-999;
  }
  var benefit=pts.filter(function(p){return p.x>0}).slice().sort(function(a,b){return b.benefit-a.benefit||b.x-a.x||b.y-a.y}).slice(0,20);
  var suffer=pts.filter(function(p){return p.x<0}).slice().sort(function(a,b){return b.suffer-a.suffer||a.x-b.x||a.y-b.y}).slice(0,20);
  var marks={};
  for(var bi=0;bi<benefit.length;bi++)marks[benefit[bi].id]={kind:'benefit',rank:bi+1};
  for(var si=0;si<suffer.length;si++)marks[suffer[si].id]={kind:'suffer',rank:si+1};
  var medianY=ys.length?(ys.length%2?ys[(ys.length-1)/2]:(ys[ys.length/2-1]+ys[ys.length/2])/2):3;
  return {points:pts,benefit:benefit,suffer:suffer,marks:marks,medianY:medianY};
}
function makeAiWcList(arr,kind){
  function headCell(label,tip,extraCls){return '<div class="cell'+(extraCls?' '+extraCls:'')+'" title="'+esc(tip)+'"><span class="tip-label">'+esc(label)+'</span></div>'}
  var sumTip=kind==='benefit'
    ? 'AI percentile plus Work Context resilience percentile. Higher values indicate occupations that rank more strongly on both AI upside and work-context resilience.'
    : 'AI percentile plus Work Context resilience percentile. Lower values indicate occupations with more downside exposure; this table is ordered from the lowest combined percentiles upward.';
  var h='<div class="sum-list-head">'+headCell('#','Rank within this top-20 list.')+headCell('Occupation','Occupation title from O*NET.')+headCell('AI score','Net AI augmentation vs. automation score.','num')+headCell('AI percentile','Percentile rank of the AI score across plotted occupations.','num')+headCell('AI Resilience','Average of the five featured work-context values.','num')+headCell('Resilience percentile','Percentile rank of the AI Resilience score across plotted occupations.','num')+headCell('Sum of percentiles',sumTip,'num')+'</div>';
  for(var i=0;i<arr.length;i++){
    var p=arr[i],sumVal=p.xp+p.yp,sumCls=kind==='benefit'?'p':'n',aiCls=p.x>0?'p':p.x<0?'n':'z';
    h+='<div class="sum-item" data-id="'+p.id+'"><div class="cell rk">'+(i+1)+'</div><div class="cell nm">'+esc(p.n)+'</div><div class="cell num m '+aiCls+'">'+fmtSigned2(p.x)+'</div><div class="cell num m pctv">'+pct(p.xp)+'</div><div class="cell num">'+scoreChip(p.y)+'</div><div class="cell num m pctv">'+pct(p.yp)+'</div><div class="cell num m sumv '+sumCls+'">'+f2(sumVal)+'</div></div>';
  }
  return h;
}
function showAiWcTip(ev,p){
  var tip=document.getElementById('aiwcTip'),card=document.getElementById('aiwcCard');
  if(!tip||!card)return;
  tip.innerHTML='<b>'+esc(p.n)+'</b><br><span style="font-family:IBM Plex Mono,monospace;color:var(--t4)">'+p.id+' &middot; SOC '+p.base+'</span><br>AI score: <span class="'+(p.x>0?'p':p.x<0?'n':'z')+'">'+fmtSigned2(p.x)+'</span><br>AI Resilience: '+fmtNum(p.y,2)+'<br>Automation: '+pct(p.auto)+' &middot; Augmentation: '+pct(p.aug)+'<br>Click to open the Work Context drill-down';
  tip.style.display='block';
  var rect=card.getBoundingClientRect();
  var x=ev.clientX-rect.left+14,y=ev.clientY-rect.top+14;
  x=Math.min(x,rect.width-330); y=Math.min(y,rect.height-120);
  if(x<10)x=10; if(y<10)y=10;
  tip.style.left=x+'px'; tip.style.top=y+'px';
}
function hideAiWcTip(){var tip=document.getElementById('aiwcTip'); if(tip)tip.style.display='none'}
function renderAiWc(){
  var svg=document.getElementById('aiwcSvg');
  if(!svg) return;
  var data=buildAiWcData();
  var note=document.getElementById('aiwcNote');
  if(note) note.textContent='Horizontal axis = AI augmentation vs. automation score. Vertical axis = AI Resilience. Hover any point for the occupation, and click a point to open the AI Resilience drill-down.';
  var ben=document.getElementById('aiwcBenefit'),suf=document.getElementById('aiwcSuffer');
  if(ben) ben.innerHTML=makeAiWcList(data.benefit,'benefit');
  if(suf) suf.innerHTML=makeAiWcList(data.suffer,'suffer');
  var W=1200,H=620,L=160,R=1040,T=34,B=542,PW=R-L,PH=B-T;
  var absRaw=1; for(var i=0;i<data.points.length;i++) absRaw=Math.max(absRaw,Math.abs(data.points[i].x));
  var absX=Math.ceil(absRaw*1.1); if(absX<5) absX=5;
  var xMin=-absX,xMax=absX,yMin=2,yMax=5;
  function xScale(v){ return L+(v-xMin)/(xMax-xMin)*PW; }
  function yScale(v){ return T+(yMax-v)/(yMax-yMin)*PH; }
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function axisLabel(v){ var av=Math.abs(v),s=av>=10?String(Math.round(v)):String(Math.round(v*10)/10); return s.replace(/\.0$/,''); }
  function escAttr(s){ return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function trimText(s,n){ s=String(s||''); return s.length>n?s.slice(0,n-1)+'…':s; }
  function intersects(a,b){ return !(a.x2<b.x1 || a.x1>b.x2 || a.y2<b.y1 || a.y1>b.y2); }
  var x0=xScale(0),yMidVal=3.5,yMid=yScale(yMidVal);
  var h='';
  h+='<defs><marker id="quadArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="rgba(255,255,255,.28)"/></marker></defs>';
  h+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="transparent"/>';
  h+='<rect x="'+L+'" y="'+T+'" width="'+(x0-L)+'" height="'+(yMid-T)+'" fill="rgba(251,191,36,.04)"/>';
  h+='<rect x="'+x0+'" y="'+T+'" width="'+(R-x0)+'" height="'+(yMid-T)+'" fill="rgba(52,211,153,.05)"/>';
  h+='<rect x="'+L+'" y="'+yMid+'" width="'+(x0-L)+'" height="'+(B-yMid)+'" fill="rgba(248,113,113,.05)"/>';
  h+='<rect x="'+x0+'" y="'+yMid+'" width="'+(R-x0)+'" height="'+(B-yMid)+'" fill="rgba(76,154,255,.04)"/>';
  for(var y=2;y<=5;y++){ var yy=yScale(y); h+='<text x="'+(L-12)+'" y="'+(yy+4)+'" fill="var(--t4)" font-size="12" text-anchor="end">'+y+'</text>'; }
  var xticks=[xMin,xMin/2,0,xMax/2,xMax];
  for(var xt=0;xt<xticks.length;xt++){ var xv=xticks[xt],xx=xScale(xv); h+='<text x="'+xx+'" y="'+(B+22)+'" fill="var(--t4)" font-size="12" text-anchor="middle">'+axisLabel(xv)+'</text>'; }
  h+='<line x1="'+L+'" y1="'+yMid+'" x2="'+R+'" y2="'+yMid+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
  h+='<line x1="'+x0+'" y1="'+T+'" x2="'+x0+'" y2="'+B+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
  h+='<rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+PH+'" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>';
  h+='<text x="'+(L+16)+'" y="'+(T+18)+'" fill="rgba(251,191,36,.9)" font-size="12" font-weight="700">Automation usage but occupation is resilient to AI</text>';
  h+='<text x="'+(R-16)+'" y="'+(T+18)+'" fill="rgba(52,211,153,.95)" font-size="12" font-weight="700" text-anchor="end">Benefit from AI</text>';
  h+='<text x="'+(L+16)+'" y="'+(B-14)+'" fill="rgba(248,113,113,.95)" font-size="12" font-weight="700">Suffer most from AI</text>';
  h+='<text x="'+(R-16)+'" y="'+(B-14)+'" fill="rgba(76,154,255,.95)" font-size="12" font-weight="700" text-anchor="end">Augmentation usage but AI displacement risk remains</text>';
  h+='<text x="'+((L+R)/2)+'" y="'+(H-18)+'" fill="var(--t3)" font-size="13" text-anchor="middle">AI augmentation vs. automation score</text>';
  h+='<text x="'+(L+6)+'" y="'+(H-36)+'" fill="var(--red)" font-size="12">More automation risk</text>';
  h+='<text x="'+(R-6)+'" y="'+(H-36)+'" fill="var(--grn)" font-size="12" text-anchor="end">More augmentation gain</text>';
  h+='<text transform="translate(32 '+((T+B)/2)+') rotate(-90)" fill="var(--t3)" font-size="13" text-anchor="middle">AI Resilience</text>';
  for(var pi=0;pi<data.points.length;pi++){
    var p=data.points[pi],mark=data.marks[p.id],cx=xScale(p.x),cy=clamp(yScale(p.y),T,B),fill=((p.x<0&&p.y>=yMidVal)||(p.x>0&&p.y<yMidVal))?'#fbbf24':(p.x>0?'#34d399':p.x<0?'#f87171':'#a8b8cc'),op=mark?.95:.33,r=mark?5.6:3.2;
    p.cx=cx; p.cy=cy;
    h+='<circle class="aiwc-pt" data-id="'+escAttr(p.id)+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" fill-opacity="'+op+'" stroke="'+fill+'" stroke-opacity="'+(mark?.55:.18)+'" stroke-width="'+(mark?1.6:1)+'" style="cursor:pointer" />';
  }
  var taken=[];
  var sideLeft=[], sideRight=[];
  var labels=data.benefit.concat(data.suffer);
  labels.sort(function(a,b){
    var ra=(data.marks[a.id]&&data.marks[a.id].rank)||999, rb=(data.marks[b.id]&&data.marks[b.id].rank)||999;
    return ra-rb;
  });
  for(var li=0;li<labels.length;li++){
    var p=labels[li], txt=trimText(p.n,24), w=Math.max(48,txt.length*5.2), hBox=12;
    var fill=p.x>0?'rgba(52,211,153,.98)':'rgba(248,113,113,.98)';
    var candidates=[
      {mode:'inside', anchor:'start', tx:p.cx+8, ty:p.cy-3, x1:p.cx+6, x2:p.cx+6+w, y1:p.cy-10, y2:p.cy+2},
      {mode:'inside', anchor:'end', tx:p.cx-8, ty:p.cy-3, x1:p.cx-8-w, x2:p.cx-8, y1:p.cy-10, y2:p.cy+2},
      {mode:'inside', anchor:'middle', tx:p.cx, ty:p.cy-10, x1:p.cx-w/2, x2:p.cx+w/2, y1:p.cy-18, y2:p.cy-6},
      {mode:'inside', anchor:'middle', tx:p.cx, ty:p.cy+14, x1:p.cx-w/2, x2:p.cx+w/2, y1:p.cy+4, y2:p.cy+16}
    ];
    var placed=null;
    for(var ci=0;ci<candidates.length;ci++){
      var c=candidates[ci];
      if(c.x1<L+8 || c.x2>R-8 || c.y1<T+8 || c.y2>B-8) continue;
      var overlap=false;
      for(var ti=0;ti<taken.length;ti++) if(intersects(c,taken[ti])) { overlap=true; break; }
      if(!overlap){ placed=c; break; }
    }
    if(placed){ placed.text=txt; placed.fill=fill; taken.push(placed); p._label=placed; }
    else { (p.x>=0?sideRight:sideLeft).push({p:p,text:txt,fill:fill}); }
  }
  function assignSide(items, side){
    items.sort(function(a,b){ return a.p.cy-b.p.cy; });
    var top=T+18,bottom=B-8,gap=15,last=top-gap;
    for(var i=0;i<items.length;i++){
      var y=Math.max(top,Math.min(bottom,items[i].p.cy));
      if(y<last+gap) y=last+gap;
      items[i].y=Math.min(y,bottom);
      last=items[i].y;
    }
    for(var j=items.length-2;j>=0;j--){
      if(items[j].y>items[j+1].y-gap) items[j].y=items[j+1].y-gap;
      if(items[j].y<top) items[j].y=top;
    }
    for(var k=0;k<items.length;k++){
      var it=items[k], tx=side==='right'?R+28:L-28;
      var anchor=side==='right'?'start':'end';
      var lx=side==='right'?R+8:L-8;
      h+='<line class="quad-connector" x1="'+it.p.cx+'" y1="'+it.p.cy+'" x2="'+lx+'" y2="'+it.y+'" />';
      h+='<text x="'+tx+'" y="'+(it.y+3.5)+'" fill="'+it.fill+'" font-size="9.25" font-weight="600" text-anchor="'+anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(it.text)+'</text>';
    }
  }
  for(var ti=0;ti<taken.length;ti++){
    var t=taken[ti];
    h+='<text x="'+t.tx+'" y="'+t.ty+'" fill="'+t.fill+'" font-size="9.25" font-weight="600" text-anchor="'+t.anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(t.text)+'</text>';
  }
  assignSide(sideRight,'right');
  assignSide(sideLeft,'left');
  svg.innerHTML=h;
  var ptById={};for(var qi=0;qi<data.points.length;qi++)ptById[data.points[qi].id]=data.points[qi];
  function aiwcPt(ev){var t=ev.target;return(t&&t.classList&&t.classList.contains('aiwc-pt'))?t:null}
  svg.onmousemove=function(ev){var t=aiwcPt(ev);if(t){var p=ptById[t.getAttribute('data-id')];if(p)showAiWcTip(ev,p)}};
  svg.onmouseout=function(ev){if(aiwcPt(ev))hideAiWcTip()};
  svg.onclick=function(ev){var t=aiwcPt(ev);if(t)wcDetail(t.getAttribute('data-id'))};
}

var wcQryEl=document.getElementById('wcQry'); if(wcQryEl)wcQryEl.oninput=window.__debInput(function(e){if(e.target.value===wcQry)return;wcQry=e.target.value;renderWC()});
var wcTbEl=document.getElementById('wcTb'); if(wcTbEl)wcTbEl.onclick=function(e){var tr=e.target.closest('tr');if(tr){var id=tr.getAttribute('data-id');if(id)wcDetail(id)}};
var aiwcBen=document.getElementById('aiwcBenefit'); if(aiwcBen)aiwcBen.onclick=function(e){var it=e.target.closest('.sum-item');if(it)wcDetail(it.getAttribute('data-id'))};
var aiwcSuf=document.getElementById('aiwcSuffer'); if(aiwcSuf)aiwcSuf.onclick=function(e){var it=e.target.closest('.sum-item');if(it)wcDetail(it.getAttribute('data-id'))};
renderWC();
renderAiWc();
showView((location.hash||'#tbl').replace('#',''));


/* ---- end work context + ai vs work context patch ---- */

/* ---- v6 clean override: work-context drill-down refresh + standardized AI vs WC ---- */
(function(){
  function v6TaskRawScore(raw){
    if(!raw || raw[6]!==1 || !raw[7]) return 0;
    var imp=Number(raw[1])||0, auto=Number(raw[7][1])||0, aug=Number(raw[7][2])||0;
    return 100 * (aug - auto) * ((imp - 1) / 4);
  }
  function effectiveHumanTask(raw,occId){
    return !!raw[5] || raw[raw.length-1]===1;
  }
  function hasClassifiedAiSignal(t){
    return (Number(t.d)||0)>0 || (Number(t.fb)||0)>0 || (Number(t.ti)||0)>0 || (Number(t.v)||0)>0 || (Number(t.l)||0)>0;
  }
  function hasDisplayedNonZeroScore(v){
    var n=Number(v)||0;
    return Math.abs(Math.round(n*10)/10)>0;
  }
  function taskPct(v){
    var n=Number(v)||0, s=n.toFixed(1).replace(/\.0$/,'');
    return s+'%';
  }
  function parseTask(raw,occId){
    var o={tk:raw[0],im:raw[1],rl:raw[2],fa:raw[3],fw:raw[4],origHu:!!raw[5],hu:effectiveHumanTask(raw,occId),ai:raw[6]};
    if(raw[6]===1 && raw[7]){
      var a=raw[7], sc=v6TaskRawScore(raw);
      o.e=Number(a[0])||0; o.au=Number(a[1])||0; o.ag=Number(a[2])||0; o.rawSc=sc; o.sc=o.hu?0:sc;
      o.d=Number(a[4])||0; o.fb=Number(a[5])||0; o.ti=Number(a[6])||0; o.v=Number(a[7])||0; o.l=Number(a[8])||0; o.u=Number(a[9])||0;
      o.ta=Math.max(0,Math.round((o.ti+o.v+o.l)*10)/10);
    }else{
      o.e=0;o.au=0;o.ag=0;o.rawSc=0;o.sc=0;o.d=0;o.fb=0;o.ti=0;o.v=0;o.l=0;o.u=0;o.ta=0;
    }
    return o;
  }
  function isScoreEligibleAiTask(t){
    return t.ai===1 && !t.hu && hasClassifiedAiSignal(t) && hasDisplayedNonZeroScore(t.sc);
  }
  window.isScoreEligibleAiTask=isScoreEligibleAiTask;
  var _occCache={};
  function occAdjusted(id){
    if(_occCache[id]!==undefined) return _occCache[id];
    var tasks=TSK[id]||[], ai=0, sum=0, au=0, ag=0;
    for(var i=0;i<tasks.length;i++){
      var obj=parseTask(tasks[i], id);
      if(!isScoreEligibleAiTask(obj)) continue;
      ai++;
      sum += obj.sc * (Number(tasks[i][4])||0) / 100;
      au += obj.au;
      ag += obj.ag;
    }
    var cv=tasks.length?ai/tasks.length:0;
    if(ai){ au/=ai; ag/=ai; } else { au=0; ag=0; }
    var sparse=(ai<=1) || (cv<0.101);
    var s=sparse?0:(Math.abs(sum)>1e-12?sum:0);
    return _occCache[id]={ai:ai, cv:cv, au:au, ag:ag, s:s, sparse:sparse, ct:s>0?'B':s<0?'R':'N'};
  }
  window.occAdjusted = occAdjusted;
  function sortAiTasks(rawTasks,occId){
    var parsed=[];
    for(var i=0;i<rawTasks.length;i++) parsed.push(parseTask(rawTasks[i],occId));
    parsed.sort(function(a,b){
      var ba=isScoreEligibleAiTask(a)?0:(a.ai===1&&a.hu?1:2), bb=isScoreEligibleAiTask(b)?0:(b.ai===1&&b.hu?1:2);
      if(ba!==bb) return ba-bb;
      if(ba===0 && a.sc!==b.sc) return b.sc-a.sc;
      if(ba===1){
        var ah=Math.abs(a.rawSc||0), bh=Math.abs(b.rawSc||0);
        if(ah!==bh) return bh-ah;
      }
      return String(a.tk||'').localeCompare(String(b.tk||''));
    });
    return parsed;
  }

  WC_LABELS.contact = 'Contact With Others';
  WC_LABELS.impact = 'Impact of Decisions on Co-workers or Company Results';

  function findAllMetric(rec, label){
    if(rec && Array.isArray(rec.allMetrics)){
      for(var i=0;i<rec.allMetrics.length;i++){
        var row=rec.allMetrics[i]||[];
        if(row[0]===label){
          var raw=nil(row[1])?null:Number(row[1]);
          var disp=nil(row[2])?(!nil(raw)?fmtNum(raw,1):'—'):String(row[2]);
          return {d:disp,r:raw};
        }
      }
    }
    return {d:'—',r:null};
  }
  function ensureWcMetric(rec,key,label){
    if(!rec) return;
    if(rec[key] && typeof rec[key]==='object') return;
    rec[key]=findAllMetric(rec,label);
  }
  calcWcResilience = function(rec){
    ensureWcMetric(rec,'contact','Contact With Others');
    ensureWcMetric(rec,'impact','Impact of Decisions on Co-workers or Company Results');
    var w=(window.SCORE_WEIGHTS&&window.SCORE_WEIGHTS.resilience)||{contact:0.25,error:0.25,impact:0.25,exact:0.25};
    var keys=['contact','error','impact','exact'];
    var sum=0,wSum=0;
    for(var i=0;i<keys.length;i++){
      var m=wcMetric(rec,keys[i]);
      if(nil(m.r)) continue;
      var wt=Number(w[keys[i]])||0;
      if(wt<=0) continue;
      sum+=Math.abs(Number(m.r))*wt; wSum+=wt;
    }
    return wSum>0 ? sum/wSum : null;
  };
  window.refreshWcSummaries = function(){
    WCM={};
    for(var i=0;i<WC.length;i++){
      var rec=WC[i];
      if(!rec) continue;
      ensureWcMetric(rec,'contact','Contact With Others');
      ensureWcMetric(rec,'impact','Impact of Decisions on Co-workers or Company Results');
      rec.res=calcWcResilience(rec);
      WCM[rec.id]=rec;
      var base=baseSoc(rec.id);
      if(base && !WCM[base]) WCM[base]=rec;
    }
  };
  function refreshWcSummaries(){
    WCM={};
    for(var i=0;i<WC.length;i++){
      var rec=WC[i];
      if(!rec) continue;
      ensureWcMetric(rec,'contact','Contact With Others');
      ensureWcMetric(rec,'impact','Impact of Decisions on Co-workers or Company Results');
      rec.res=calcWcResilience(rec);
      WCM[rec.id]=rec;
      var base=baseSoc(rec.id);
      if(base && !WCM[base]) WCM[base]=rec;
    }
  }
  wcCols=[
    {k:'n',l:'Occupation',t:'O*NET occupation title. Click any row for full work context detail.',s:'min-width:300px'},
    {k:'primaryIndustry',l:'Primary Industry',t:'Higher-level industry grouping used for filtering in the investment tabs.',s:'min-width:180px'},
    {k:'res',l:'AI Resilience (Z Score)',t:'Z-score of the user-weighted average across the four featured work-context values. Higher = more resilient than the average occupation.', main:true},
    {k:'contact',l:'Contact With Others',t:WC_LABELS.contact||'Contact With Others'},
    {k:'error',l:'Consequence of Error',t:WC_LABELS.error},
    {k:'impact',l:'Impact of Decisions',t:WC_LABELS.impact||'Impact of Decisions on Co-workers or Company Results'},
    {k:'exact',l:'Exact or Accurate',t:WC_LABELS.exact}
  ];

  function buildAiOnlyTaskTable(id){
    var raw=TSK[id]||[], aiRaw=[];
    for(var i=0;i<raw.length;i++) if(raw[i][6]===1) aiRaw.push(raw[i]);
    if(!aiRaw.length) return '<div class="sct" style="color:var(--t4);margin-top:12px">No AI-exposed tasks.</div>';
    var tasks=sortAiTasks(aiRaw,id);
    var h='<div class="sct">AI-exposed tasks ('+tasks.length+' total)</div>';
    h+='<div class="scs">Only tasks with AI interaction data are shown below. Human / physical tasks remain listed, but their displayed AI score is forced to 0 because the task itself still requires physical presence or face-to-face execution.</div>';
    h+='<div style="overflow-x:auto;border:1px solid var(--b1);border-radius:var(--r)"><table class="tt"><thead>';
    h+='<tr><th colspan="4" style="border-right:1px solid var(--b2)">Task Details</th>';
    h+='<th colspan="2" style="border-right:1px solid var(--b2)">Scores</th>';
    h+='<th colspan="3" class="cg-auto" style="border-right:1px solid var(--b2);text-align:center">Automation (Dir + FB)</th>';
    h+='<th colspan="4" class="cg-aug" style="border-right:1px solid var(--b2);text-align:center">Augmentation (TI + Val + Lrn)</th>';
    h+='<th>Other</th></tr><tr>';
    var cols=[['tk','Task'],['im','Imp'],['fa','Freq'],['fw','FW%'],['sc','Score'],['au','A/A%'],
      ['d','Dir%','Directive: human delegates complete task execution to AI with minimal interaction. Counted as automation.'],
      ['fb','FB%','Feedback Loop: human and AI engage in iterative dialogue to complete the task, with the human mainly providing feedback from the environment. Counted as automation.'],
      ['auto','Tot Auto%','Total automation share (Directive + Feedback Loop).'],
      ['ti','TI%','Task Iteration: human and AI engage in iterative dialogue to complete a task, with the human refining the AI outputs. Counted as augmentation.'],
      ['v','Val%','Validation: human uses AI to check or validate their own work. Counted as augmentation.'],
      ['l','Lrn%','Learning: human seeks understanding and explanation rather than direct task completion. Counted as augmentation.'],
      ['ta','Tot Aug%','Total augmentation share (Task Iteration + Validation + Learning).'],
      ['u','Unc%']];
    for(var ci=0;ci<cols.length;ci++){
      var c=cols[ci], extra='';
      if(c[0]==='fw' || c[0]==='au' || c[0]==='auto' || c[0]==='ta') extra=' style="border-right:1px solid var(--b2)"';
      var cls2='';
      if(c[0]==='d' || c[0]==='fb' || c[0]==='auto') cls2=' class="cg-auto"';
      if(c[0]==='ti' || c[0]==='v' || c[0]==='l' || c[0]==='ta') cls2=' class="cg-aug"';
      h+='<th'+cls2+extra+'>'+(c[2]?tip(c[1],c[2]):c[1])+'</th>';
    }
    h+='</tr></thead><tbody>';
    for(var j=0;j<tasks.length;j++){
      var t=tasks[j], hfl=t.hu?'<span class="hf">[human / physical]</span>':'';
      h+='<tr class="'+(t.hu?'human-row':'')+'"><td class="tx">'+esc(t.tk)+hfl+'</td>';
      h+='<td class="m">'+t.im+'</td><td class="fl">'+fql(t.fa)+'</td><td class="m" style="border-right:1px solid var(--b2)">'+t.fw+'%</td>';
      h+='<td class="m '+cls(t.sc)+'">'+(Math.round(t.sc*10)/10).toFixed(1)+'</td>';
      h+='<td style="border-right:1px solid var(--b2)"><div style="display:flex;height:7px;border-radius:4px;overflow:hidden;min-width:50px"><div style="width:'+pct(t.au)+';background:var(--red)"></div><div style="width:'+pct(t.ag)+';background:var(--grn)"></div></div></td>';
      h+='<td class="m n">'+taskPct(t.d)+'</td><td class="m n">'+taskPct(t.fb)+'</td><td class="m n" style="border-right:1px solid var(--b2);font-weight:600">'+pct(t.au)+'</td>';
      h+='<td class="m p">'+taskPct(t.ti)+'</td><td class="m p">'+taskPct(t.v)+'</td><td class="m p">'+taskPct(t.l)+'</td><td class="m p" style="border-right:1px solid var(--b2);font-weight:600">'+taskPct(t.ta)+'</td>';
      h+='<td class="m z">'+taskPct(t.u)+'</td></tr>';
    }
    h+='</tbody></table></div>';
    return h;
  }

  buildWCDetail = function(id){
    var o=WCM[id]||WCM[baseSoc(id)]||null;
    if(!o) return '';
    var occ=null; for(var i=0;i<OCC.length;i++){ if(OCC[i].id===id){ occ=OCC[i]; break; } }
    var title=(o&&o.n) || (occ&&occ.n) || id;
    var occStats=occ?occAdjusted(occ.id):null;
    var totalTasks=occ?occ.t:((TSK[id]||[]).length||0);
    var _navOn=document.querySelector('.nb.on'); var fromResilienceTab=!!(_navOn && _navOn.getAttribute('data-v')==='wc');
    var h='<button class="x" id="xb">&times;</button>';
    h+='<div class="dt">'+esc(title)+'</div>';
    h+='<div class="dc">'+esc(id)+' &middot; Occupation drill-down</div>';
    h+=(window.buildSocDescBox?window.buildSocDescBox(id,'Job description'):'');
    h+='<div class="sct" style="margin-top:12px">AI Resilience (Work Context)</div>';
    h+='<div class="scs">AI resilience is how much of this job depends on things AI can\'t replace &mdash; personal relationships and trust, accountability when mistakes are costly, and work that has to be exactly right. The higher these values, the harder it is to take the human out of the work.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">AI Resilience</div><div class="vl">'+wcMetricChip({d:fmtNum(o.res,1),r:o.res})+'</div><div class="mt">How hard the human side of this job is to replace</div></div>';
    h+='<div class="sc-box"><div class="lb">Contact With Others</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'contact'))+'</div><div class="mt">Relationship-driven work is resilient to automation</div></div>';
    h+='<div class="sc-box"><div class="lb">Consequence of Error</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'error'))+'</div><div class="mt">Costly mistakes keep an accountable human in the loop</div></div>';
    h+='<div class="sc-box"><div class="lb">Impact of Decisions</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'impact'))+'</div><div class="mt">High-stakes judgment is the last thing handed to AI</div></div>';
    h+='<div class="sc-box"><div class="lb">Exact or Accurate</div><div class="vl" style="font-size:1rem">'+wcMetricChip(wcMetric(o,'exact'))+'</div><div class="mt">Where errors are unacceptable, humans still verify</div></div>';
    h+='</div>';
    if(occStats){
      h+='<div class="sct" style="margin-top:12px">AI Augmentation Score</div>';
      h+='<div class="scs">Based on how people actually use AI on this occupation\'s tasks today. A positive score means AI mostly acts as an assistant that makes the worker faster and better; a negative score means AI tends to do the tasks outright. Coverage shows how much of the job AI touches at all.</div>';
      h+='<div class="sc-row">';
      h+='<div class="sc-box"><div class="lb">AI Score (Chat)</div><div class="vl '+cls(occStats.s)+'">'+f2(occStats.s)+'</div><div class="mt"><span class="bg '+occStats.ct+'" style="font-size:.6rem;padding:1px 7px">'+CL[occStats.ct]+'</span></div></div>';
      h+='<div class="sc-box"><div class="lb">AI Coverage</div><div class="vl" style="font-size:1.4rem">'+occStats.ai+' <span style="font-size:.9rem;color:var(--t3)">/ '+totalTasks+'</span></div><div class="mt">'+pct(occStats.cv)+' coverage</div></div>';
      h+='<div class="sc-box"><div class="lb">Automation vs Augmentation</div><div style="margin-top:8px"><div class="br"><div class="bl">Auto</div><div class="bt"><div class="bfa" style="width:'+pct(occStats.au)+'"></div></div><div class="bv n">'+pct(occStats.au)+'</div></div><div class="br"><div class="bl">Aug</div><div class="bt"><div class="bfg" style="width:'+pct(occStats.ag)+'"></div></div><div class="bv p">'+pct(occStats.ag)+'</div></div></div></div>';
      h+='</div>';
      if(occStats.sparse) h+='<div class="inline-note">Note: an occupation\'s AI score is set to 0 when it has only one AI-exposed task, or when fewer than 10% of its tasks show AI usage — too little evidence to score it reliably. This occupation has '+occStats.ai+' AI-exposed task'+(occStats.ai===1?'':'s')+' across '+totalTasks+' tasks ('+pct(occStats.cv)+' coverage), so its AI score is shown as 0.</div>';
      if(!fromResilienceTab) h+=buildAiOnlyTaskTable(id);
    }
    h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
    return h;
  };
  wcDetail = function(id){ var pnl=document.getElementById('pnl'); if(!pnl)return; pnl.innerHTML=buildWCDetail(id); document.getElementById('ov').classList.add('open'); document.body.style.overflow='hidden'; var xb=document.getElementById('xb'); if(xb)xb.onclick=cld; };

  function mean(arr){ var s=0; for(var i=0;i<arr.length;i++) s+=arr[i]; return arr.length?s/arr.length:0; }
  function sd(arr,m){ if(arr.length<2) return 0; var s=0; for(var i=0;i<arr.length;i++){ var d=arr[i]-m; s+=d*d; } return Math.sqrt(s/arr.length); }
  buildAiWcData = function(){
    var pts=[];
    for(var i=0;i<OCC.length;i++){
      var o=OCC[i], d=occAdjusted(o.id), w=WCM[o.id]||WCM[baseSoc(o.id)];
      if(nil(d.s) || !w || nil(w.res)) continue;
      pts.push({id:o.id,n:o.n,base:baseSoc(o.id),x:d.s,y:w.res,auto:d.au,aug:d.ag,cat:d.ct,wc:w});
    }
    var xs=[], ys=[];
    for(var j=0;j<pts.length;j++){ xs.push(pts[j].x); ys.push(pts[j].y); }
    var mx=mean(xs), my=mean(ys), sdx=sd(xs,mx), sdy=sd(ys,my);
    for(var k=0;k<pts.length;k++){
      pts[k].xz=sdx?(pts[k].x-mx)/sdx:0;
      pts[k].yz=sdy?(pts[k].y-my)/sdy:0;
      pts[k].cz=pts[k].xz+pts[k].yz;
    }
    var benefit=pts.slice().sort(function(a,b){return b.cz-a.cz||b.x-a.x||b.y-a.y}).slice(0,20);
    var suffer=pts.slice().sort(function(a,b){return a.cz-b.cz||a.x-b.x||a.y-b.y}).slice(0,20);
    var marks={};
    for(var bi=0;bi<benefit.length;bi++) marks[benefit[bi].id]={kind:'benefit',rank:bi+1};
    for(var si=0;si<suffer.length;si++) if(!marks[suffer[si].id]) marks[suffer[si].id]={kind:'suffer',rank:si+1};
    var ys2=ys.slice().sort(function(a,b){return a-b});
    var medianY=ys2.length?(ys2.length%2?ys2[(ys2.length-1)/2]:(ys2[ys2.length/2-1]+ys2[ys2.length/2])/2):3;
    function quadOf(p){ return p.y>=medianY ? (p.x<0?'TL':'TR') : (p.x<0?'BL':'BR'); }
    function quadScore(p,q){
      var yp=Math.max(0,p.yz), yn=Math.max(0,-p.yz), xp=Math.max(0,p.xz), xn=Math.max(0,-p.xz);
      return q==='TL'?yp*xn : q==='TR'?yp*xp : q==='BL'?yn*xn : yn*xp;
    }
    var byQuad={TL:[],TR:[],BL:[],BR:[]};
    for(var qi=0;qi<pts.length;qi++) byQuad[quadOf(pts[qi])].push(pts[qi]);
    var quadReps=[], quadMarks={}, QORDER=['TL','TR','BL','BR'];
    for(var qq=0;qq<QORDER.length;qq++){
      var qk=QORDER[qq];
      var arr=byQuad[qk].slice().sort((function(key){return function(a,b){return quadScore(b,key)-quadScore(a,key)};})(qk)).slice(0,5);
      for(var ari=0;ari<arr.length;ari++){ quadMarks[arr[ari].id]={quad:qk,rank:ari+1}; quadReps.push(arr[ari]); }
    }
    return {points:pts,benefit:benefit,suffer:suffer,marks:marks,medianY:medianY,quadReps:quadReps,quadMarks:quadMarks};
  };
  makeAiWcList = function(arr){
    function headCell(label,tip,extraCls){return '<div class="cell'+(extraCls?' '+extraCls:'')+'" title="'+esc(tip)+'"><span class="tip-label">'+esc(label)+'</span></div>'}
    var h='<div class="sum-list-head">'
      + headCell('#','Rank within this top-20 list.')
      + headCell('Occupation','Occupation title from O*NET.')
      + headCell('AI score','Net AI augmentation vs. automation score.','num')
      + headCell('AI (Z Score)','Standardized AI score across plotted occupations.','num')
      + headCell('AI Resilience','Average of the four featured work-context values.','num')
      + headCell('Resilience (Z Score)','Standardized resilience score across plotted occupations.','num')
      + headCell('Combined (Z Score)','AI z-score plus resilience z-score.','num')
      + '</div>';
    for(var i=0;i<arr.length;i++){
      var p=arr[i], aiCls=p.x>0?'p':p.x<0?'n':'z', combCls=p.cz>0?'p':p.cz<0?'n':'z';
      h+='<div class="sum-item" data-id="'+p.id+'"><div class="cell rk">'+(i+1)+'</div><div class="cell nm">'+esc(p.n)+'</div><div class="cell num m '+aiCls+'">'+fmtSigned2(p.x)+'</div><div class="cell num m">'+fmtSigned2(p.xz)+'</div><div class="cell num">'+scoreChip(p.y)+'</div><div class="cell num m">'+fmtSigned2(p.yz)+'</div><div class="cell num m '+combCls+'">'+fmtSigned2(p.cz)+'</div></div>';
    }
    return h;
  };
  showAiWcTip = function(ev,p){
    var tip=document.getElementById('aiwcTip'),card=document.getElementById('aiwcCard');
    if(!tip||!card)return;
    tip.innerHTML='<b>'+esc(p.n)+'</b><br><span style="font-family:IBM Plex Mono,monospace;color:var(--t4)">'+p.id+' &middot; SOC '+p.base+'</span><br>AI score: <span class="'+(p.x>0?'p':p.x<0?'n':'z')+'">'+fmtSigned2(p.x)+'</span><br>AI: '+fmtSigned2(p.xz)+' (Z Score)<br>AI Resilience: '+fmtNum(p.y,2)+'<br>Resilience: '+fmtSigned2(p.yz)+' (Z Score)<br>Combined: '+fmtSigned2(p.cz)+' (Z Score)<br>Click to open the occupation drill-down';
    tip.style.display='block';
    var rect=card.getBoundingClientRect(), x=ev.clientX-rect.left+14, y=ev.clientY-rect.top+14;
    x=Math.min(x,rect.width-330); y=Math.min(y,rect.height-140); if(x<10)x=10; if(y<10)y=10;
    tip.style.left=x+'px'; tip.style.top=y+'px';
  };
  renderAiWc = function(){
    var _va=document.getElementById('vAiWc'); if(_va&&_va.style.display==='none') return;
    var svg=document.getElementById('aiwcSvg'); if(!svg) return;
    var data=buildAiWcData();
    var note=document.getElementById('aiwcNote');
    if(note) note.textContent='Horizontal axis = AI augmentation vs. automation score. Vertical axis = AI Resilience, split at the median. Hover any point for the occupation, and click a point to open the AI Resilience drill-down.';
    var ben=document.getElementById('aiwcBenefit'),suf=document.getElementById('aiwcSuffer');
    if(ben) ben.innerHTML=makeAiWcList(data.benefit);
    if(suf) suf.innerHTML=makeAiWcList(data.suffer);
    var W=1280,H=620,L=210,R=990,T=34,B=542,PW=R-L,PH=B-T;
    var absRaw=1; for(var i=0;i<data.points.length;i++) absRaw=Math.max(absRaw,Math.abs(data.points[i].x));
    var absX=Math.ceil(absRaw*1.1); if(absX<5)absX=5;
    var xMin=-absX,xMax=absX,yMin=2,yMax=5;
    function xScale(v){return L+(v-xMin)/(xMax-xMin)*PW}
    function yScale(v){return T+(yMax-v)/(yMax-yMin)*PH}
    function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
    function axisLabel(v){var av=Math.abs(v),s=av>=10?String(Math.round(v)):String(Math.round(v*10)/10);return s.replace(/\.0$/,'')}
    function escAttr(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
    function intersects(a,b,pad){pad=pad||0; return !(a.x2+pad<b.x1 || a.x1>b.x2+pad || a.y2+pad<b.y1 || a.y1>b.y2+pad)}
    var x0=xScale(0),yMidVal=(data&&isFinite(data.medianY))?data.medianY:3.5,yMid=yScale(yMidVal);
    var h='';
    h+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="transparent"/>';
    h+='<rect x="'+L+'" y="'+T+'" width="'+(x0-L)+'" height="'+(yMid-T)+'" fill="rgba(251,191,36,.04)"/>';
    h+='<rect x="'+x0+'" y="'+T+'" width="'+(R-x0)+'" height="'+(yMid-T)+'" fill="rgba(52,211,153,.05)"/>';
    h+='<rect x="'+L+'" y="'+yMid+'" width="'+(x0-L)+'" height="'+(B-yMid)+'" fill="rgba(248,113,113,.05)"/>';
    h+='<rect x="'+x0+'" y="'+yMid+'" width="'+(R-x0)+'" height="'+(B-yMid)+'" fill="rgba(76,154,255,.04)"/>';
    for(var y=2;y<=5;y++){var yy=yScale(y);h+='<text x="'+(L-12)+'" y="'+(yy+4)+'" fill="var(--t4)" font-size="12" text-anchor="end">'+y+'</text>'}
    var xticks=[xMin,xMin/2,0,xMax/2,xMax];
    for(var xt=0;xt<xticks.length;xt++){var xv=xticks[xt],xx=xScale(xv);h+='<text x="'+xx+'" y="'+(B+22)+'" fill="var(--t4)" font-size="12" text-anchor="middle">'+axisLabel(xv)+'</text>'}
    h+='<line x1="'+L+'" y1="'+yMid+'" x2="'+R+'" y2="'+yMid+'" stroke="rgba(255,255,255,.28)" stroke-width="1.4" stroke-dasharray="5 4"/>';
    h+='<line x1="'+x0+'" y1="'+T+'" x2="'+x0+'" y2="'+B+'" stroke="rgba(255,255,255,.18)" stroke-width="1.4"/>';
    h+='<rect x="'+L+'" y="'+T+'" width="'+PW+'" height="'+PH+'" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/>';
    h+='<text x="'+(L+16)+'" y="'+(T+18)+'" fill="rgba(251,191,36,.9)" font-size="12" font-weight="700">Automation usage but occupation is resilient to AI</text>';
    h+='<text x="'+(R-16)+'" y="'+(T+18)+'" fill="rgba(52,211,153,.95)" font-size="12" font-weight="700" text-anchor="end">Benefit from AI</text>';
    h+='<text x="'+(L+16)+'" y="'+(B-14)+'" fill="rgba(248,113,113,.95)" font-size="12" font-weight="700">Suffer most from AI</text>';
    h+='<text x="'+(R-16)+'" y="'+(B-14)+'" fill="rgba(76,154,255,.95)" font-size="12" font-weight="700" text-anchor="end">Augmentation usage but AI displacement risk remains</text>';
    h+='<text x="'+((L+R)/2)+'" y="'+(H-18)+'" fill="var(--t3)" font-size="13" text-anchor="middle">AI augmentation vs. automation score</text>';
    h+='<text x="'+(L+6)+'" y="'+(H-36)+'" fill="var(--red)" font-size="12">More automation risk</text>';
    h+='<text x="'+(R-6)+'" y="'+(H-36)+'" fill="var(--grn)" font-size="12" text-anchor="end">More augmentation gain</text>';
    h+='<text transform="translate('+(L-12)+' '+((T+B)/2)+') rotate(-90)" fill="var(--t3)" font-size="13" text-anchor="middle">AI Resilience Score</text>';
    function quadFill(p){ return ((p.x<0&&p.y>=yMidVal)||(p.x>0&&p.y<yMidVal))?'#fbbf24':(p.x>0?'#34d399':p.x<0?'#f87171':'#a8b8cc'); }
    function quadLabelFill(p){ return ((p.x<0&&p.y>=yMidVal)||(p.x>0&&p.y<yMidVal))?'rgba(251,191,36,.98)':(p.x>0?'rgba(52,211,153,.98)':'rgba(248,113,113,.98)'); }
    for(var pi=0;pi<data.points.length;pi++){
      var p=data.points[pi],mark=data.quadMarks[p.id],cx=xScale(p.x),cy=clamp(yScale(p.y),T,B),fill=quadFill(p),op=mark?.95:.33,r=mark?5.6:3.2;
      p.cx=cx; p.cy=cy;
      h+='<circle class="aiwc-pt" data-id="'+escAttr(p.id)+'" cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" fill-opacity="'+op+'" stroke="'+fill+'" stroke-opacity="'+(mark?.55:.18)+'" stroke-width="'+(mark?1.6:1)+'" style="cursor:pointer" />';
    }
    var taken=[];
    var labels=data.quadReps.slice();
    labels.sort(function(a,b){return (Math.abs(b.xz)+Math.abs(b.yz)) - (Math.abs(a.xz)+Math.abs(a.yz)) || (a.n<b.n?-1:1)});
    function overlapArea(c){
      var s=0;
      for(var ti=0;ti<taken.length;ti++){
        var t=taken[ti];
        var ox=Math.min(c.x2,t.x2)-Math.max(c.x1,t.x1);
        var oy=Math.min(c.y2,t.y2)-Math.max(c.y1,t.y1);
        if(ox>0&&oy>0) s+=ox*oy;
      }
      return s;
    }
    function inBounds(c){ return c.x1>=4 && c.x2<=W-4 && c.y1>=T+2 && c.y2<=B-2; }
    for(var li=0;li<labels.length;li++){
      var p=labels[li], txt=trimLabel(p.n,44), w=Math.max(48,txt.length*5.6);
      var fill=quadLabelFill(p);
      // Candidate label boxes placed immediately next to the dot (no side extension lines).
      var cand=[
        {anchor:'start', tx:p.cx+9, ty:p.cy+3.5, x1:p.cx+7, x2:p.cx+9+w, y1:p.cy-6, y2:p.cy+7},
        {anchor:'end',   tx:p.cx-9, ty:p.cy+3.5, x1:p.cx-9-w, x2:p.cx-7, y1:p.cy-6, y2:p.cy+7},
        {anchor:'middle',tx:p.cx,   ty:p.cy-11,  x1:p.cx-w/2, x2:p.cx+w/2, y1:p.cy-20, y2:p.cy-7},
        {anchor:'middle',tx:p.cx,   ty:p.cy+17,  x1:p.cx-w/2, x2:p.cx+w/2, y1:p.cy+7, y2:p.cy+20},
        {anchor:'start', tx:p.cx+9, ty:p.cy-9,   x1:p.cx+7, x2:p.cx+9+w, y1:p.cy-18, y2:p.cy-5},
        {anchor:'end',   tx:p.cx-9, ty:p.cy-9,   x1:p.cx-9-w, x2:p.cx-7, y1:p.cy-18, y2:p.cy-5},
        {anchor:'start', tx:p.cx+9, ty:p.cy+16,  x1:p.cx+7, x2:p.cx+9+w, y1:p.cy+7, y2:p.cy+20},
        {anchor:'end',   tx:p.cx-9, ty:p.cy+16,  x1:p.cx-9-w, x2:p.cx-7, y1:p.cy+7, y2:p.cy+20}
      ];
      var placed=null, best=null, bestScore=Infinity;
      for(var ci=0;ci<cand.length;ci++){
        var c=cand[ci];
        if(!inBounds(c)) continue;
        var sc=overlapArea(c);
        if(sc===0){ placed=c; break; }
        if(sc<bestScore){ bestScore=sc; best=c; }
      }
      var chosen = placed || best || cand[p.x>=0?0:1];
      chosen.text=txt; chosen.fill=fill; chosen.dotx=p.cx; chosen.doty=p.cy; taken.push(chosen);
    }
    function nudgeBox(box,dy){
      var y1=box.y1+dy, y2=box.y2+dy;
      if(y1<T+6){ dy+=(T+6-y1); } else if(y2>B-6){ dy-=(y2-(B-6)); }
      box.y1+=dy; box.y2+=dy; box.ty+=dy;
    }
    for(var _it=0;_it<80;_it++){
      var _moved=false;
      for(var _ia=0;_ia<taken.length;_ia++) for(var _ib=_ia+1;_ib<taken.length;_ib++){
        var _A=taken[_ia], _B=taken[_ib];
        if(Math.min(_A.x2,_B.x2)-Math.max(_A.x1,_B.x1) <= 2) continue;
        var _need=(_A.y2-_A.y1)/2+(_B.y2-_B.y1)/2+4;
        var _ca=(_A.y1+_A.y2)/2, _cb=(_B.y1+_B.y2)/2, _cur=Math.abs(_ca-_cb);
        if(_cur<_need){ var _d=(_need-_cur)/2+0.5, _s=(_ca<=_cb)?-1:1; nudgeBox(_A,_s*_d); nudgeBox(_B,-_s*_d); _moved=true; }
      }
      if(!_moved) break;
    }
    for(var ti=0;ti<taken.length;ti++){
      var t=taken[ti];
      var nearX=t.anchor==='start'?t.x1:(t.anchor==='end'?t.x2:t.tx), nearY=t.ty-3;
      var _dx=nearX-t.dotx, _dy=nearY-t.doty;
      if(Math.sqrt(_dx*_dx+_dy*_dy)>16){
        h+='<line x1="'+t.dotx+'" y1="'+t.doty+'" x2="'+nearX+'" y2="'+nearY+'" stroke="'+t.fill+'" stroke-opacity="0.35" stroke-width="0.8" style="pointer-events:none"/>';
      }
      h+='<text x="'+t.tx+'" y="'+t.ty+'" fill="'+t.fill+'" font-size="9.5" font-weight="600" text-anchor="'+t.anchor+'" paint-order="stroke" stroke="rgba(7,9,15,.96)" stroke-width="2.4" stroke-linejoin="round" style="pointer-events:none">'+esc(t.text)+'</text>';
    }
    svg.innerHTML=h;
    var ptById={};for(var qi=0;qi<data.points.length;qi++)ptById[data.points[qi].id]=data.points[qi];
    function aiwcPt(ev){var t=ev.target;return(t&&t.classList&&t.classList.contains('aiwc-pt'))?t:null}
    svg.onmousemove=function(ev){var t=aiwcPt(ev);if(t){var p=ptById[t.getAttribute('data-id')];if(p)showAiWcTip(ev,p)}};
    svg.onmouseout=function(ev){if(aiwcPt(ev))hideAiWcTip()};
    svg.onclick=function(ev){var t=aiwcPt(ev);if(t)wcDetail(t.getAttribute('data-id'))};
  };

  refreshWcSummaries();
  if(typeof renderWC==='function') renderWC();
  if(typeof renderAiWc==='function') renderAiWc();
  showView((location.hash||'#tbl').replace('#',''));
})();
/* ---- end v6 clean override ---- */




/* ---- industry tabs patch ---- */
(function(){
  var IDATA=(window.DASHBOARD_DATA&&window.DASHBOARD_DATA.INDUSTRY)||{};
  var IND_OCC=(IDATA.occupationRows)||[];
  var IMETA=IDATA.meta||{};

  var indQry='',indSort='industrialFundamentalScore',indSortDir=-1,indPrimary='';
  var priQry='',priSort='combinedInvestmentScore',priSortDir=-1,priPrimary='';
  var PRI_ROWS=[], PRI_MAP={}, PRI_MEDIAN_RES=0;
  var PRIMARY_LIST=(function(){
    var seen={}, out=[];
    for(var i=0;i<IND_OCC.length;i++){
      var p=String(IND_OCC[i]&&IND_OCC[i].primaryIndustry||'Unspecified').trim()||'Unspecified';
      if(!seen[p]){ seen[p]=1; out.push(p); }
    }
    return out.sort(function(a,b){ return a.toLowerCase()<b.toLowerCase()?-1:a.toLowerCase()>b.toLowerCase()?1:0; });
  })();

  function fmtMoneyCompact(v){
    if(nil(v)) return '—';
    var n=Number(v); if(!isFinite(n)) return esc(String(v));
    var abs=Math.abs(n), suffix='', div=1;
    if(abs>=1e12){suffix='T';div=1e12;}
    else if(abs>=1e9){suffix='B';div=1e9;}
    else if(abs>=1e6){suffix='M';div=1e6;}
    else if(abs>=1e3){suffix='K';div=1e3;}
    return '$'+(n/div).toLocaleString(undefined,{maximumFractionDigits:1,minimumFractionDigits:abs>=1e3?1:0})+suffix;
  }
  function fmtPctSigned(v){ if(nil(v)) return '—'; var n=Number(v); if(!isFinite(n)) return esc(String(v)); return (n>=0?'+':'')+(n*100).toFixed(2)+'%'; }
  function fmtAge(v){ if(nil(v)) return '—'; var n=Number(v); if(!isFinite(n)) return esc(String(v)); return n.toFixed(1); }
  function fmtAgeChange(v){ if(nil(v)) return '—'; var n=Number(v); if(!isFinite(n)) return esc(String(v)); return (n>=0?'+':'')+n.toFixed(1)+' yrs'; }
  function fmtRefYears(v){ return nil(v)?'—':esc(String(v)); }
  function compareMixed(a,b,key,dir){
    var va=a[key], vb=b[key], an=nil(va), bn=nil(vb);
    if(typeof va==='string' || typeof vb==='string'){
      if(an&&bn) return 0; if(an) return 1; if(bn) return -1;
      va=String(va).toLowerCase(); vb=String(vb).toLowerCase();
      return dir*(va<vb?-1:va>vb?1:0);
    }
    if(an&&bn) return 0; if(an) return 1; if(bn) return -1;
    va=Number(va); vb=Number(vb);
    if(va===vb){
      var na=String(a.occupation||a.industry||'').toLowerCase(), nb=String(b.occupation||b.industry||'').toLowerCase();
      return na<nb?-1:na>nb?1:0;
    }
    return dir*(va-vb);
  }
  function localMean(arr){ var s=0; for(var i=0;i<arr.length;i++) s+=arr[i]; return arr.length?s/arr.length:0; }
  function localSd(arr,m){ if(arr.length<2) return 0; var s=0; for(var i=0;i<arr.length;i++){ var d=arr[i]-m; s+=d*d; } return Math.sqrt(s/arr.length); }
  function localMedian(arr){ if(!arr.length) return 0; arr=arr.slice().sort(function(a,b){return a-b}); var mid=Math.floor(arr.length/2); return arr.length%2?arr[mid]:(arr[mid-1]+arr[mid])/2; }
  function avg3(a,b,c){ return (a+b+c)/3; }
  function scoreClsPct(v){ return Number(v)>0?'p':Number(v)<0?'n':'z'; }
  function resilienceCls(v){ return Number(v)>=PRI_MEDIAN_RES?'res-good':'res-bad'; }
  function primaryOptionsHtml(selected){
    var h='<option value="">All primary industries</option>';
    for(var i=0;i<PRIMARY_LIST.length;i++) h+='<option value="'+esc(PRIMARY_LIST[i])+'"'+(PRIMARY_LIST[i]===selected?' selected':'')+'>'+esc(PRIMARY_LIST[i])+'</option>';
    return h;
  }
  function industrialFundamentalForRow(r){
    if(!r) return 0;
    var w=(window.SCORE_WEIGHTS&&window.SCORE_WEIGHTS.industrial)||{histEmp:0.25,histWage:0.25,projEmp:0.25,medianAge:0.25};
    var pairs=[
      ['histEmp','histEmploymentGrowthZ'],
      ['histWage','histWageGrowthZ'],
      ['projEmp','projectedEmploymentGrowthZ'],
      ['medianAge','medianAge2025Z']
    ];
    var sum=0,wSum=0;
    for(var i=0;i<pairs.length;i++){
      var z=Number(r[pairs[i][1]]);
      if(!isFinite(z)) continue;
      var wt=Number(w[pairs[i][0]])||0;
      if(wt<=0) continue;
      sum+=z*wt; wSum+=wt;
    }
    return wSum>0 ? sum/wSum : 0;
  }
  window.industrialFundamentalForRow=industrialFundamentalForRow;

  function buildPriorityRows(){
    var base=[];
    for(var i=0;i<IND_OCC.length;i++) if(IND_OCC[i]) base.push(IND_OCC[i]);

    // Pull weighted resilience and AI benefit scores from the cross-tab coordinator (if loaded)
    var getResilienceRaw = window.getResilienceRaw || function(){ return null; };
    var getResilienceZ   = window.getResilienceZ   || function(){ return null; };
    var getAiBenefit     = window.getAiBenefit     || function(){ return null; };
    var getAiAugZ        = window.getAiAugZ        || function(){ return null; };
    var getDifferentiationZ = window.getDifferentiationZ || function(){ return 0; };

    var xs=[], ys=[];
    for(var j=0;j<base.length;j++){
      var occStats=typeof occAdjusted==='function' ? occAdjusted(base[j].id) : null;
      var ai=occStats && isFinite(Number(occStats.s)) ? Number(occStats.s) : Number(base[j].aiScore);
      var resWeighted=getResilienceRaw(base[j].id);
      var res=isFinite(Number(resWeighted)) ? Number(resWeighted) : Number(base[j].aiResilience);
      if(isFinite(ai)) xs.push(ai);
      if(isFinite(res)) ys.push(res);
    }
    var mx=localMean(xs), my=localMean(ys);
    var sdx=localSd(xs,mx), sdy=localSd(ys,my);
    PRI_MEDIAN_RES=localMedian(ys);

    var priW=(window.SCORE_WEIGHTS&&window.SCORE_WEIGHTS.priority)||{aiBenefit:1/3,resilience:1/3,industrial:1/3};

    PRI_ROWS=[]; PRI_MAP={};
    for(var k=0;k<base.length;k++){
      var r=base[k];
      var occStats=typeof occAdjusted==='function' ? occAdjusted(r.id) : null;
      var ai2=occStats && isFinite(Number(occStats.s)) ? Number(occStats.s) : Number(r.aiScore);
      var resWeighted2=getResilienceRaw(r.id);
      var res2=isFinite(Number(resWeighted2)) ? Number(resWeighted2) : Number(r.aiResilience);
      var fund2=industrialFundamentalForRow(r);
      ai2=isFinite(ai2)?ai2:0; res2=isFinite(res2)?res2:0; fund2=isFinite(fund2)?fund2:0;

      var aiAugZ = isFinite(Number(getAiAugZ(r.id))) ? Number(getAiAugZ(r.id)) : (sdx?(ai2-mx)/sdx:0);
      var diffZ  = Number(getDifferentiationZ(r.id))||0;
      var resZ   = isFinite(Number(getResilienceZ(r.id))) ? Number(getResilienceZ(r.id)) : (sdy?(res2-my)/sdy:0);
      var benefitFromCoord = getAiBenefit(r.id);
      var aiBenefit = isFinite(Number(benefitFromCoord)) ? Number(benefitFromCoord)
        : ((window.SCORE_WEIGHTS&&window.SCORE_WEIGHTS.aiBenefit
            ? (window.SCORE_WEIGHTS.aiBenefit.augmentation*aiAugZ + window.SCORE_WEIGHTS.aiBenefit.differentiation*diffZ)
            : (0.5*aiAugZ + 0.5*diffZ)));

      var row={
        id:r.id,
        occupation:r.occupation,
        industry:r.industry,
        primaryIndustry:String(r.primaryIndustry||'Unspecified')||'Unspecified',
        naics:r.naics,
        industrySize:r.industrySize,
        avgSalary:r.avgSalary,
        employment:r.employment,
        histEmploymentGrowth:r.histEmploymentGrowth,
        histWageGrowth:r.histWageGrowth,
        projectedEmploymentGrowth:r.projectedEmploymentGrowth,
        industryGrowthScore:r.industryGrowthScore,
        industrialFundamentalScore:fund2,
        medianAge2019:r.medianAge2019,
        medianAge2022:r.medianAge2022,
        medianAge2025:r.medianAge2025,
        referenceIncreaseInAgeYears:r.referenceIncreaseInAgeYears,
        medianAgeIncrease:r.medianAgeIncrease,
        aiScore:ai2,
        aiResilience:res2,
        aiScoreZ:aiAugZ,
        aiResilienceZ:resZ,
        differentiationZ:diffZ,
        aiBenefitScore:aiBenefit,
        service:!!r.service,
        sparse:!!(occStats&&occStats.sparse)
      };

      // Combined Z-Score: user-weighted average of AI Benefit, AI Resilience Z, Industrial Fundamental
      var cs=0,cw=0;
      var benefitW=Number(priW.aiBenefit)||0;  if(benefitW>0){ cs+=aiBenefit*benefitW; cw+=benefitW; }
      var resW=Number(priW.resilience)||0;     if(resW>0){    cs+=resZ*resW;       cw+=resW;    }
      var indW=Number(priW.industrial)||0;     if(indW>0){    cs+=fund2*indW;      cw+=indW;    }
      row.combinedInvestmentScore = cw>0 ? cs/cw : 0;

      PRI_ROWS.push(row); PRI_MAP[row.id]=row;
    }
    PRI_ROWS.sort(function(a,b){
      return (b.combinedInvestmentScore-a.combinedInvestmentScore)
        || (b.aiBenefitScore-a.aiBenefitScore)
        || (b.aiResilienceZ-a.aiResilienceZ)
        || (b.industrialFundamentalScore-a.industrialFundamentalScore)
        || compareMixed(a,b,'occupation',1);
    });
    for(var qi=0;qi<PRI_ROWS.length;qi++) PRI_ROWS[qi].rank=qi+1;
  }
  window.buildPriorityRows = buildPriorityRows;

  function ensureButton(nav, viewId, label, beforeNode){
    if(!nav || nav.querySelector('[data-v="'+viewId+'"]')) return;
    var btn=document.createElement('button');
    btn.className='nb'; btn.setAttribute('data-v',viewId); btn.textContent=label;
    nav.insertBefore(btn, beforeNode||null);
  }

  function insertIndustryViews(){
    var nav=document.getElementById('nav');
    if(nav){
      var metBtn=nav.querySelector('[data-v="met"]');
      ensureButton(nav,'pri','Investing View',metBtn||null);
      ensureButton(nav,'ind','Industry Fundamentals',metBtn||null);
      var priBtn=nav.querySelector('[data-v="pri"]'); if(priBtn) priBtn.textContent='Investing View';
      var wcBtn=nav.querySelector('[data-v="wc"]'); if(wcBtn) wcBtn.textContent='AI Resilience';
    }
    var met=document.getElementById('vMet');
    if(met && !document.getElementById('vInd')){
      var ind=document.createElement('div');
      ind.id='vInd'; ind.style.display='none';
      ind.innerHTML=''
        +'<div class="tab-summary"><b>Industry Data:</b> This tab shows the industry fundamentals (mapped by occupation) by growth and labor shortage factor.</div>'
        +'<div class="ctrl"><div class="filter-row ind-filter-row"><div class="sbox"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="indQry" type="text" placeholder="Search occupations, mapped industries, or NAICS codes..."></div><select id="indPrimary"><option>Loading primary industries...</option></select></div></div>'
        +'<div class="ls-note ind-data-note" style="margin:2px 32px 0;font-size:.72rem;color:var(--t3)">&ldquo;—&rdquo; indicates data is not available from BLS data.</div>'
        +'<div class="sts" id="indCnt"></div>'
        +'<div class="main"><div class="tw ind-table-wrap"><div class="tsc ind-tsc"><table class="industry-table"><thead id="indTh"><tr></tr></thead><tbody id="indTb"></tbody></table></div></div></div>';
      var takeGrid=document.querySelector('#vTake .take-grid');
      var takeHtml=takeGrid?takeGrid.outerHTML:'';
      var treeHtml=''
        +'<div class="tree">'
        +  '<div class="tree-top"><div class="tnode tnode-root"><div class="tn-h"><span>Investment Priority Score</span><span class="tn-w">Combined Z Score</span></div><div class="tdesc">User-weighted average of the three pillars below (default 33% each). Higher = a more attractive occupation-led sub-vertical to invest in.</div></div></div>'
        +  '<div class="tree-stem"></div>'
        +  '<div class="tree-cols">'
        +    '<div class="tree-col">'
        +      '<div class="tnode tnode-pillar"><div class="tn-h"><span>AI Benefit Score</span><span class="tn-w">33%</span></div><div class="tdesc">How much AI is likely to help the occupation.</div></div>'
        +      '<div class="tleaves">'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Augmentation Score (Z Score)</span><span class="tn-w">70%</span></div><div class="tdesc">Whether observed AI use augments vs. automates the occupation\'s tasks.</div></div>'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Differentiation Score (Z Score)</span><span class="tn-w">30%</span></div><div class="tdesc">Wage dispersion (P90-P10)/median; higher = more room to differentiate on skill.</div></div>'
        +      '</div>'
        +    '</div>'
        +    '<div class="tree-col">'
        +      '<div class="tnode tnode-pillar"><div class="tn-h"><span>AI Resilience</span><span class="tn-w">33%</span></div><div class="tdesc">How critical human involvement is to the work.</div></div>'
        +      '<div class="tleaves">'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Contact With Others</span><span class="tn-w">25%</span></div><div class="tdesc">Importance of interpersonal contact in the role.</div></div>'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Consequence of Error</span><span class="tn-w">25%</span></div><div class="tdesc">How serious mistakes on the job would be.</div></div>'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Impact of Decisions</span><span class="tn-w">25%</span></div><div class="tdesc">Impact of decisions on coworkers or company results.</div></div>'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Exact / Accurate</span><span class="tn-w">25%</span></div><div class="tdesc">Importance of being exact or accurate.</div></div>'
        +      '</div>'
        +    '</div>'
        +    '<div class="tree-col">'
        +      '<div class="tnode tnode-pillar"><div class="tn-h"><span>Industry Fundamental Score</span><span class="tn-w">33%</span></div><div class="tdesc">Industry growth and labor-shortage signals.</div></div>'
        +      '<div class="tleaves">'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Historical Employment Growth</span><span class="tn-w">25%</span></div><div class="tdesc">2019-2024 OEWS employment CAGR.</div></div>'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Historical Wage Growth</span><span class="tn-w">25%</span></div><div class="tdesc">2019-2024 OEWS wage CAGR.</div></div>'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>Projected Employment Growth</span><span class="tn-w">25%</span></div><div class="tdesc">2024-2034 BLS projected employment CAGR.</div></div>'
        +        '<div class="tnode tnode-leaf"><div class="tn-h"><span>2025 Median Age</span><span class="tn-w">25%</span></div><div class="tdesc">Older workforce signals labor shortage / succession opportunity.</div></div>'
        +      '</div>'
        +    '</div>'
        +  '</div>'
        +  '<div class="scs" style="margin-top:16px">Weights are adjustable: AI Benefit weights on the AI Benefit tab, AI Resilience weights on the AI Resilience tab, Industry Fundamental weights on the Industry Fundamentals tab, and the three pillar weights in the Priority Industries for Investment section below.</div>'
        +'</div>';
      var pri=document.createElement('div');
      pri.id='vPri'; pri.style.display='none';
      pri.innerHTML=''
        +'<div class="tab-summary"><b>Investing View:</b> This tab ranks sub-verticals by investment attractiveness in the age of AI, combining three lenses: (1) how much AI augments the industry; (2) how resilient the industry is to technology shock / how critical the human element is to service delivery; (3) industry fundamentals in terms of growth and labor shortage. More detail for each element can be found in the other tabs.</div>'
        +'<details class="collapse-card">'
        +  '<summary><span class="cc-caret">&#9654;</span>Key Investment Takeaways and Limitations<span class="cc-sub">Click to expand</span></summary>'
        +  '<div class="collapse-body">'+takeHtml+'</div>'
        +'</details>'
        +'<details class="collapse-card">'
        +  '<summary><span class="cc-caret">&#9654;</span>Investment Scoring Methodology<span class="cc-sub">Click to expand</span></summary>'
        +  '<div class="collapse-body">'+treeHtml+'</div>'
        +'</details>'
        +'<details class="collapse-card" open>'
        +  '<summary><span class="cc-caret">&#9654;</span>Priority Industries for Investment</summary>'
        +  '<div class="collapse-body">'
        +    '<div class="ctrl"><div class="filter-row"><div class="sbox"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="priQry" type="text" placeholder="Search occupations, mapped industries, or NAICS codes..."></div><select id="priPrimary"><option>Loading primary industries...</option></select></div></div>'
        +    '<div class="sts" id="priCnt"></div>'
        +    '<div class="main"><div class="tw"><div class="tsc"><table><thead id="priTh"></thead><tbody id="priTb"></tbody></table></div></div></div>'
        +  '</div>'
        +'</details>';
      met.parentNode.insertBefore(pri, met);
      met.parentNode.insertBefore(ind, met);
      var takeView=document.getElementById('vTake');
      if(takeView&&takeView.parentNode) takeView.parentNode.removeChild(takeView);
      var takeBtn=nav&&nav.querySelector('[data-v="take"]');
      if(takeBtn&&takeBtn.parentNode) takeBtn.parentNode.removeChild(takeBtn);
    }
    var indPrimaryEl=document.getElementById('indPrimary'); if(indPrimaryEl) indPrimaryEl.innerHTML=primaryOptionsHtml(indPrimary);
    var priPrimaryEl=document.getElementById('priPrimary'); if(priPrimaryEl) priPrimaryEl.innerHTML=primaryOptionsHtml(priPrimary);
  }

  function patchMethodology(){
    var intro=document.querySelector('#vMet .mth-intro p');
    if(intro){
      intro.textContent='This dashboard combines occupation-level AI task usage patterns, O*NET task and work-context measures, and industry mapping, growth, and age data to show where AI appears more likely to augment work, where displacement risk remains, and which occupation-led service verticals look most investable.';
    }
    var toc=document.querySelector('.mth-toc');
    if(toc){
      toc.innerHTML=''
        +'<a class="mth-toc-item" href="#met-priority-industries"><strong>Investing View</strong><span>Explains the Combined Investment Score that ranks occupation-led sub-verticals across three weighted pillars.</span></a>'
        +'<a class="mth-toc-item" href="#met-ai-vs-work-context"><strong>Career View</strong><span>Plots the occupation AI score against AI Resilience, split at the median, and highlights prominent example occupations in each quadrant.</span></a>'
        +'<a class="mth-toc-item" href="#met-ai-score"><strong>AI Benefit</strong><span>Shows the occupation AI score using task-level AI interaction patterns, task importance, task frequency weights, and the human / physical task filter.</span></a>'
        +'<a class="mth-toc-item" href="#met-work-context"><strong>AI Resilience</strong><span>Shows the four O*NET work-context measures (with adjustable weights) used to construct the AI Resilience score.</span></a>'
        +'<a class="mth-toc-item" href="#met-industry-data"><strong>Industry Fundamentals</strong><span>Explains how occupations are mapped into investable sub-verticals and how the Industrial Fundamental Score is built.</span></a>'
        +'<a class="mth-toc-item" href="#met-data-sources"><strong>Data Sources</strong><span>Lists the source datasets used to build the current dashboard.</span></a>';
    }
    var aiScore=document.getElementById('met-ai-score');
    if(aiScore){
      var ps=aiScore.querySelectorAll('p');
      if(ps[0]) ps[0].textContent='This tab estimates whether currently observed AI usage patterns for an occupation lean more toward augmenting work or automating work.';
      if(ps[3]) ps[3].textContent='Tasks that still require embodied, in-person, hands-on, equipment-based, or live-service execution are treated as human / physical tasks. Those tasks remain visible in the drill-down, but their displayed AI score is forced to 0 so the occupation score focuses on tasks that current AI use can more plausibly reshape.';
      if(ps[4]) ps[4].textContent='The current implementation uses a model-based classifier (Haiku 4.5) that reads each O*NET task statement against an operational rubric. A task is treated as human / physical if completing it end-to-end requires manipulating physical objects, materials, tools, machinery, or vehicles; touching, examining, or moving a person or animal; being bodily present at a specific work location; or live face-to-face presence where the embodied interaction is part of the work. Tasks that can plausibly be accomplished through writing, reading, analysis, software operation, or remote communication (phone, video, chat, email) are not treated as human / physical, even when the verbs sound hands-on (for example, "operate" software, "prepare" reports, or "interview" by telephone).';
      if(ps[5]) ps[5].textContent='The occupation score is the frequency-weighted sum of score-eligible AI tasks, using each task\'s O*NET frequency weight share in the occupation.';
      if(ps[6]) ps[6].textContent='A task contributes to the occupation score only if it is AI-exposed, not human / physical, has classified AI interaction data, and has a non-zero displayed task score.';
    }
    var workContext=document.getElementById('met-work-context');
    if(workContext){
      var p=workContext.querySelector('p');
      if(p) p.textContent="This tab shows the four O*NET work-context measures used in the dashboard's resilience lens. The score is a user-weighted average of the four factors (default 25% each, adjustable on the tab), then standardized into a z-score across occupations.";
      var fm=workContext.querySelector('.fm');
      if(fm) fm.innerHTML='AI_resilience = weighted average(Contact With Others,<br>Consequence of Error,<br>Impact of Decisions on Co-workers or Company Results,<br>Importance of Being Exact or Accurate)';
    }
    var dataSection=document.getElementById('met-data-sources');
    if(dataSection){
      var grid=dataSection.querySelector('.src-grid');
      if(grid){
        grid.innerHTML=''
          +'<div class="src-item"><div class="src-label">Anthropic Economic Index</div><div class="src-desc">Anthropic Economic Index usage data classified by O*NET task and interaction type.<br><a href="https://huggingface.co/datasets/Anthropic/EconomicIndex/tree/main/release_2026_03_24" target="_blank" rel="noopener">huggingface.co/datasets/Anthropic/EconomicIndex</a></div></div>'
          +'<div class="src-item"><div class="src-label">O*NET Task Ratings</div><div class="src-desc">U.S. Department of Labor occupational database with task statements and ratings for importance, relevance, and frequency. The dashboard uses importance in task scoring and task frequency weight shares at the occupation level.<br><a href="https://www.onetcenter.org/dictionary/20.1/excel/task_ratings.html" target="_blank" rel="noopener">onetcenter.org/dictionary/20.1/excel/task_ratings.html</a></div></div>'
          +'<div class="src-item"><div class="src-label">O*NET Work Context</div><div class="src-desc">Work-context measures used here for contact with others, consequence of error, impact of decisions, and exactness / accuracy.<br><a href="https://www.onetcenter.org/dictionary/30.2/excel/work_context.html" target="_blank" rel="noopener">onetcenter.org/dictionary/30.2/excel/work_context.html</a></div></div>'
          +'<div class="src-item"><div class="src-label">Industry Data</div><div class="src-desc">Industry employment and wage reference tables used to support the industry mapping and growth fields shown in the dashboard.<br><a href="https://www.bls.gov/oes/tables.htm" target="_blank" rel="noopener">bls.gov/oes/tables.htm</a></div></div>'
          +'<div class="src-item"><div class="src-label">Age by Occupation Data</div><div class="src-desc">User-provided occupation-level median age data for 2019, 2022, and 2025, including the reference-year range and change in median age.</div></div>';
      }
      var p2=dataSection.querySelector('p');
      if(p2) p2.textContent='All scores in this dashboard reflect observed current usage patterns, structural job characteristics, and industry / age reference data in the loaded datasets, not a forecast of ultimate AI capability or guaranteed job outcomes.';
    }
    if(dataSection && !document.getElementById('met-industry-data')){
      var s1=document.createElement('section');
      s1.id='met-industry-data'; s1.className='mth-section';
      s1.innerHTML=''
        +'<h2>Industry Fundamentals</h2>'
        +'<p>Each occupation is mapped to a most relevant industry using the workbook&#39;s <code>Specific NAICS Index Match</code> field, along with a higher-level primary industry grouping used for filtering.</p>'
        +'<p>Estimated industry size is approximated with occupation-level wage pool data, using the latest average annual wage multiplied by the latest employment count available for the mapped occupation.</p>'
        +'<div class="fm">estimated_industry_size ≈ latest_average_salary × latest_employment</div>'
        +'<p>The Industrial Fundamental Score summarizes recent wage growth, recent employment growth, projected employment growth, and 2025 median age into one standardized view of industry fundamentals and labor shortage signals.</p>'
        +'<div class="fm">industrial_fundamental_score = Average(z(historical_employment_growth), z(historical_wage_growth), z(projected_employment_growth), z(2025_median_age))</div>'
        +'<a class="mth-jump" href="#met-contents">Back to contents</a>';
      var s2=document.createElement('section');
      s2.id='met-priority-industries'; s2.className='mth-section';
      s2.innerHTML=''
        +'<h2>Investing View</h2>'
        +'<p>The Investing View treats each occupation-led sub-vertical as its own investment row and ranks it with a Combined Investment Score: a user-weighted average of three standardized pillars (default 33% each, adjustable at the top of the tab).</p>'
        +'<div class="fm">combined_investment_score = weighted average(<br>AI Benefit Score, AI Resilience Z-Score, Industrial Fundamental Score)</div>'
        +'<p>The <strong>AI Benefit Score</strong> combines the Augmentation Score z (default 70%) and the Differentiation Score z (default 30%; wage dispersion (P90-P10)/median). Differentiation only adds an upside boost when the augmentation signal is positive, so it never lifts an occupation that AI does not otherwise help.</p>'
        +'<div class="fm">ai_benefit = w_aug&middot;z(aug) + w_diff&middot;max(0, z(diff))&middot;[z(aug) &gt; 0]</div>'
        +'<p>The <strong>AI Resilience Z-Score</strong> and <strong>Industrial Fundamental Score</strong> are the standardized scores described in the AI Resilience and Industry Fundamentals sections. Each occupation&#39;s drill-down shows this full derivation as a tree, from the Combined Investment Score down to every component and its weight.</p>'
        +'<a class="mth-jump" href="#met-contents">Back to contents</a>';
      dataSection.parentNode.insertBefore(s1, dataSection);
      dataSection.parentNode.insertBefore(s2, dataSection);
    }
    var wrap=document.querySelector('#vMet .mth');
    if(wrap){
      var order=['met-priority-industries','met-ai-vs-work-context','met-ai-score','met-work-context','met-industry-data','met-data-sources'];
      for(var i=0;i<order.length;i++){
        var node=document.getElementById(order[i]);
        if(node) wrap.appendChild(node);
      }
    }
  }

  var indCols=[
    {k:'occupation',l:'Occupation',t:'O*NET occupation title.',s:'width:18%'},
    {k:'industry',l:'Most Relevant Industry',t:'Mapped from the uploaded workbook\'s Specific NAICS Index Match column.',s:'width:17%'},
    {k:'primaryIndustry',l:'Primary Industry',t:'Higher-level industry grouping used for filtering.',s:'width:10%'},
    {k:'industrySize',l:'Est. Industry Size',t:'Estimated industry size approximated by the combined wage pool of the occupation level.',s:'width:8%'},
    {k:'industrialFundamentalScore',l:'Industrial Fundamental Score (Z Score)',t:'Average of standardized z-scores for historical employment growth, historical wage growth, projected employment growth, and 2025 median age.', main:true,s:'width:10%'},
    {k:'histEmploymentGrowth',l:'Historical Employment Growth',t:'2019–2024 OEWS employment CAGR.',s:'width:9%'},
    {k:'histWageGrowth',l:'Historical Wage Growth',t:'2019–2024 OEWS wage CAGR.',s:'width:8%'},
    {k:'projectedEmploymentGrowth',l:'Projected Employment Growth',t:'2024–2034 BLS projected employment CAGR.',s:'width:9%'},
    {k:'medianAge2025',l:'2025 Median Age',t:'2025 median age by occupation from the age source data.',s:'width:8%'}
  ];

  function renderGenericHeader(targetId, cols, sortKey, sortDir, fnName){
    var tr=document.getElementById(targetId); if(!tr) return;
    var h='';
    for(var i=0;i<cols.length;i++){
      var c=cols[i], isSorted=c.k===sortKey;
      var arrow=isSorted?(sortDir===1?' &#9650;':' &#9660;'):' &#8597;';
      h+='<th'+(c.s?' style="'+c.s+'"':'')+' class="'+(isSorted?'sorted ':'')+(c.main?'primary-col-head':'')+'" onclick="'+fnName+'(\''+c.k+'\')">';
      h+=tipDown(c.l+'<span class="sa">'+arrow+'</span>',c.t);
      h+='</th>';
    }
    tr.querySelector('tr').innerHTML=h;
  }

  function industryById(id){ for(var i=0;i<IND_OCC.length;i++) if(IND_OCC[i].id===id) return IND_OCC[i]; return null; }

  function buildIndustryDetail(id){
    var r=industryById(id); if(!r) return '';
    var occStats=typeof occAdjusted==='function' ? occAdjusted(id) : null;
    var resRaw=Number(r.aiResilience)||0;
    var h='<button class="x" id="xb">&times;</button>';
    h+='<div class="dt">'+esc(r.occupation)+'</div>';
    h+='<div class="dc">'+esc(r.id)+' &middot; Industry Fundamentals drill-down</div>';
    h+=(window.buildSocDescBox?window.buildSocDescBox(id,'Occupation description'):'');
    h+='<div class="sct" style="margin-top:12px">Industry Size / Wage Pool Detail</div>';
    h+='<div class="scs">How big the opportunity is: the total wages paid to this occupation approximate the size of the market for services built around it.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box detail-em"><div class="lb">Est. Industry Size</div><div class="vl">'+fmtMoneyCompact(r.industrySize)+'</div><div class="mt">Average salary × employment</div></div>';
    h+='<div class="sc-box"><div class="lb">Average Salary</div><div class="vl">'+fmtMoneyCompact(r.avgSalary)+'</div><div class="mt">Latest available annual wage</div></div>';
    h+='<div class="sc-box"><div class="lb">Employment</div><div class="vl">'+fmtInt(r.employment)+'</div><div class="mt">Latest available OEWS employment</div></div>';
    h+='<div class="sc-box"><div class="lb">Primary Industry</div><div class="vl" style="font-size:1rem;line-height:1.35">'+esc(r.primaryIndustry||'Unspecified')+'</div><div class="mt">Higher-level filter grouping</div></div>';
    h+='</div>';
    h+='<div class="sct" style="margin-top:12px">Mapped Industry</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">Most Relevant Industry</div><div class="vl" style="font-size:1rem;line-height:1.35">'+esc(r.industry||'—')+'</div><div class="mt">NAICS '+esc(r.naics||'—')+'</div></div>';
    h+='<div class="sc-box"><div class="lb">Historical Employment Growth</div><div class="vl '+scoreClsPct(r.histEmploymentGrowth)+'">'+fmtPctSigned(r.histEmploymentGrowth)+'</div><div class="mt">Jobs added 2019–2024 — proof of real demand</div></div>';
    h+='<div class="sc-box"><div class="lb">Historical Wage Growth</div><div class="vl '+scoreClsPct(r.histWageGrowth)+'">'+fmtPctSigned(r.histWageGrowth)+'</div><div class="mt">Pay growth 2019–2024 — demand outrunning worker supply</div></div>';
    h+='<div class="sc-box"><div class="lb">Projected Employment Growth</div><div class="vl '+scoreClsPct(r.projectedEmploymentGrowth)+'">'+fmtPctSigned(r.projectedEmploymentGrowth)+'</div><div class="mt">Expected demand over the next decade</div></div>';
    h+='</div>';
    h+='<div class="sct" style="margin-top:12px">Age by Occupation</div>';
    h+='<div class="scs">An aging workforce signals retirements ahead with too few replacements coming in — a durable labor-shortage tailwind for whoever can serve or staff this field.</div>';
    h+='<div class="sc-row">';
    h+='<div class="sc-box"><div class="lb">2019 Median Age</div><div class="vl">'+fmtAge(r.medianAge2019)+'</div></div>';
    h+='<div class="sc-box"><div class="lb">2022 Median Age</div><div class="vl">'+fmtAge(r.medianAge2022)+'</div></div>';
    h+='<div class="sc-box detail-em"><div class="lb">2025 Median Age</div><div class="vl">'+fmtAge(r.medianAge2025)+'</div></div>';
    h+='</div>';
    h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
    return h;
  }

  function indDetail(id){
    var pnl=document.getElementById('pnl'); if(!pnl) return;
    pnl.innerHTML=buildIndustryDetail(id);
    document.getElementById('ov').classList.add('open');
    document.body.style.overflow='hidden';
    var xb=document.getElementById('xb'); if(xb) xb.onclick=cld;
  }
  window.indDetail=indDetail;

  function renderIndustryData(){
    var _vi=document.getElementById('vInd'); if(_vi&&_vi.style.display==='none') return;
    var tb=document.getElementById('indTb'); if(!tb) return;
    renderGenericHeader('indTh', indCols, indSort, indSortDir, 'indsort');
    var list=IND_OCC.slice();
    if(indPrimary) list=list.filter(function(r){ return String(r.primaryIndustry||'Unspecified')===indPrimary; });
    if(indQry){
      var q=indQry.toLowerCase();
      list=list.filter(function(r){
        if(r._q===undefined)r._q=(String(r.occupation||'')+'\n'+String(r.industry||'')+'\n'+String(r.primaryIndustry||'')+'\n'+String(r.id||'')+'\n'+String(r.naics||'')).toLowerCase();
        return r._q.indexOf(q)>=0;
      });
    }
    list.sort(function(a,b){ return compareMixed(a,b,indSort,indSortDir); });
    var cnt=document.getElementById('indCnt');
    if(cnt) cnt.innerHTML='<div class="st"><b>'+list.length.toLocaleString()+'</b><span>occupation rows</span></div><div class="st"><span>Filter:</span> <b>'+(indPrimary?esc(indPrimary):'All primary industries')+'</b></div>';
    var h='';
    for(var i=0;i<list.length;i++){
      var r=list[i];
      h+='<tr data-id="'+esc(r.id)+'" title="Click for drill-down" class="clickable-row">'
        +'<td><div class="tn">'+esc(r.occupation)+'</div><div class="subcd">'+esc(r.id)+'</div></td>'
        +'<td><div>'+esc(r.industry)+'</div><div class="subcd">NAICS '+esc(r.naics||'—')+'</div></td>'
        +'<td>'+esc(r.primaryIndustry||'Unspecified')+'</td>'
        +'<td class="m">'+fmtMoneyCompact(r.industrySize)+'</td>'
        +'<td class="m primary-col-cell '+scoreClsPct(r.industrialFundamentalScore)+'">'+fmtSigned2(r.industrialFundamentalScore)+'</td>'
        +'<td class="m '+scoreClsPct(r.histEmploymentGrowth)+'">'+fmtPctSigned(r.histEmploymentGrowth)+'</td>'
        +'<td class="m '+scoreClsPct(r.histWageGrowth)+'">'+fmtPctSigned(r.histWageGrowth)+'</td>'
        +'<td class="m '+scoreClsPct(r.projectedEmploymentGrowth)+'">'+fmtPctSigned(r.projectedEmploymentGrowth)+'</td>'
        +'<td class="m">'+fmtAge(r.medianAge2025)+'</td>'
        +'</tr>';
    }
    tb.innerHTML=h;
  }

  function renderPriorityHeader(){
    var thead=document.getElementById('priTh'); if(!thead) return;
    function cell(label,key,tip,extra,rowspan){
      var isSorted=key===priSort, arrow=isSorted?(priSortDir===1?' &#9650;':' &#9660;'):' &#8597;';
      return '<th'+(rowspan?' rowspan="'+rowspan+'"':'')+(extra?' class="'+extra+(isSorted?' sorted':'')+'"':' class="'+(isSorted?'sorted':'')+'"')+(key?' onclick="prisort(\''+key+'\')"':'')+'>'+(key?tipDown(label+'<span class="sa">'+arrow+'</span>',tip):label)+'</th>';
    }
    var h='';
    h+='<tr class="priority-head-top">';
    h+=cell('#','rank','Rank by combined Z-score.','',1);
    h+=cell('Occupation','occupation','O*NET occupation title used as the row-level investment unit.', '', 1);
    h+=cell('Most Relevant Industry','industry','Mapped industry from the workbook\'s Specific NAICS Index Match column.','',1);
    h+=cell('Primary Industry','primaryIndustry','Higher-level industry grouping used for filtering.','',1);
    h+=cell('Est. Industry Size','industrySize','Estimated industry size approximated by the combined wage pool of the occupation level.','',1);
    h+=cell('Combined Score (Z Score)','combinedInvestmentScore','User-weighted average of AI Benefit Score, AI Resilience Z-Score, and Industrial Fundamental Score. Adjust weights at the top of this tab.','master',1);
    h+=cell('AI Benefit Score (Z Score)','aiBenefitScore','Weighted average of the AI Augmentation Z-Score and the Differentiation Z-Score (wage P90-P10 / median). Weights are adjustable on the AI Benefit tab.','group',1);
    h+=cell('AI Resilience (Z Score)','aiResilienceZ','Standardized Z-score for how critical human interaction and judgement is to the job, positive = more resilient than average, negative = less resilient than average. Weights for the underlying resilience factors are adjustable on the AI Resilience tab.','group',1);
    h+=cell('Industrial Fundamental Score (Z Score)','industrialFundamentalScore','Standardized Z-score for industry fundamentals (industry growth and labor shortage), positive = above average industry fundamentals, negative = below average industry fundamentals. Weights for the underlying factors are adjustable on the Industry Fundamentals tab.','group',1);
    h+='</tr>';
    thead.innerHTML=h;
  }

  function buildPriorityDetail(id){
    var r=PRI_MAP[id]; if(!r) return '';
    var occStats=typeof window.occAdjusted==='function' ? window.occAdjusted(id) : null;
    var w=(typeof WCM!=='undefined' && (WCM[id]||WCM[baseSoc(id)])) || null;
    var h='<button class="x" id="xb">&times;</button>';
    h+='<div class="dt">'+esc(r.occupation)+'</div>';
    h+='<div class="dc">'+esc(r.id)+' &middot; Investing View drill-down</div>';
    h+=(window.buildSocDescBox?window.buildSocDescBox(id,'Occupation description'):'');
    var pw=(window.SCORE_WEIGHTS&&window.SCORE_WEIGHTS.priority)||{aiBenefit:1/3,resilience:1/3,industrial:1/3};
    var bw=(window.SCORE_WEIGHTS&&window.SCORE_WEIGHTS.aiBenefit)||{augmentation:0.7,differentiation:0.3};
    var rw=(window.SCORE_WEIGHTS&&window.SCORE_WEIGHTS.resilience)||{contact:0.25,error:0.25,impact:0.25,exact:0.25};
    var iw=(window.SCORE_WEIGHTS&&window.SCORE_WEIGHTS.industrial)||{histEmp:0.25,histWage:0.25,projEmp:0.25,medianAge:0.25};
    function pw2(x){ return Math.round((Number(x)||0)*100)+'%'; }
    function resVal(key){ var m=w?wcMetric(w,key):null; return (m&&m.r!=null&&isFinite(Number(m.r)))?fmtNum(Number(m.r),2):'—'; }
    function sv(v){ return '<span class="'+cls(v)+'">'+fmtSigned2(v)+'</span> <span class="z-tag">(Z Score)</span>'; }
    function pv(v){ return '<span class="'+scoreClsPct(v)+'">'+fmtPctSigned(v)+'</span>'; }
    function vnode(label,weight,valHtml,sub){
      return '<div class="tn-h"><span>'+esc(label)+'</span><span class="tn-w">'+weight+'</span></div>'
        +'<div class="tn-v">'+valHtml+'</div>'
        +(sub?'<div class="tn-sub">'+sub+'</div>':'');
    }
    h+='<div class="sct" style="margin-top:12px">Investment Score Derivation</div>';
    h+='<div class="scs">Why this occupation ranks where it does: how much AI helps the work, how essential the human remains, and how healthy the underlying industry is. Weights reflect your current settings on the other tabs.</div>';
    h+='<div class="tree">'
      +'<div class="tree-top"><div class="tnode tnode-root">'+vnode('Investment Priority Score','Combined Z Score', sv(r.combinedInvestmentScore), 'Rank #'+fmtInt(r.rank)+' &middot; overall attractiveness: AI upside, human staying power, and industry health')+'</div></div>'
      +'<div class="tree-stem"></div>'
      +'<div class="tree-cols">'
      +'<div class="tree-col"><div class="tnode tnode-pillar">'+vnode('AI Benefit Score',pw2(pw.aiBenefit), sv(r.aiBenefitScore),'How much AI is likely to help the occupation')+'</div>'
        +'<div class="tleaves">'
          +'<div class="tnode tnode-leaf">'+vnode('Augmentation Score',pw2(bw.augmentation), sv(r.aiScoreZ),'Does real-world AI use assist these workers, or do their tasks for them')+'</div>'
          +'<div class="tnode tnode-leaf">'+vnode('Differentiation Score',pw2(bw.differentiation), sv(r.differentiationZ),'Room to stand out: wide pay gaps mean skill drives outcomes, and AI multiplies the most skilled')+'</div>'
        +'</div></div>'
      +'<div class="tree-col"><div class="tnode tnode-pillar">'+vnode('AI Resilience',pw2(pw.resilience), sv(r.aiResilienceZ),'How hard the human side of the job is to replace')+'</div>'
        +'<div class="tleaves">'
          +'<div class="tnode tnode-leaf">'+vnode('Contact With Others',pw2(rw.contact), resVal('contact'),'Relationship-driven work is resilient to automation')+'</div>'
          +'<div class="tnode tnode-leaf">'+vnode('Consequence of Error',pw2(rw.error), resVal('error'),'Costly mistakes keep an accountable human in the loop')+'</div>'
          +'<div class="tnode tnode-leaf">'+vnode('Impact of Decisions',pw2(rw.impact), resVal('impact'),'High-stakes judgment is the last thing handed to AI')+'</div>'
          +'<div class="tnode tnode-leaf">'+vnode('Exact / Accurate',pw2(rw.exact), resVal('exact'),'Where errors are unacceptable, humans still verify')+'</div>'
        +'</div></div>'
      +'<div class="tree-col"><div class="tnode tnode-pillar">'+vnode('Industry Fundamental Score',pw2(pw.industrial), sv(r.industrialFundamentalScore),'Is the underlying industry growing and short of workers')+'</div>'
        +'<div class="tleaves">'
          +'<div class="tnode tnode-leaf">'+vnode('Historical Employment Growth',pw2(iw.histEmp), pv(r.histEmploymentGrowth),'Jobs actually added in recent years &mdash; proof of real demand')+'</div>'
          +'<div class="tnode tnode-leaf">'+vnode('Historical Wage Growth',pw2(iw.histWage), pv(r.histWageGrowth),'Rising pay signals demand outrunning the supply of workers')+'</div>'
          +'<div class="tnode tnode-leaf">'+vnode('Projected Employment Growth',pw2(iw.projEmp), pv(r.projectedEmploymentGrowth),'Demand expected to keep growing over the next decade')+'</div>'
          +'<div class="tnode tnode-leaf">'+vnode('2025 Median Age',pw2(iw.medianAge), fmtAge(r.medianAge2025),'An older workforce means retirements will tighten labor supply')+'</div>'
        +'</div></div>'
      +'</div>'
    +'</div>';
    if(occStats && occStats.sparse) h+='<div class="inline-note">Note: an occupation\'s AI score is set to 0 when it has only one AI-exposed task, or when fewer than 10% of its tasks show AI usage — too little evidence to score it reliably. This occupation has '+occStats.ai+' AI-exposed task'+(occStats.ai===1?'':'s')+' ('+pct(occStats.cv)+' of its tasks), so its AI score, and therefore its AI Benefit Score, is treated as 0.</div>';
    h+='<div class="scs" style="margin-top:16px">Mapped industry: <b style="color:var(--t2)">'+esc(r.industry||'—')+'</b> (NAICS '+esc(r.naics||'—')+') &middot; Est. size '+fmtMoneyCompact(r.industrySize)+' &middot; '+esc(r.primaryIndustry||'Unspecified')+'</div>';
    h+='<div class="contact-note pnl-contact-note"><strong>Questions?</strong> Please direct any questions to Wilson Zhang at <a href="mailto:wilson.z1015@gmail.com" style="color:var(--blue);text-decoration:none">wilson.z1015@gmail.com</a> / <a href="https://www.linkedin.com/in/wilsonzhang10/" target="_blank" rel="noopener" style="color:var(--blue);text-decoration:none">https://www.linkedin.com/in/wilsonzhang10/</a>.</div>';
    return h;
  }

  function priDetail(id){
    var pnl=document.getElementById('pnl'); if(!pnl) return;
    pnl.innerHTML=buildPriorityDetail(id);
    document.getElementById('ov').classList.add('open');
    document.body.style.overflow='hidden';
    var xb=document.getElementById('xb'); if(xb) xb.onclick=cld;
  }
  window.priDetail=priDetail;

  function renderPriorityIndustries(){
    var _vp=document.getElementById('vPri'); if(_vp&&_vp.style.display==='none') return;
    var tb=document.getElementById('priTb'); if(!tb) return;
    renderPriorityHeader();
    var list=PRI_ROWS.slice();
    if(priPrimary) list=list.filter(function(r){ return String(r.primaryIndustry||'Unspecified')===priPrimary; });
    if(priQry){
      var q=priQry.toLowerCase();
      list=list.filter(function(r){
        if(r._q===undefined)r._q=(String(r.occupation||'')+'\n'+String(r.industry||'')+'\n'+String(r.primaryIndustry||'')+'\n'+String(r.id||'')+'\n'+String(r.naics||'')).toLowerCase();
        return r._q.indexOf(q)>=0;
      });
    }
    list.sort(function(a,b){ return compareMixed(a,b,priSort,priSortDir); });
    var cnt=document.getElementById('priCnt');
    if(cnt) cnt.innerHTML='<div class="st"><b>'+list.length.toLocaleString()+'</b><span>occupation rows</span></div><div class="st"><span>Filter:</span> <b>'+(priPrimary?esc(priPrimary):'All primary industries')+'</b></div>';
    var h='';
    for(var i=0;i<list.length;i++){
      var r=list[i];
      h+='<tr class="priority-row clickable-row" data-id="'+esc(r.id)+'" title="Click for score breakdown">'
        +'<td class="m">'+fmtInt(r.rank)+'</td>'
        +'<td><div class="tn">'+esc(r.occupation)+'</div><div class="subcd">'+esc(r.id)+'</div></td>'
        +'<td><div>'+esc(r.industry)+'</div><div class="subcd">NAICS '+esc(r.naics||'—')+'</div></td>'
        +'<td>'+esc(r.primaryIndustry||'Unspecified')+'</td>'
        +'<td class="m">'+fmtMoneyCompact(r.industrySize)+'</td>'
        +'<td class="m master-col '+cls(r.combinedInvestmentScore)+'"><b>'+fmtSigned2(r.combinedInvestmentScore)+'</b></td>'
        +'<td class="m '+cls(r.aiBenefitScore)+'">'+fmtSigned2(r.aiBenefitScore)+'</td>'
        +'<td class="m '+cls(r.aiResilienceZ)+'">'+fmtSigned2(r.aiResilienceZ)+'</td>'
        +'<td class="m '+cls(r.industrialFundamentalScore)+'">'+fmtSigned2(r.industrialFundamentalScore)+'</td>'
        +'</tr>';
    }
    tb.innerHTML=h;
  }
  window.renderIndustryData=renderIndustryData;
  window.renderPriorityIndustries=renderPriorityIndustries;

  window.indsort=function(col){ if(indSort===col){indSortDir*=-1}else{indSort=col; indSortDir=(col==='occupation'||col==='industry'||col==='primaryIndustry')?1:-1;} renderIndustryData(); };
  window.prisort=function(col){ if(priSort===col){priSortDir*=-1}else{priSort=col; priSortDir=(col==='occupation'||col==='industry'||col==='primaryIndustry')?1:-1;} renderPriorityIndustries(); };

  buildPriorityRows();
  insertIndustryViews();
  patchMethodology();

  var indQryEl=document.getElementById('indQry'); if(indQryEl) indQryEl.oninput=window.__debInput(function(e){ if(e.target.value===indQry) return; indQry=e.target.value; renderIndustryData(); });
  var priQryEl=document.getElementById('priQry'); if(priQryEl) priQryEl.oninput=window.__debInput(function(e){ if(e.target.value===priQry) return; priQry=e.target.value; renderPriorityIndustries(); });
  var indPrimaryEl=document.getElementById('indPrimary'); if(indPrimaryEl) indPrimaryEl.onchange=function(e){ indPrimary=e.target.value; renderIndustryData(); };
  var priPrimaryEl=document.getElementById('priPrimary'); if(priPrimaryEl) priPrimaryEl.onchange=function(e){ priPrimary=e.target.value; renderPriorityIndustries(); };
  var indTbEl=document.getElementById('indTb'); if(indTbEl) indTbEl.onclick=function(e){ var tr=e.target.closest('tr'); if(tr){ var id=tr.getAttribute('data-id'); if(id) indDetail(id); } };
  var priTbEl=document.getElementById('priTb'); if(priTbEl) priTbEl.onclick=function(e){ var tr=e.target.closest('tr'); if(tr){ var id=tr.getAttribute('data-id'); if(id) priDetail(id); } };

  showView=function(v){
    if(['pri','aiwc','tbl','wc','ind','met'].indexOf(v)<0) v='pri';
    var bs=document.querySelectorAll('.nb');
    for(var i=0;i<bs.length;i++) bs[i].classList.toggle('on',bs[i].getAttribute('data-v')===v);
    var map={vTbl:'tbl',vWc:'wc',vAiWc:'aiwc',vInd:'ind',vPri:'pri',vMet:'met'};
    for(var mid in map){ var mel=document.getElementById(mid); if(mel) mel.style.display=v===map[mid]?'':'none'; }
    var dirty=window._viewDirty||(window._viewDirty={tbl:1,wc:1,aiwc:1,ind:1,pri:1});
    if(dirty[v]){
      if(v==='tbl'&&typeof window.render==='function') window.render();
      else if(v==='wc'&&typeof renderWC==='function') renderWC();
      else if(v==='aiwc'&&typeof renderAiWc==='function') renderAiWc();
      else if(v==='ind') renderIndustryData();
      else if(v==='pri') renderPriorityIndustries();
      dirty[v]=0;
    }
  };
  window.showView=showView;

  showView((location.hash||'#pri').replace('#',''));
})();
/* ---- end industry tabs patch ---- */


/* ---- weights, z-scores, and cross-tab coordinator ---- */
(function(){
  var WEIGHTS = {
    resilience:  {contact:0.25, error:0.25, impact:0.25, exact:0.25},
    industrial:  {histEmp:0.25, histWage:0.25, projEmp:0.25, medianAge:0.25},
    aiBenefit:   {augmentation:0.70, differentiation:0.30},
    priority:    {aiBenefit:1/3, resilience:1/3, industrial:1/3}
  };
  window.SCORE_WEIGHTS = WEIGHTS;

  function meanArr(arr){ var s=0,n=0; for(var i=0;i<arr.length;i++) if(isFinite(arr[i])){s+=arr[i];n++} return n?s/n:0 }
  function sdArr(arr,m){ var s=0,n=0; for(var i=0;i<arr.length;i++) if(isFinite(arr[i])){var d=arr[i]-m;s+=d*d;n++} return n>1?Math.sqrt(s/n):0 }
  function isNum(v){ return typeof v==='number' && isFinite(v) }
  function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

  function wageRecord(id){
    var WD = window.DASHBOARD_DATA && window.DASHBOARD_DATA.WAGE;
    if(!WD) return null;
    var base = (typeof baseSoc==='function')?baseSoc(id):String(id).split('.')[0];
    return WD[id] || WD[base] || null;
  }
  function wageVariance(id){
    var w = wageRecord(id);
    if(!w) return null;
    var p10 = Number(w.p10), p50 = Number(w.p50), p90 = Number(w.p90);
    if(!isNum(p10) || !isNum(p50) || !isNum(p90) || p50<=0) return null;
    return (p90 - p10) / p50;
  }

  var RESILIENCE_RAW = {}, RESILIENCE_Z = {}, AI_AUG_Z = {}, DIFF_VAR = {}, DIFF_Z = {}, AI_BENEFIT = {};

  function weightedResilience(rec){
    if(!rec || typeof wcMetric!=='function') return null;
    var w = WEIGHTS.resilience;
    var keys = ['contact','error','impact','exact'];
    var sum=0, wSum=0;
    for(var i=0;i<keys.length;i++){
      var m = wcMetric(rec, keys[i]);
      if(!m || m.r==null || !isFinite(m.r)) continue;
      var wt = Number(w[keys[i]])||0;
      if(wt<=0) continue;
      sum += Math.abs(Number(m.r)) * wt;
      wSum += wt;
    }
    return wSum>0 ? sum/wSum : null;
  }

  function recomputeResilience(){
    RESILIENCE_RAW = {}; RESILIENCE_Z = {};
    if(typeof WCM==='undefined' || !WCM) return;
    var ids=[], vals=[], seen={};
    for(var id in WCM){
      if(!Object.prototype.hasOwnProperty.call(WCM,id)) continue;
      var rec=WCM[id]; if(!rec) continue;
      var key = rec.id || id;
      if(seen[key]) continue;
      seen[key]=1;
      var r = weightedResilience(rec);
      if(rec) rec.res = r;
      if(r!=null && isFinite(r)){
        RESILIENCE_RAW[id] = r;
        if(rec.id && rec.id !== id) RESILIENCE_RAW[rec.id] = r;
        ids.push(id); vals.push(r);
      }
    }
    var m=meanArr(vals), s=sdArr(vals,m);
    for(var i=0;i<ids.length;i++){
      var z = s ? (vals[i]-m)/s : 0;
      RESILIENCE_Z[ids[i]] = z;
      var rec2 = WCM[ids[i]];
      if(rec2 && rec2.id && rec2.id !== ids[i]) RESILIENCE_Z[rec2.id] = z;
    }
  }

  function recomputeAiAugZ(){
    AI_AUG_Z = {};
    if(typeof OCC==='undefined' || !OCC || !OCC.length) return;
    var ids=[], vals=[];
    for(var i=0;i<OCC.length;i++){
      var o = OCC[i]; if(!o) continue;
      var stats = (typeof occAdjusted==='function') ? occAdjusted(o.id) : null;
      var s = stats ? Number(stats.s) : (o.ch ? Number(o.ch.s) : NaN);
      if(isNum(s)){ ids.push(o.id); vals.push(s); }
    }
    var m=meanArr(vals), sd=sdArr(vals,m);
    for(var j=0;j<ids.length;j++) AI_AUG_Z[ids[j]] = sd ? (vals[j]-m)/sd : 0;
  }

  function recomputeDifferentiation(){
    DIFF_VAR = {}; DIFF_Z = {};
    if(typeof OCC==='undefined' || !OCC) return;
    var ids=[], vals=[];
    for(var i=0;i<OCC.length;i++){
      var id = OCC[i].id;
      var v = wageVariance(id);
      if(v!=null && isFinite(v)){ DIFF_VAR[id] = v; ids.push(id); vals.push(v); }
    }
    if(!ids.length) return;
    var m=meanArr(vals), s=sdArr(vals,m);
    for(var j=0;j<ids.length;j++) DIFF_Z[ids[j]] = s ? (vals[j]-m)/s : 0;
  }

  function recomputeAiBenefit(){
    AI_BENEFIT = {};
    var w = WEIGHTS.aiBenefit;
    if(typeof OCC==='undefined' || !OCC) return;
    for(var i=0;i<OCC.length;i++){
      var id = OCC[i].id;
      var az = AI_AUG_Z[id]!=null ? AI_AUG_Z[id] : 0;
      var occHasWage = (wageRecord(id) != null);
      var dz = (occHasWage && DIFF_Z[id]!=null) ? DIFF_Z[id] : 0;
      var wAug = Number(w.augmentation)||0;
      var wDiff = Number(w.differentiation)||0;
      var totalW = wAug + wDiff;
      if(totalW<=0){ AI_BENEFIT[id] = 0; continue; }
      // When wage data is missing for this occupation, redistribute diff weight to aug
      var effAug = occHasWage ? wAug : totalW;
      var effDiff = occHasWage ? wDiff : 0;
      // Gated formula: differentiation only adds value when BOTH aug and diff are positive,
      // but augmentation is used only as a binary gate (not a magnitude) so it isn't double-counted.
      // Negative diff cannot drag down the score; high diff with negative aug does not lift it.
      var augGate = (az > 0) ? 1 : 0;
      var positiveBoost = Math.max(0, dz) * augGate;
      AI_BENEFIT[id] = (effAug * az + effDiff * positiveBoost) / totalW;
    }
  }

  function recomputeAllScores(){
    recomputeResilience();
    recomputeAiAugZ();
    recomputeDifferentiation();
    recomputeAiBenefit();
  }

  window.getResilienceRaw = function(id){
    var base=(typeof baseSoc==='function')?baseSoc(id):String(id).split('.')[0];
    if(RESILIENCE_RAW[id]!=null) return RESILIENCE_RAW[id];
    if(RESILIENCE_RAW[base]!=null) return RESILIENCE_RAW[base];
    return null;
  };
  window.getResilienceZ = function(id){
    var base=(typeof baseSoc==='function')?baseSoc(id):String(id).split('.')[0];
    if(RESILIENCE_Z[id]!=null) return RESILIENCE_Z[id];
    if(RESILIENCE_Z[base]!=null) return RESILIENCE_Z[base];
    return 0;
  };
  window.getAiAugZ = function(id){ return AI_AUG_Z[id]!=null ? AI_AUG_Z[id] : 0; };
  window.getDifferentiationZ = function(id){
    if(!(window.DASHBOARD_DATA && window.DASHBOARD_DATA.WAGE)) return 0;
    return DIFF_Z[id]!=null ? DIFF_Z[id] : 0;
  };
  window.getDifferentiationVar = function(id){ return DIFF_VAR[id]!=null ? DIFF_VAR[id] : null; };
  window.getAiBenefit = function(id){ return AI_BENEFIT[id]!=null ? AI_BENEFIT[id] : 0; };
  window.recomputeAllScores = recomputeAllScores;

  function rerenderForCategory(category){
    // Only recompute the score caches that actually depend on the category that changed.
    // AI_AUG_Z and DIFF_Z don't depend on weights, so we never need to recompute them here.
    if(!category || category === 'all'){
      recomputeAllScores();
    } else if(category === 'resilience'){
      recomputeResilience();
      recomputeAiBenefit(); // does not change but cheap; keeps cache fresh
    } else if(category === 'aiBenefit'){
      recomputeAiBenefit();
    }
    // industrial + priority weights only affect the priority composite — handled in buildPriorityRows.

    if(typeof window.buildPriorityRows==='function') window.buildPriorityRows();

    window._viewDirty = {tbl:1,wc:1,aiwc:1,ind:1,pri:1};
    var activeBtn = document.querySelector('.nb.on');
    var view = activeBtn ? activeBtn.getAttribute('data-v') : '';
    if(view==='wc' && typeof renderWC==='function') renderWC();
    else if(view==='tbl' && typeof window.render==='function') window.render();
    else if(view==='ind' && typeof window.renderIndustryData==='function') window.renderIndustryData();
    else if(view==='pri' && typeof window.renderPriorityIndustries==='function') window.renderPriorityIndustries();
    if(window._viewDirty && view) window._viewDirty[view]=0;
  }
  // Keep the old name as a compatibility alias
  function rerenderAll(){ rerenderForCategory('all'); }
  window.rerenderAllScores = rerenderAll;

  function injectStyles(){
    if(document.getElementById('wp-styles')) return;
    var st=document.createElement('style'); st.id='wp-styles';
    st.textContent = ''
      + '.ctrl{align-items:stretch;gap:12px;padding-top:10px;padding-bottom:10px}'
      + '.ctrl>.filter-panel{flex:0 1 auto}'
      + '.ctrl>.weight-panel{flex:1 1 300px;min-width:0}'
      + '.filter-panel{padding:7px 12px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:6px}'
      + '.filter-panel .fp-title{font-size:.68rem;font-weight:700;color:var(--t2);letter-spacing:.3px;text-transform:uppercase}'
      + '.filter-panel .fp-body{display:flex;gap:8px;align-items:center;flex-wrap:wrap}'
      + '.filter-panel .fp-body>.filter-row{flex:0 0 auto;gap:8px;flex-wrap:nowrap;margin:0}'
      + '.filter-panel .sbox{flex:0 1 200px;min-width:130px;max-width:210px}'
      + '.filter-panel .filter-row .sbox{margin-right:0}'
      + '.filter-panel .sbox input{padding:6px 10px 6px 30px;font-size:.8rem}'
      + '.filter-panel .sbox svg{left:9px}'
      + '.filter-panel select{min-width:150px;max-width:190px;padding:6px 10px;font-size:.76rem}'
      + '.weight-panel{padding:7px 12px;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);max-width:560px;display:flex;flex-direction:column;justify-content:center}'
      + '.weight-panel .wp-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px;margin-bottom:6px}'
      + '.weight-panel .wp-title{display:block;font-size:.68rem;font-weight:700;color:var(--t2);letter-spacing:.3px;text-transform:uppercase}'
      + '.weight-panel .wp-summary{font-size:.66rem;color:var(--t3);margin-top:0;line-height:1.3;flex:1 1 auto}'
      + '.weight-panel .wp-error{display:none;margin:0 0 6px;font-size:.66rem;color:var(--red);background:rgba(248,113,113,.1);border:1px solid var(--red-b);padding:3px 8px;border-radius:6px;font-weight:600;text-align:center}'
      + '.weight-panel.has-error .wp-error{display:block}'
      + '.weight-panel.has-error{border-color:var(--red-b)}'
      + '.weight-panel .wp-rows{display:flex;gap:5px;flex-wrap:wrap;align-items:center}'
      + '.weight-panel .wp-row{display:flex;align-items:center;gap:5px;background:var(--s2);border:1px solid var(--b1);padding:3px 6px;border-radius:6px}'
      + '.weight-panel .wp-row label{font-size:.66rem;color:var(--t2);font-weight:500;white-space:nowrap}'
      + '.weight-panel .wp-row input{width:38px;padding:2px 3px;background:var(--bg);border:1px solid var(--b1);border-radius:5px;color:var(--t1);font:inherit;font-size:.7rem;text-align:right;font-family:"IBM Plex Mono",monospace}'
      + '.weight-panel .wp-row input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 2px rgba(76,154,255,.18)}'
      + '.weight-panel .wp-row span{font-size:.64rem;color:var(--t3)}'
      + '.weight-panel .wp-reset{padding:4px 10px;font:inherit;font-size:.64rem;font-weight:600;background:var(--s2);border:1px solid var(--b1);border-radius:6px;color:var(--t3);cursor:pointer;letter-spacing:.4px;text-transform:uppercase}'
      + '.weight-panel .wp-reset:hover{color:var(--t1);border-color:var(--t3)}'
      // Collapsible sections
      + '.collapse-card{margin:14px 32px 0;background:var(--s1);border:1px solid var(--b1);border-radius:var(--r);overflow:hidden}'
      + '.collapse-card>summary{list-style:none;cursor:pointer;padding:14px 18px;display:flex;align-items:center;gap:10px;font-size:.95rem;font-weight:700;color:var(--t1);user-select:none}'
      + '.collapse-card>summary::-webkit-details-marker{display:none}'
      + '.collapse-card>summary:hover{background:var(--s2)}'
      + '.collapse-card>summary .cc-caret{color:var(--blue);font-size:.8rem;transition:transform .15s;display:inline-block}'
      + '.collapse-card[open]>summary .cc-caret{transform:rotate(90deg)}'
      + '.collapse-card>summary .cc-sub{margin-left:auto;font-size:.7rem;font-weight:500;color:var(--t3)}'
      + '.collapse-body{padding:4px 18px 18px}'
      + '.collapse-body>.ctrl{padding-left:0;padding-right:0}'
      + '.collapse-body>.sts{padding-left:0;padding-right:0;margin-left:0;margin-right:0}'
      + '.collapse-body>.main{padding-left:0;padding-right:0}'
      + '.collapse-body .take-grid{margin-top:0}'
      // Scoring tree
      + '.tree{padding:10px 4px 4px}'
      + '.tree-top{display:flex;justify-content:center}'
      + '.tree-stem{width:2px;height:16px;background:var(--b2);margin:0 auto}'
      + '.tnode{background:var(--s2);border:1px solid var(--b1);border-radius:9px;padding:9px 12px;text-align:left}'
      + '.tnode .tn-h{font-size:.78rem;font-weight:700;color:var(--t1);display:flex;justify-content:space-between;gap:10px;align-items:baseline}'
      + '.tnode .tn-w{font-family:"IBM Plex Mono",monospace;font-size:.7rem;color:var(--blue);font-weight:700;white-space:nowrap}'
      + '.tnode .tdesc{font-size:.68rem;color:var(--t1);margin-top:4px;line-height:1.4}'
      + '.tnode-root{border-color:var(--blue);background:rgba(76,154,255,.08);max-width:360px}'
      + '.tree-cols{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}'
      + '.tree-col{flex:1;min-width:210px;max-width:300px;display:flex;flex-direction:column}'
      + '.tnode-pillar{border-color:var(--indigo);background:rgba(124,108,240,.08);margin-bottom:8px}'
      + '.tnode-pillar .tn-w{color:var(--indigo)}'
      + '.tleaves{display:flex;flex-direction:column;gap:6px;padding-left:14px;border-left:2px solid var(--b2);margin-left:10px}'
      + '.tnode-leaf{position:relative}'
      + '.tnode-leaf::before{content:"";position:absolute;left:-16px;top:18px;width:12px;height:2px;background:var(--b2)}'
      // Performance: the full-page backdrop blur made every drill-down open/close janky. Drop it.
      + '.ov{backdrop-filter:none;background:rgba(0,0,0,.72)}'
      + '.tw{contain:content}'
      + '.tsc tbody tr{content-visibility:auto;contain-intrinsic-size:auto 42px}'
      // Header spacing + readable description
      + '.hdr{padding-bottom:6px}'
      + '.hdr p{color:#fff;margin-top:2px}'
      + '.contact-note{margin-top:4px}'
      // Drill-down score tree (compact variant reused in detail panels)
      + '.pnl .tree{padding:6px 2px 2px}'
      + '.pnl .tnode-root{max-width:none}'
      + '.pnl .tnode .tn-v{font-family:"IBM Plex Mono",monospace;font-size:.82rem;font-weight:700;margin-top:3px}'
      + '.pnl .tnode .tn-sub{font-size:.68rem;color:var(--t1);margin-top:2px;line-height:1.35}'
      + '.pnl .tnode .tn-h span:first-child{color:var(--t1)}';
    document.head.appendChild(st);
  }
  injectStyles();

  function makeWeightPanel(parentEl, panelId, title, summary, factors, weightsRef, onChange, category){
    if(!parentEl || document.getElementById(panelId)) return;
    var panel=document.createElement('div');
    panel.id=panelId;
    panel.className='weight-panel';
    var defaults={};
    for(var d=0; d<factors.length; d++) defaults[factors[d].key]=Number(weightsRef[factors[d].key])||0;
    var rowsHtml='';
    for(var i=0;i<factors.length;i++){
      var f=factors[i];
      var pct=Math.round((Number(weightsRef[f.key])||0)*100);
      rowsHtml += '<div class="wp-row"><label>'+escHtml(f.label)+'</label>'
        +'<input type="number" min="0" max="100" step="1" value="'+pct+'" data-wkey="'+escHtml(f.key)+'" />'
        +'<span>%</span></div>';
    }
    rowsHtml += '<button class="wp-reset" type="button">Reset</button>';
    panel.innerHTML = '<div class="wp-head"><span class="wp-title">'+escHtml(title)+'</span>'
      +(summary?'<span class="wp-summary">'+escHtml(summary)+'</span>':'')
      +'</div>'
      +'<span class="wp-error">Weights must total 100%</span>'
      +'<div class="wp-rows">'+rowsHtml+'</div>';
    parentEl.appendChild(panel);

    var inputs = panel.querySelectorAll('input[type="number"]');
    var debTimer = null;
    function applyAndCheck(mode){
      var total=0;
      for(var k=0;k<inputs.length;k++){
        var v=Number(inputs[k].value)||0;
        weightsRef[inputs[k].getAttribute('data-wkey')] = v/100;
        total += v;
      }
      panel.classList.toggle('has-error', Math.abs(Math.round(total)-100)>1);
      if(typeof onChange!=='function' || mode==='skip') return;
      if(debTimer){ clearTimeout(debTimer); debTimer=null; }
      if(mode==='sync'){ onChange(category); return; }
      debTimer = setTimeout(function(){ debTimer=null; onChange(category); }, 150);
    }
    for(var j=0;j<inputs.length;j++){
      inputs[j].addEventListener('input', applyAndCheck);
      inputs[j].addEventListener('change', applyAndCheck);
    }
    var resetBtn = panel.querySelector('.wp-reset');
    if(resetBtn) resetBtn.addEventListener('click', function(){
      for(var k=0;k<inputs.length;k++){
        var key=inputs[k].getAttribute('data-wkey');
        inputs[k].value = Math.round((Number(defaults[key])||0)*100);
      }
      applyAndCheck('sync');
    });
    applyAndCheck('skip');
  }

  function setupWcFilter(){
    var sel=document.getElementById('wcPrimary');
    if(!sel) return;
    var list=window.WC||window.OCC||[];
    var seen={}, opts=[];
    for(var i=0;i<list.length;i++){
      var p=(typeof primaryIndustryForId==='function')?primaryIndustryForId(list[i].id):'';
      if(p&&!seen[p]){ seen[p]=1; opts.push(p); }
    }
    opts.sort(function(a,b){ var x=a.toLowerCase(),y=b.toLowerCase(); return x<y?-1:x>y?1:0; });
    var h='<option value="">All primary industries</option>';
    for(var k=0;k<opts.length;k++) h+='<option value="'+escHtml(opts[k])+'">'+escHtml(opts[k])+'</option>';
    sel.innerHTML=h;
    sel.onchange=function(e){ window.wcPrimaryFilter=e.target.value; if(typeof renderWC==='function') renderWC(); };
  }

  function boxFilters(){
    var specs=[
      {sel:'#vWc .ctrl',  title:'Industry Filter'},
      {sel:'#vTbl .ctrl', title:'Filters'},
      {sel:'#vInd .ctrl', title:'Industry Filter'},
      {sel:'#vPri .ctrl', title:'Industry Filter'}
    ];
    for(var s=0;s<specs.length;s++){
      var ctrl=document.querySelector(specs[s].sel);
      if(!ctrl || ctrl.querySelector('.filter-panel')) continue;
      var kids=[];
      for(var i=0;i<ctrl.children.length;i++){ var c=ctrl.children[i]; if(!c.classList.contains('weight-panel')) kids.push(c); }
      if(!kids.length) continue;
      var panel=document.createElement('div'); panel.className='filter-panel';
      var head=document.createElement('div'); head.className='fp-title'; head.textContent=specs[s].title;
      var body=document.createElement('div'); body.className='fp-body';
      for(var k=0;k<kids.length;k++) body.appendChild(kids[k]);
      panel.appendChild(head); panel.appendChild(body);
      ctrl.insertBefore(panel, ctrl.firstChild);
    }
  }

  function ensurePanels(){
    var wcCtrl = document.querySelector('#vWc .ctrl');
    if(wcCtrl){
      makeWeightPanel(wcCtrl, 'wp-resilience',
        'AI Resilience weights',
        'Users can customize the scoring weights; default is 25% each.',
        [
          {key:'contact', label:'Contact With Others'},
          {key:'error',   label:'Consequence of Error'},
          {key:'impact',  label:'Impact of Decisions'},
          {key:'exact',   label:'Exact / Accurate'}
        ], WEIGHTS.resilience, rerenderForCategory, 'resilience');
    }
    var indCtrl = document.querySelector('#vInd .ctrl');
    if(indCtrl){
      makeWeightPanel(indCtrl, 'wp-industrial',
        'Industrial Fundamental Score weights',
        'Users can customize the scoring weights; default is 25% each.',
        [
          {key:'histEmp',      label:'Historical Employment Growth'},
          {key:'histWage',     label:'Historical Wage Growth'},
          {key:'projEmp',      label:'Projected Employment Growth'},
          {key:'medianAge',    label:'2025 Median Age'}
        ], WEIGHTS.industrial, rerenderForCategory, 'industrial');
    }
    var tblCtrl = document.querySelector('#vTbl .ctrl');
    if(tblCtrl){
      makeWeightPanel(tblCtrl, 'wp-aibenefit',
        'AI Benefit Score weights',
        'Users can customize the scoring weights; default is 70% augmentation / 30% differentiation.',
        [
          {key:'augmentation',    label:'Augmentation Score (Z Score)'},
          {key:'differentiation', label:'Differentiation Score (Z Score)'}
        ], WEIGHTS.aiBenefit, rerenderForCategory, 'aiBenefit');
    }
    var priCtrl = document.querySelector('#vPri .ctrl');
    if(priCtrl){
      makeWeightPanel(priCtrl, 'wp-priority',
        'Combined Investment Score weights',
        'Users can customize the scoring weights; default is 33% each.',
        [
          {key:'aiBenefit',  label:'AI Benefit Score'},
          {key:'resilience', label:'AI Resilience (Z Score)'},
          {key:'industrial', label:'Industrial Fundamental Score'}
        ], WEIGHTS.priority, rerenderForCategory, 'priority');
    }
  }

  function renameIndustryTab(){
    var btns = document.querySelectorAll('.nb');
    for(var i=0;i<btns.length;i++){
      if(btns[i].getAttribute('data-v')==='ind') btns[i].textContent='Industry Fundamentals';
    }
    var indView=document.getElementById('vInd');
    if(indView){
      var sum = indView.querySelector('.tab-summary');
      if(sum) sum.innerHTML='<b>Industry Fundamentals:</b> This tab shows the industry fundamentals (mapped by occupation) by growth and labor shortage factor. Adjust the weights below to recompute the Industrial Fundamental Score, which feeds into the Investing View tab.';
    }
  }

  function patchRenderWC(){
    // renderWC now renders the resilience Z column inline (single pass); the
    // old per-row post-render rewrite is only needed for legacy builds.
    if(window._wcHasZCol) return;
    if(typeof renderWC!=='function') return;
    var orig = renderWC;
    window.renderWC = function(){
      orig.apply(this, arguments);
      var tb = document.getElementById('wcTb'); if(!tb) return;
      var rows = tb.querySelectorAll('tr');
      for(var i=0;i<rows.length;i++){
        var id = rows[i].getAttribute('data-id'); if(!id) continue;
        var z = window.getResilienceZ(id);
        var raw = window.getResilienceRaw(id);
        var cells = rows[i].children;
        if(cells.length>=3){
          var zVal = (z==null||!isFinite(z))?0:Number(z);
          var rawVal = (raw==null||!isFinite(raw))?null:Number(raw);
          var sign = zVal>0?'+':'';
          var cls = zVal>0?'p':(zVal<0?'n':'z');
          var rawTxt = rawVal==null?'':(' <span style="color:var(--t4);font-weight:400">('+rawVal.toFixed(2)+')</span>');
          cells[2].innerHTML = '<span class="m '+cls+'" style="font-weight:700">'+sign+zVal.toFixed(2)+'</span>'+rawTxt;
          cells[2].classList.add('primary-col-cell');
        }
      }
    };
  }

  function patchRenderMain(){
    // render() now emits the AI Benefit + Differentiation columns directly and
    // handles their sorting via msort('benefit')/msort('diff'), so the whole
    // MutationObserver + re-injection + DOM-reorder pipeline (which rendered the
    // table twice per interaction) is skipped.
    if(window._mainHasBenefitCols) return;
    function injectAiBenefitColumns(){
      var th = document.getElementById('mainTh');
      var tb = document.getElementById('tb');
      if(!th || !tb) return;
      var headRow = th.querySelector('tr');
      if(!headRow) return;

      var thsLen = headRow.children.length;
      if(thsLen === 8){
        // Header: snapshot, then inject AI Benefit (before Aug) and Diff (after Aug)
        var origThs = Array.from(headRow.children);

        // AI Benefit th — sortable
        var benTh = document.createElement('th');
        benTh.className = 'primary-col-head';
        benTh.style.cursor = 'pointer';
        benTh.dataset.aiCustomCol = 'benefit';
        benTh.innerHTML = '<span class="tip-wrap tip-down">AI Benefit Score<span class="sa">&#8597;</span><span class="tip-box">Weighted average of Augmentation Z and Differentiation Z, with differentiation gated so it only boosts when both signals are positive. Click to sort.</span></span>';
        benTh.addEventListener('click', function(){ handleCustomSort('benefit'); });

        // Differentiation Z th — sortable
        var diffTh = document.createElement('th');
        diffTh.className = 'm';
        diffTh.style.cursor = 'pointer';
        diffTh.dataset.aiCustomCol = 'diff';
        diffTh.innerHTML = '<span class="tip-wrap tip-down">Differentiation Z<span class="sa">&#8597;</span><span class="tip-box">Z-score of (P90 wage − P10 wage) / median wage. Higher = more wage dispersion within the occupation. Click to sort.</span></span>';
        diffTh.addEventListener('click', function(){ handleCustomSort('diff'); });

        // Modify Aug th content in place (keep its onclick="msort(\'s\')" attribute)
        origThs[2].innerHTML = '<span class="tip-wrap tip-down">Augmentation Score (Z)<span class="sa">&#8597;</span><span class="tip-box">Z-score of the occupation\'s Augmentation Score across all plotted occupations.</span></span>';
        origThs[2].classList.remove('primary-col-head');

        // Insert: benTh before Aug (origThs[2]); diffTh after Aug (before Category origThs[3])
        headRow.insertBefore(benTh, origThs[2]);
        headRow.insertBefore(diffTh, origThs[3]);
      }

      // Body rows: only inject when row has the original 8 cells
      var rows = tb.querySelectorAll('tr');
      var hasWage = !!(window.DASHBOARD_DATA && window.DASHBOARD_DATA.WAGE);
      for(var i=0;i<rows.length;i++){
        if(rows[i].children.length !== 8) continue;
        var id = rows[i].getAttribute('data-id'); if(!id) continue;
        var origCells = Array.from(rows[i].children);
        var az = window.getAiAugZ(id);
        var dz = window.getDifferentiationZ(id);
        var benefit = window.getAiBenefit(id);
        var zNum = isFinite(az)?Number(az):0;
        var benefitNum = isFinite(benefit)?Number(benefit):0;
        var diffNum = isFinite(dz)?Number(dz):0;
        var zSign = zNum>0?'+':'';
        var benefitSign = benefitNum>0?'+':'';
        var diffSign = diffNum>0?'+':'';
        var zClass = zNum>0?'p':(zNum<0?'n':'z');
        var benefitClass = benefitNum>0?'p':(benefitNum<0?'n':'z');
        var diffClass = diffNum>0?'p':(diffNum<0?'n':'z');
        var rawText = origCells[2].textContent;

        // Modify Aug cell to show z-score
        origCells[2].innerHTML = '<div class="m '+zClass+'" style="font-weight:700">'+zSign+zNum.toFixed(2)+'</div>'
          +'<div class="subcd" style="color:var(--t4);margin-top:1px">raw: '+rawText+'</div>';
        origCells[2].classList.remove('primary-col-cell');

        // AI Benefit cell
        var benTd = document.createElement('td');
        benTd.className = 'm primary-col-cell '+benefitClass;
        benTd.style.fontWeight = '700';
        benTd.innerHTML = benefitSign+benefitNum.toFixed(2);

        // Differentiation cell
        var diffTd = document.createElement('td');
        diffTd.className = 'm '+diffClass;
        diffTd.innerHTML = hasWage ? (diffSign+diffNum.toFixed(2)) : '<span style="color:var(--t4)">—</span>';

        // Order: benTd before origCells[2] (Aug), diffTd before origCells[3] (Category)
        rows[i].insertBefore(benTd, origCells[2]);
        rows[i].insertBefore(diffTd, origCells[3]);
      }

      // After injection, apply custom sort if active and refresh sort indicators
      applyCustomSort();
      updateSortIndicators();
    }

    function handleCustomSort(key){
      if(window._customSort && window._customSort.key === key){
        window._customSort.dir *= -1;
      } else {
        window._customSort = {key: key, dir: -1};
      }
      // Clear any built-in sort indicators visually (they no longer reflect order)
      var headRow = document.querySelector('#mainTh tr');
      if(headRow){
        var ths = headRow.children;
        for(var i=0;i<ths.length;i++) ths[i].classList.remove('sorted');
      }
      applyCustomSort();
      updateSortIndicators();
    }

    function applyCustomSort(){
      var cs = window._customSort;
      if(!cs) return;
      var tb = document.getElementById('tb'); if(!tb) return;
      var rows = Array.from(tb.querySelectorAll('tr'));
      if(!rows.length) return;
      var orig = rows.slice();
      rows.sort(function(a,b){
        var ida = a.getAttribute('data-id'), idb = b.getAttribute('data-id');
        var va, vb;
        if(cs.key === 'benefit'){ va = window.getAiBenefit(ida); vb = window.getAiBenefit(idb); }
        else if(cs.key === 'diff'){ va = window.getDifferentiationZ(ida); vb = window.getDifferentiationZ(idb); }
        else return 0;
        return cs.dir * (va - vb);
      });
      // Skip the appendChild churn (and the MutationObserver loop it would trigger) when
      // the order is already correct.
      var changed = false;
      for(var i=0;i<rows.length;i++) if(rows[i] !== orig[i]){ changed = true; break; }
      if(!changed) return;
      // Disconnect the body observer while we move rows so we don't fire ourselves recursively.
      if(window._tbObserver) window._tbObserver.disconnect();
      try {
        for(var k=0;k<rows.length;k++) tb.appendChild(rows[k]);
      } finally {
        if(window._tbObserver) window._tbObserver.observe(tb, {childList: true});
      }
    }

    function updateSortIndicators(){
      var headRow = document.querySelector('#mainTh tr');
      if(!headRow) return;
      var ths = headRow.children;
      var cs = window._customSort;
      for(var i=0;i<ths.length;i++){
        var th = ths[i];
        var col = th.dataset && th.dataset.aiCustomCol;
        if(!col) continue;
        var sa = th.querySelector('.sa');
        if(!sa) continue;
        if(cs && cs.key === col){
          sa.innerHTML = cs.dir===1?' &#9650;':' &#9660;';
          sa.style.opacity = '1';
          sa.style.color = 'var(--blue)';
          th.classList.add('sorted');
        } else {
          sa.innerHTML = ' &#8597;';
          sa.style.opacity = '';
          sa.style.color = '';
          th.classList.remove('sorted');
        }
      }
    }

    window.injectAiBenefitColumns = injectAiBenefitColumns;

    if(window.msort && !window._msortWrapped){
      var origMsort = window.msort;
      window.msort = function(col){
        window._customSort = null;
        origMsort.apply(this, arguments);
        // The orig msort triggered closure-local render(); our MutationObserver will catch it.
      };
      window._msortWrapped = true;
    }

    // MutationObserver on the body — re-inject whenever rows are rebuilt
    var tb = document.getElementById('tb');
    if(tb && !window._tbObserver){
      window._tbObserver = new MutationObserver(function(){
        if(window._tbObserverScheduled) return;
        window._tbObserverScheduled = true;
        var run = function(){
          window._tbObserverScheduled = false;
          injectAiBenefitColumns();
        };
        if(typeof requestAnimationFrame==='function') requestAnimationFrame(run);
        else setTimeout(run, 0);
      });
      window._tbObserver.observe(tb, {childList: true});
    }
    // MutationObserver on the head — re-inject when headers are rebuilt
    var mainTh = document.getElementById('mainTh');
    if(mainTh && !window._thObserver){
      var headRow = mainTh.querySelector('tr');
      if(headRow){
        window._thObserver = new MutationObserver(function(){
          if(window._thObserverScheduled) return;
          window._thObserverScheduled = true;
          var run = function(){
            window._thObserverScheduled = false;
            injectAiBenefitColumns();
          };
          if(typeof requestAnimationFrame==='function') requestAnimationFrame(run);
          else setTimeout(run, 0);
        });
        window._thObserver.observe(headRow, {childList: true});
      }
    }

    injectAiBenefitColumns();
  }

  function injectWageInfo(id){
    var pnl = document.getElementById('pnl');
    if(!pnl) return;
    var prev = pnl.querySelector('.wage-info-row');
    if(prev && prev.parentNode) prev.parentNode.removeChild(prev);
    var _navOn = document.querySelector('.nb.on');
    if(_navOn && _navOn.getAttribute('data-v')==='wc') return;
    var WD = window.DASHBOARD_DATA && window.DASHBOARD_DATA.WAGE;
    if(!WD) return;
    var rec = WD[id] || (typeof baseSoc==='function' ? WD[baseSoc(id)] : null);
    if(!rec) return;
    var p10 = Number(rec.p10), p50 = Number(rec.p50), p90 = Number(rec.p90);
    if(!isFinite(p10) || !isFinite(p50) || !isFinite(p90) || p50<=0) return;
    var spread = (p90 - p10) / p50;
    var fmt = function(v){ return '$'+Math.round(v).toLocaleString(); };
    var html = '<div class="sct" style="margin-top:14px">Wage Distribution (BLS OEWS 2024)</div>'
      + '<div class="scs">What this occupation pays across the range. A wide spread means skill separates the best from the rest &mdash; the kind of field where being better is worth more. <i>Note: BLS caps P90 at $239,200; some high-wage occupations show that ceiling.</i></div>'
      + '<div class="sc-row wage-info-row">'
      + '<div class="sc-box"><div class="lb">10th Percentile</div><div class="vl" style="font-size:1.3rem">'+fmt(p10)+'</div></div>'
      + '<div class="sc-box detail-em"><div class="lb">Median (50th)</div><div class="vl" style="font-size:1.3rem">'+fmt(p50)+'</div></div>'
      + '<div class="sc-box"><div class="lb">90th Percentile</div><div class="vl" style="font-size:1.3rem">'+fmt(p90)+'</div></div>'
      + '<div class="sc-box"><div class="lb">Wage Spread</div><div class="vl" style="font-size:1.3rem">'+spread.toFixed(2)+'x</div><div class="mt">Pay gap between top and bottom earners — how much skill matters here</div></div>'
      + '</div>';
    // Insert AFTER the first .sc-row in the panel (which is the score summary)
    // Only add the wage section to card-based drill-downs (those with a score row); the
    // Investing View drill-down is a score tree with no .sc-row and intentionally omits it.
    var firstScRow = pnl.querySelector('.sc-row');
    if(firstScRow){
      var wrap = document.createElement('div');
      wrap.innerHTML = html;
      // Place the wage section at the very bottom of the drill-down, just above the
      // "Questions?" contact note.
      var anchor = pnl.querySelector('.pnl-contact-note') || null;
      while(wrap.firstChild) pnl.insertBefore(wrap.firstChild, anchor);
    }
  }
  window.injectWageInfo = injectWageInfo;

  function installDetailWrappers(){
    if(window.detail && !window._detailWrapped){
      var orig = window.detail;
      window.detail = function(id){ orig.call(this, id); injectWageInfo(id); };
      window._detailWrapped = true;
    }
    if(window.wcDetail && !window._wcDetailWrapped){
      var origWc = window.wcDetail;
      window.wcDetail = function(id){ origWc.call(this, id); injectWageInfo(id); };
      window._wcDetailWrapped = true;
    }
    if(window.priDetail && !window._priDetailWrapped){
      var origPri = window.priDetail;
      window.priDetail = function(id){ origPri.call(this, id); injectWageInfo(id); };
      window._priDetailWrapped = true;
    }
    // Industry Fundamentals drill-down intentionally omits the wage-distribution section,
    // so window.indDetail is left unwrapped (no injectWageInfo).
    // The original tbody click handlers reference the closure-local detail functions,
    // so the wrappers above never fire from row clicks. Re-bind onclick on each tbody
    // to route through window.* (which is the wrapped version).
    var bindings = [
      {tbId:'tb',    fnName:'detail'},
      {tbId:'wcTb',  fnName:'wcDetail'},
      {tbId:'indTb', fnName:'indDetail'},
      {tbId:'priTb', fnName:'priDetail'}
    ];
    for(var i=0;i<bindings.length;i++){
      (function(b){
        var el = document.getElementById(b.tbId);
        if(!el || el.dataset.aiDetailWrapped) return;
        el.onclick = function(e){
          var tr = e.target.closest('tr');
          if(!tr) return;
          var id = tr.getAttribute('data-id');
          if(id && typeof window[b.fnName]==='function') window[b.fnName](id);
        };
        el.dataset.aiDetailWrapped = '1';
      })(bindings[i]);
    }
  }

  function init(){
    if(window._customSort === undefined){
      // Default benefit-desc ordering is handled natively by render() (mSort="benefit").
      window._customSort = window._mainHasBenefitCols ? null : {key:'benefit', dir:-1};
    }
    renameIndustryTab();
    boxFilters();
    ensurePanels();
    setupWcFilter();
    if(typeof window.refreshWcSummaries==='function') window.refreshWcSummaries();
    recomputeAllScores();
    if(typeof window.buildPriorityRows==='function') window.buildPriorityRows();
    patchRenderWC();
    patchRenderMain();
    installDetailWrappers();
    if(typeof renderWC==='function') renderWC();
    if(typeof window.render==='function') window.render();
    if(typeof window.renderIndustryData==='function') window.renderIndustryData();
    if(typeof window.renderPriorityIndustries==='function') window.renderPriorityIndustries();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
/* ---- end weights and coordinator patch ---- */
/* rev: investing+career explorer update */
