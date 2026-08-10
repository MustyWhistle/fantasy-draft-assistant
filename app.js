let hist=[],myRoster=[],slot="",filter="ALL",q="";
const $=id=>document.getElementById(id);
for(let i=1;i<=12;i++)$("slot").insertAdjacentHTML("beforeend",`<option>${i}</option>`);
["ALL","QB","RB","WR","TE","DST","K"].forEach((x,i)=>$("filters").insertAdjacentHTML("beforeend",`<button class="filter ${i===0?"active":""}" data-p="${x}">${x}</button>`));
$("poolCount").value=`${PLAYERS.length} players`;

function gone(){return new Set(hist.map(h=>h.id))}
function round(){return Math.floor(hist.length/12)+1}
function counts(){let c={QB:0,RB:0,WR:0,TE:0,DST:0,K:0};myRoster.forEach(p=>c[p.pos]++);return c}
function needBonus(p){
  let c=counts(),r=round();
  if(p.pos==="RB") return c.RB<2?11:(c.RB<4?4:0);
  if(p.pos==="WR") return c.WR<2?11:(c.WR<5?5:0);
  if(p.pos==="TE") return c.TE<1?6:(c.TE<2?1:-6);
  if(p.pos==="QB") return c.QB<1?4:(c.QB<2?-4:-12);
  if(p.pos==="DST") return r>=14 && c.DST<1?9:-35;
  if(p.pos==="K") return r>=15 && c.K<1?9:-40;
  return 0
}
function scarcity(p){
  let g=gone(), left=PLAYERS.filter(x=>!g.has(x.id)&&x.pos===p.pos).length;
  let base={RB:42,WR:58,TE:18,QB:18,DST:10,K:10}[p.pos]||20;
  return Math.max(0,base-left)*.45
}
function pickValue(p){
  let current=hist.length+1;
  let value=(220-p.rank)*.22 + needBonus(p)+scarcity(p);
  let adpEdge=(p.adp-current);
  if(adpEdge< -12)value-=7;
  if(adpEdge>0 && adpEdge<15)value+=3;
  if(p.pos==="QB" && round()<=3)value-=7;
  if(p.pos==="TE" && p.posRank>5 && round()<=4)value-=5;
  return +value.toFixed(1)
}
function best(){let g=gone();return PLAYERS.filter(p=>!g.has(p.id)).sort((a,b)=>pickValue(b)-pickValue(a))[0]}
function snakePick(r,s){return (r%2? (r-1)*12+s : (r-1)*12+(13-s))}
function nextMine(){if(!slot)return"—";let cur=hist.length+1,s=+slot;for(let r=1;r<=20;r++){let p=snakePick(r,s);if(p>=cur)return p}return"—"}
function why(p){
 let a=[];if(needBonus(p)>=8)a.push(`fills an important ${p.pos} need`);
 if(p.adp>hist.length+1)a.push(`market ADP suggests value may still be available`);
 if(scarcity(p)>3)a.push(`${p.pos} scarcity is increasing`);
 if((p.pos==="DST"||p.pos==="K")&&round()>=14)a.push("late-round timing is appropriate");
 return (a.length?a.join(" • "):"best blend of board value, roster construction, and expected availability")+"."
}
function add(id,owner){if(gone().has(id))return;hist.push({id,owner,pick:hist.length+1});if(owner==="me")myRoster.push(PLAYERS[id]);save();render()}
function undo(i){let h=hist[i];hist.splice(i,1);if(h.owner==="me"){let done=false;myRoster=myRoster.filter(p=>{if(!done&&p.id===h.id){done=true;return false}return true})}hist.forEach((x,j)=>x.pick=j+1);save();render()}
function save(){localStorage.setItem("ffa-v3",JSON.stringify({hist,slot}))}
function load(){try{let d=JSON.parse(localStorage.getItem("ffa-v3")||"{}");if(Array.isArray(d.hist))hist=d.hist;if(d.slot){slot=String(d.slot);$("slot").value=slot}myRoster=hist.filter(h=>h.owner==="me").map(h=>PLAYERS[h.id]).filter(Boolean)}catch(e){}}
function render(){
 let g=gone(),b=best();$("overall").textContent=hist.length+1;$("nextMine").textContent=nextMine();$("myPicks").textContent=myRoster.length;$("avail").textContent=PLAYERS.length-g.size;$("roundTxt").textContent=`Round ${round()}`;$("rosterCount").textContent=`${myRoster.length} / 15`;
 $("roster").innerHTML=myRoster.length?myRoster.map(p=>`<span class="chip">${p.pos} ${p.name}</span>`).join(""):"<span class=sub>No players yet.</span>";
 $("rec").innerHTML=!slot?"Choose your draft slot to activate recommendations.":b?`<div class=score>${pickValue(b)}</div><div class=nm>${b.name}</div><div class=pills><span class=pill>${b.pos}${b.posRank}</span><span class=pill>Rank ${b.rank}</span><span class=pill>ADP ${b.adp}</span></div><div class=why>${why(b)}</div><div class=actions><button class=mine onclick="add(${b.id},'me')">MY PICK</button><button class=taken onclick="add(${b.id},'other')">TAKEN</button></div>`:"No players left.";
 let list=PLAYERS.filter(p=>!g.has(p.id)&&(filter==="ALL"||p.pos===filter)&&p.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>pickValue(b)-pickValue(a)).slice(0,80);
 $("players").innerHTML=list.map((p,i)=>`<div class=player><div class=rank>${i+1}</div><div><b>${p.name}</b><div class=sub>${p.pos}${p.posRank}</div></div><div class=rank2>Rk ${p.rank}</div><div class=adp>ADP ${p.adp}</div><div class=actions><button class=mine onclick="add(${p.id},'me')">MY PICK</button><button class=taken onclick="add(${p.id},'other')">TAKEN</button></div></div>`).join("");
 $("history").innerHTML=hist.length?hist.slice().reverse().map((h,r)=>{let i=hist.length-1-r,p=PLAYERS[h.id];return `<button class=historyBtn onclick="undo(${i})"><span>#${h.pick}</span><span>${p.name} • ${p.pos}</span><b class=${h.owner==="me"?"me":"opp"}>${h.owner==="me"?"MY PICK":"OTHER"} ✕</b></button>`}).join(""):"<span class=sub>No picks entered.</span>";
}
$("slot").onchange=e=>{slot=e.target.value;save();render()};$("search").oninput=e=>{q=e.target.value;render()};
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.p;render()});
$("reset").onclick=()=>{if(confirm("Reset entire draft?")){hist=[];myRoster=[];localStorage.removeItem("ffa-v3");render()}};
load();render();