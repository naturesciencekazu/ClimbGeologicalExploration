(function(){
  var P = window.PAGE, M = P.items, NG = !!P.noGrade;
  var GR = ["A-","A+","B-","B+","C-","C+","D-","D+","E-","E+"];
  var SV = {S:5,A:4,B:3,C:2,D:1};
  var REG = ["北海道","東北","関東","中部","近畿","中国","四国","九州"];
  var F = [["geo","地学"],["chem","化学"],["plant","植物"],["ice","氷河・気象"]];
  function gdisp(g){ return g.replace("-","−").replace("+","＋"); }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
  M.forEach(function(m){
    if(m.ct!=null){ m.c = m.ct*1.8 + m.km*0.3 + m.up*10 + m.dn*0.6; m.lv = m.c/10; } else { m.lv = 0; }
    var v = F.map(function(f){return SV[m[f[0]]];}).sort(function(a,b){return b-a;});
    m.score = Math.round((v[0]*0.4 + v[1]*0.3 + v[2]*0.2 + v[3]*0.1)/5*100);
    m.letter = m.score>=88?"S":m.score>=74?"A":m.score>=60?"B":m.score>=45?"C":"D";
    m.gi = m.g ? GR.indexOf(m.g) : 0;
  });
  function warnText(m){
    var out = [];
    if(!NG && m.gi>=4){
      if(m.stay>=1) out.push("<strong>⚠ 1泊以上・技術度"+gdisp(m.g)+"：</strong>難易度の高いルートです。体力・岩場経験・装備・天候判断に余裕がある場合のみ計画してください。");
      else if(m.stay===0.5) out.push("<strong>⚠ 1泊する場合は技術度"+gdisp(m.g)+"の高難度ルート扱い：</strong>小屋は要予約。行程と天候に余裕を持たせてください。");
    }
    if(m.w) out.push("<strong>⚠ 注意：</strong>"+esc(m.w));
    return out.map(function(t){return '<div class="warn">'+t+'</div>';}).join("");
  }
  function card(m,i,key){
    var sc = F.map(function(f){
      return '<span class="sc '+m[f[0]]+(key===f[0]?' on':'')+'">'+f[1]+'<b>'+m[f[0]]+'</b></span>';
    }).join("");
    var facts = [];
    if(!NG){
      facts.push('<span>体力度 <span class="num">'+m.lv.toFixed(1)+'</span>'+(m.est?'<span class="est">（試算）</span>':'')+'<span class="bar" aria-hidden="true"><i style="width:'+Math.min(100,m.lv*10)+'%"></i></span></span>');
      facts.push('<span>ルート定数 <span class="num">'+m.c.toFixed(1)+'</span></span>');
      facts.push('<span>CT <span class="num">'+m.ct.toFixed(1)+'</span>h</span>');
      facts.push('<span>距離 <span class="num">'+m.km.toFixed(1)+'</span>km</span>');
      facts.push('<span>累積↑ <span class="num">'+Math.round(m.up*1000)+'</span>m</span>');
      if(m.days) facts.push('<span>'+esc(m.days)+'</span>');
    }
    (m.facts||[]).forEach(function(f){ facts.push('<span>'+esc(f[0])+' <span class="num">'+esc(f[1])+'</span></span>'); });
    if(m.bloom) facts.push('<span class="bloom">見頃 <b>'+esc(m.bloom)+'</b></span>');
    var badge = NG
      ? '<span class="rank">'+String(i+1).padStart(2,"0")+'</span><span class="g T">'+m.letter+'</span><span class="small">総合<br>'+m.score+'点</span>'
      : '<span class="rank">'+String(i+1).padStart(2,"0")+'</span><span class="g '+m.g[0]+'">'+gdisp(m.g)+'</span><span class="small">公式 '+esc(m.of)+(m.est?'<br>試算':'')+'</span>';
    return '<li class="m">'+
      '<div class="badge">'+badge+'</div>'+
      '<div class="body"><div class="top"><h3 class="name">'+esc(m.n)+(m.vol?' <span class="vol" title="火山">⛰</span>':'')+'</h3>'+
      '<span class="sub"><span class="reg">'+esc(m.reg)+'</span>'+esc(m.r)+'</span>'+
      (NG?'':'<span class="overall">総合 <b>'+m.letter+'</b>（'+m.score+'点）</span>')+'</div>'+
      (facts.length?'<div class="facts">'+facts.join("")+'</div>':'')+
      '<div class="scores">'+sc+'</div>'+
      '<p class="note">'+esc(m.t)+'</p>'+
      (m.s?'<p class="status">'+esc(m.s)+'</p>':'')+
      warnText(m)+'</div></li>';
  }
  var keys = [["all","総合"],["geo","地学"],["chem","化学"],["plant","植物"],["ice","氷河・気象"]];
  if(!NG) keys.push(["diff","難易度"],["lv","体力度"]);
  var state = {key: NG?"all":"diff", vol:false, reg:"全国"};
  try{ var sv = JSON.parse(localStorage.getItem("sort2-"+P.kind)||"null"); if(sv){ if(keys.some(function(k){return k[0]===sv.key;})) state.key=sv.key; state.vol=!!sv.vol; if(sv.reg) state.reg=sv.reg; } }catch(e){}
  var regs = REG.filter(function(r){ return M.some(function(m){return m.reg===r;}); });
  if(state.reg!=="全国" && regs.indexOf(state.reg)<0) state.reg="全国";
  function render(){
    var arr = M.filter(function(m){ return (!state.vol || m.vol) && (state.reg==="全国" || m.reg===state.reg); });
    var k = state.key;
    var byDiff = function(a,b){ return b.gi-a.gi || b.lv-a.lv; };
    arr.sort(function(a,b){
      if(k==="diff") return byDiff(a,b);
      if(k==="lv") return b.lv-a.lv || b.gi-a.gi;
      if(k==="all") return b.score-a.score || byDiff(a,b);
      return SV[b[k]]-SV[a[k]] || b.score-a.score || byDiff(a,b);
    });
    document.getElementById("list").innerHTML = arr.length ? arr.map(function(m,i){return card(m,i,k);}).join("") : '<li class="empty">この条件に当てはまる場所はありません。</li>';
    document.querySelectorAll("button[data-k]").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.k===k?"true":"false"); });
    document.querySelectorAll("button[data-r]").forEach(function(b){ b.setAttribute("aria-pressed", b.dataset.r===state.reg?"true":"false"); });
    document.getElementById("f-vol").setAttribute("aria-pressed", state.vol?"true":"false");
    document.getElementById("count").textContent = arr.length+"件 / 全"+M.length+"件";
    try{ localStorage.setItem("sort2-"+P.kind, JSON.stringify(state)); }catch(e){}
  }
  function cnt(r){ return r==="全国"?M.length:M.filter(function(m){return m.reg===r;}).length; }
  document.getElementById("controls").innerHTML =
    '<div class="sortbar" role="group" aria-label="地域"><b>地域</b>'+
    ["全国"].concat(regs).map(function(r){return '<button type="button" data-r="'+r+'" aria-pressed="false">'+r+' <span class="c">'+cnt(r)+'</span></button>';}).join("")+
    '</div><div class="sortbar" role="group" aria-label="並び替え"><b>並び替え</b>'+
    keys.map(function(k){return '<button type="button" data-k="'+k[0]+'" aria-pressed="false">'+k[1]+'順</button>';}).join("")+
    '</div><div class="sortbar"><button type="button" class="filter" id="f-vol" aria-pressed="false">⛰ 火山だけ表示</button><span class="count" id="count"></span></div>';
  document.querySelectorAll("button[data-k]").forEach(function(b){ b.addEventListener("click",function(){ state.key=b.dataset.k; render(); }); });
  document.querySelectorAll("button[data-r]").forEach(function(b){ b.addEventListener("click",function(){ state.reg=b.dataset.r; render(); }); });
  document.getElementById("f-vol").addEventListener("click",function(){ state.vol=!state.vol; render(); });
  render();
})();
