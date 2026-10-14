(function(){
var QS=[];
(window.SNL_SETS||[]).forEach(function(s){ if(s) QS=QS.concat(s); });
QS=QS.concat(window.SNL_QS||[]);
QS.forEach(function(q){ if(!q.sec) q.sec=q.cat; });
QS.sort(function(a,b){return a.id-b.id;});

var KEY="snl-progress-v2";
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}}
function save(p){try{localStorage.setItem(KEY,JSON.stringify(p));}catch(e){}}
var progress=load();
var app=document.getElementById("app");
var TYPE_LABEL={single:"Single answer",sata:"Select all that apply",matrix:"Matrix",highlight:"Highlight",bowtie:"Bow-tie"};

function sections(){
  var m={};QS.forEach(function(q){(m[q.sec]=m[q.sec]||[]).push(q);});
  return Object.keys(m).sort().map(function(k){return {name:k,items:m[k]};});
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

// Scoring: returns fraction 0..1
function score(q,ans){
  if(q.type==="single") return ans===q.answer?1:0;
  if(q.type==="sata"||q.type==="highlight"){
    var want=q.type==="sata"?q.answers:q.answers, hits=0, miss=0;
    (ans||[]).forEach(function(i){ if(want.indexOf(i)>=0) hits++; else miss++; });
    return Math.max(0,(hits-miss)/want.length);
  }
  if(q.type==="matrix"){
    var c=0; q.rows.forEach(function(r,i){ if(ans&&ans[i]===r.a) c++; });
    return c/q.rows.length;
  }
  if(q.type==="bowtie"){
    var k=0; q.slots.forEach(function(s,i){ if(ans&&ans[i]===s.answer) k++; });
    return k/q.slots.length;
  }
  return 0;
}

function setScore(id,s){progress[id]=s;save(progress);}

function home(){
  var secs=sections(), done=Object.keys(progress).length;
  var html='<div class="card"><h1>Practice by book section</h1><p class="muted">'+QS.length+' original questions across '+secs.length+' sections. '+done+' answered on this device.</p></div><div class="grid">';
  secs.forEach(function(s){
    var answered=s.items.filter(function(q){return progress[q.id]!==undefined;});
    var avg=answered.length?Math.round(100*answered.reduce(function(a,q){return a+progress[q.id];},0)/answered.length):0;
    var pct=answered.length?Math.round(100*answered.length/s.items.length):0;
    html+='<button class="sec" data-sec="'+esc(s.name)+'"><b>'+esc(s.name)+'</b><span class="muted">'+s.items.length+' questions · '+(answered.length?avg+'% avg':'not started')+'</span><div class="bar"><i style="width:'+pct+'%"></i></div></button>';
  });
  html+='</div>';
  app.innerHTML=html;
  app.querySelectorAll("[data-sec]").forEach(function(b){b.onclick=function(){start(QS.filter(function(q){return q.sec===b.dataset.sec;}),b.dataset.sec);};});
}

function start(list,title){
  var order=list.slice();
  state={list:order,i:0,title:title,ans:null,checked:false};
  render();
}
function randomSet(){
  var a=QS.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
  start(a.slice(0,25),"Random 25");
}
var state=null;

function render(){
  if(!state){home();return;}
  if(state.i>=state.list.length){results();return;}
  var q=state.list[state.i];
  var h='<div class="card"><div class="progress">'+esc(state.title)+' · Question '+(state.i+1)+' of '+state.list.length+' · '+TYPE_LABEL[q.type]+'</div>';
  h+='<h2>'+esc(q.q)+'</h2>';
  var disabled=state.checked;
  if(q.type==="single"||q.type==="sata"){
    var multi=q.type==="sata";
    q.options.forEach(function(o,i){
      var sel=multi?(state.ans||[]).indexOf(i)>=0:state.ans===i;
      var cls="opt"+(sel?" sel":"");
      if(state.checked){
        var correct=multi?q.answers.indexOf(i)>=0:q.answer===i;
        if(correct) cls+=" ok"; else if(sel) cls+=" bad";
      }
      h+='<label class="'+cls+'"><input type="'+(multi?"checkbox":"radio")+'" name="a" value="'+i+'"'+(sel?" checked":"")+(disabled?" disabled":"")+'><span>'+esc(o)+'</span></label>';
    });
  } else if(q.type==="highlight"){
    q.items.forEach(function(o,i){
      var sel=(state.ans||[]).indexOf(i)>=0;
      var cls="chip"+(sel?" sel":"");
      if(state.checked&&q.answers.indexOf(i)>=0) cls+=" ok";
      h+='<button class="'+cls+'" data-hi="'+i+'"'+(disabled?" disabled":"")+'>'+esc(o)+'</button>';
    });
  } else if(q.type==="matrix"){
    h+='<table class="m"><tr><th></th>'+q.columns.map(function(c){return '<th class="c">'+esc(c)+'</th>';}).join("")+'</tr>';
    q.rows.forEach(function(r,ri){
      h+='<tr><td>'+esc(r.t)+'</td>';
      q.columns.forEach(function(c,ci){
        var chk=(state.ans&&state.ans[ri]===ci)?" checked":"";
        h+='<td class="c"><input type="radio" name="r'+ri+'" data-row="'+ri+'" value="'+ci+'"'+chk+(disabled?" disabled":"")+'></td>';
      });
      h+='</tr>';
    });
    h+='</table>';
  } else if(q.type==="bowtie"){
    q.slots.forEach(function(s,si){
      h+='<div style="margin-top:12px"><b>'+esc(s.label)+'</b><select data-slot="'+si+'"'+(disabled?" disabled":"")+'><option value="">Choose...</option>';
      s.options.forEach(function(o,oi){
        h+='<option value="'+oi+'"'+((state.ans&&state.ans[si]===oi)?" selected":"")+'>'+esc(o)+'</option>';
      });
      h+='</select></div>';
    });
  }
  if(state.checked){
    var s=score(q,state.ans);
    h+='<div class="why"><b class="'+(s===1?"ok":"bad")+'">'+(s===1?"Correct":"Score: "+Math.round(s*100)+"%")+'</b><br>'+esc(q.why)+'</div>';
  }
  h+='<div class="row"><button class="btn ghost" id="quit">End set</button>';
  if(!state.checked) h+='<button class="btn" id="check">Check answer</button>';
  else h+='<button class="btn" id="next">'+(state.i+1<state.list.length?"Next":"See results")+'</button>';
  h+='</div></div>';
  app.innerHTML=h;
  bind(q);
}

function hasAnswer(q){
  if(q.type==="single") return state.ans!==null&&state.ans!==undefined;
  if(q.type==="sata"||q.type==="highlight") return (state.ans||[]).length>0;
  if(q.type==="matrix") return state.ans&&Object.keys(state.ans).length===q.rows.length;
  if(q.type==="bowtie") return state.ans&&Object.keys(state.ans).length===q.slots.length;
}

function bind(q){
  app.querySelectorAll('input[name="a"]').forEach(function(inp){
    inp.onchange=function(){
      if(q.type==="sata"){state.ans=Array.from(app.querySelectorAll('input[name="a"]:checked')).map(function(x){return +x.value;});}
      else state.ans=+inp.value;
      render();
    };
  });
  app.querySelectorAll("[data-hi]").forEach(function(b){
    b.onclick=function(){
      var i=+b.dataset.hi;state.ans=state.ans||[];
      var k=state.ans.indexOf(i);
      if(k>=0) state.ans.splice(k,1); else state.ans.push(i);
      render();
    };
  });
  app.querySelectorAll("input[data-row]").forEach(function(inp){
    inp.onchange=function(){
      state.ans=state.ans||{};state.ans[+inp.dataset.row]=+inp.value;render();
    };
  });
  app.querySelectorAll("select[data-slot]").forEach(function(sel){
    sel.onchange=function(){
      state.ans=state.ans||{};
      if(sel.value==="") delete state.ans[+sel.dataset.slot]; else state.ans[+sel.dataset.slot]=+sel.value;
      render();
    };
  });
  var c=document.getElementById("check");
  if(c){c.disabled=!hasAnswer(q);c.onclick=function(){if(!hasAnswer(q))return;state.checked=true;setScore(q.id,score(q,state.ans));render();};}
  var n=document.getElementById("next");
  if(n) n.onclick=function(){state.i++;state.ans=null;state.checked=false;render();};
  var quit=document.getElementById("quit");
  if(quit) quit.onclick=function(){state=null;render();};
}

function results(){
  var total=0;state.list.forEach(function(q){total+=progress[q.id]||0;});
  var pct=Math.round(100*total/state.list.length);
  var h='<div class="card"><h1>Practice score: '+pct+'%</h1><p class="muted">'+total.toFixed(1)+' of '+state.list.length+' points. This is a study score, not an official NCLEX result.</p>';
  h+='<div class="row"><button class="btn" id="again">Practice again</button><button class="btn ghost" id="home">Back to sections</button></div></div>';
  app.innerHTML=h;
  document.getElementById("again").onclick=function(){start(state.list,state.title);};
  document.getElementById("home").onclick=function(){state=null;render();};
}

document.getElementById("navHome").onclick=function(){state=null;render();};
document.getElementById("navRandom").onclick=randomSet;
render();
})();
