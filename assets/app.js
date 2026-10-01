(function(){
  "use strict";
  var F = (window.FRUITS || []).map(function(f, i){ f._i = i; return f; });
  var $ = function(s){ return document.querySelector(s); };
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); };
  var norm = function(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s×·\-'()（）]/g,""); };
  F.forEach(function(f){
    f._hay = norm([f.zh, f.aliases.join(" "), f.en, f.sci, f.pinyin, f.pinyin_alias || "", f.family, f.family_sci, f.genus, f.genus_sci].join(" "));
  });
  var state = { q:"", family:"", letter:"", mode:"py", sort:"default" };
  var visible = [];

  $("#total").textContent = F.filter(function(f){ return !f.special; }).length;
  // families
  var fams = {};
  F.forEach(function(f){ var k = f.family || "未知"; fams[k] = fams[k] || {n:0, sci:f.family_sci}; fams[k].n++; });
  Object.keys(fams).sort(function(a,b){ return fams[b].n - fams[a].n || a.localeCompare(b,"zh"); }).forEach(function(k){
    var o = document.createElement("option"); o.value = k; o.textContent = k + (fams[k].sci ? " " + fams[k].sci : "") + "（" + fams[k].n + "）"; $("#family").appendChild(o);
  });

  function initialOf(f){ return state.mode === "py" ? f.py_initial : f.en_initial; }
  function renderLetters(){
    var have = {};
    F.forEach(function(f){ if (matchesBase(f)) have[initialOf(f)] = 1; });
    var box = $("#letters"); box.innerHTML = "";
    var all = document.createElement("button"); all.textContent = "全部"; all.style.padding = "0 10px";
    if (!state.letter) all.className = "active";
    all.onclick = function(){ state.letter = ""; update(); };
    box.appendChild(all);
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function(L){
      var b = document.createElement("button"); b.textContent = L;
      if (!have[L]) b.disabled = true;
      if (state.letter === L) b.className = "active";
      b.onclick = function(){ state.letter = state.letter === L ? "" : L; update(); };
      box.appendChild(b);
    });
  }
  function matchesBase(f){
    if (state.family && (f.family || "未知") !== state.family) return false;
    if (state.q){ var qs = state.q.split(/\s+/).map(norm).filter(Boolean); for (var i=0;i<qs.length;i++) if (f._hay.indexOf(qs[i]) < 0) return false; }
    return true;
  }
  function sorter(a,b){
    switch(state.sort){
      case "py": return a.pinyin.localeCompare(b.pinyin);
      case "en": return a.en.localeCompare(b.en);
      case "family": return (a.family_sci||"").localeCompare(b.family_sci||"") || a.pinyin.localeCompare(b.pinyin);
      default: return a._i - b._i;
    }
  }
  function card(f){
    var b = document.createElement("button"); b.className = "card"; b.type = "button";
    b.setAttribute("aria-label", f.zh + " " + f.en);
    b.innerHTML = '<div class="thumb"><img loading="lazy" decoding="async" src="' + esc(f.img) + '" width="' + f.img_w + '" height="' + f.img_h + '" alt="' + esc(f.zh) + '"></div>' +
      '<div class="card-body"><h3>' + esc(f.zh) + '</h3><p class="en">' + esc(f.en) + '</p><p class="sci">' + esc(f.sci) + '</p><span class="tag">' + esc(f.family || "") + '</span></div>';
    b.onclick = function(){ openFruit(f.id); };
    return b;
  }
  function update(){
    renderLetters();
    visible = F.filter(function(f){ return matchesBase(f) && (!state.letter || initialOf(f) === state.letter); }).sort(sorter);
    var g = $("#grid"); g.innerHTML = "";
    var frag = document.createDocumentFragment(); visible.forEach(function(f){ frag.appendChild(card(f)); }); g.appendChild(frag);
    $("#empty").hidden = visible.length > 0;
    var bits = [];
    if (state.q) bits.push("关键词“" + state.q + "”");
    if (state.family) bits.push(state.family);
    if (state.letter) bits.push((state.mode === "py" ? "拼音" : "英文") + "首字母 " + state.letter);
    $("#status").textContent = "显示 " + visible.length + " / " + F.length + " 种水果" + (bits.length ? " · 筛选：" + bits.join("，") : "");
  }
  // modal
  var current = null;
  function fact(dt, dd){ return dd ? "<dt>" + dt + "</dt><dd>" + dd + "</dd>" : ""; }
  function chips(arr){ return arr && arr.length ? arr.map(function(x){ return '<span class="chip">' + esc(x) + "</span>"; }).join("") : ""; }
  function openFruit(id, noHash){
    var f = F.filter(function(x){ return x.id === id; })[0]; if (!f) return;
    current = f;
    $("#m-img").src = f.img; $("#m-img").alt = f.zh + "（" + f.en + "）";
    $("#m-title").textContent = f.zh;
    $("#m-sub").innerHTML = esc(f.en) + (f.sci ? " · <i>" + esc(f.sci) + "</i>" : "") + (f.aliases.length ? "<br>别名：" + esc(f.aliases.join("、")) : "");
    $("#m-intro").textContent = f.intro;
    var c = f.credit;
    var lic = c.license_url ? '<a href="' + esc(c.license_url) + '" target="_blank" rel="noopener license">' + esc(c.license) + "</a>" : esc(c.license);
    $("#m-credit").innerHTML = f.special ? esc(c.credit) : "图片：<a href=\"" + esc(c.page) + "\" target=\"_blank\" rel=\"noopener\">" + esc(c.file) + "</a><br>作者：" + esc(c.artist) + " · 许可：" + lic + " · 来源：Wikimedia Commons（已缩放）";
    $("#m-facts").innerHTML = f.special ? fact("中文名", esc(f.zh)) + fact("英文名", esc(f.en)) + fact("分类", esc(f.family)) :
      fact("中文名", esc(f.zh)) + fact("英文名", esc(f.en)) + fact("学名", "<i>" + esc(f.sci) + "</i>" + (f.rank ? "（" + esc(f.rank) + "）" : "")) +
      fact("科", esc(f.family) + (f.family_sci ? " <i>" + esc(f.family_sci) + "</i>" : "")) +
      fact("属", f.genus ? esc(f.genus) + (f.genus_sci ? " <i>" + esc(f.genus_sci) + "</i>" : "") : "") +
      fact("果实类型", chips(f.fruit_type)) + fact("用途记录", chips(f.uses)) +
      fact("数据来源", '<small style="color:#888">Wikidata 结构化数据（果实类型、用途等条目并不完整）</small>');
    $("#m-links").innerHTML = f.special ? "" : '<a href="' + esc(f.wikidata) + '" target="_blank" rel="noopener">Wikidata ' + esc(f.qid) + '</a><a href="' + esc(f.enwiki) + '" target="_blank" rel="noopener">Wikipedia（英文）</a><a href="https://zh.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(f.zh) + '" target="_blank" rel="noopener">中文维基搜索</a>';
    $("#modal").hidden = false; document.body.style.overflow = "hidden";
    if (!noHash) history.replaceState(null, "", "#fruit=" + encodeURIComponent(f.id));
    $(".modal-card").scrollTop = 0;
  }
  function closeModal(){ $("#modal").hidden = true; document.body.style.overflow = ""; current = null; history.replaceState(null, "", location.pathname + location.search); }
  function step(d){
    if (!current) return; var list = visible.length ? visible : F;
    var i = list.indexOf(current); if (i < 0) i = 0;
    openFruit(list[(i + d + list.length) % list.length].id);
  }
  document.querySelectorAll("[data-close]").forEach(function(el){ el.onclick = closeModal; });
  $("#m-prev").onclick = function(){ step(-1); }; $("#m-next").onclick = function(){ step(1); };
  document.addEventListener("keydown", function(e){
    if ($("#modal").hidden) return;
    if (e.key === "Escape") closeModal(); else if (e.key === "ArrowLeft") step(-1); else if (e.key === "ArrowRight") step(1);
  });
  // controls
  var t; $("#q").addEventListener("input", function(e){ clearTimeout(t); t = setTimeout(function(){ state.q = e.target.value.trim(); state.letter = ""; update(); }, 120); });
  $("#family").onchange = function(e){ state.family = e.target.value; state.letter = ""; update(); };
  $("#sort").onchange = function(e){ state.sort = e.target.value; update(); };
  document.querySelectorAll(".mode-btn").forEach(function(b){ b.onclick = function(){
    document.querySelectorAll(".mode-btn").forEach(function(x){ x.classList.remove("active"); }); b.classList.add("active");
    state.mode = b.getAttribute("data-mode"); state.letter = ""; update(); }; });
  $("#reset").onclick = function(){ state = {q:"", family:"", letter:"", mode:state.mode, sort:"default"}; $("#q").value = ""; $("#family").value = ""; $("#sort").value = "default"; update(); };
  update();
  var m = location.hash.match(/fruit=([^&]+)/); if (m) openFruit(decodeURIComponent(m[1]), true);
})();
