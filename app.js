const players=[
["Jahmyr Gibbs","RB",1],["Bijan Robinson","RB",2],["Christian McCaffrey","RB",3],["Puka Nacua","WR",4],
["Ja'Marr Chase","WR",5],["CeeDee Lamb","WR",6],["Amon-Ra St. Brown","WR",7],["Justin Jefferson","WR",8],
["Jonathan Taylor","RB",9],["Malik Nabers","WR",10],["Saquon Barkley","RB",11],["Jaxon Smith-Njigba","WR",12],
["Brian Thomas Jr.","WR",13],["Ashton Jeanty","RB",14],["De'Von Achane","RB",15],["Derrick Henry","RB",16],
["Drake London","WR",17],["Nico Collins","WR",18],["Trey McBride","TE",19],["A.J. Brown","WR",20],
["Breece Hall","RB",21],["Josh Allen","QB",22],["Brock Bowers","TE",23],["Chris Olave","WR",24],
["Ladd McConkey","WR",25],["James Cook","RB",26],["Tee Higgins","WR",27],["George Pickens","WR",28],
["Rashee Rice","WR",29],["Drake Maye","QB",30],["Lamar Jackson","QB",31],["Jayden Daniels","QB",32],
["Sam LaPorta","TE",33],["Tyler Warren","TE",34],["Jeremiyah Love","RB",35],["Kenneth Walker III","RB",36],
["Josh Jacobs","RB",37],["Terry McLaurin","WR",38],["Marvin Harrison Jr.","WR",39],["Garrett Wilson","WR",40],
["James Conner","RB",41],["Deebo Samuel","WR",42],["George Kittle","TE",43],["Colston Loveland","TE",44],
["Dak Prescott","QB",45],["Kyler Murray","QB",46],["Bo Nix","QB",47],["Caleb Williams","QB",48],
["Rhamondre Stevenson","RB",49],["David Montgomery","RB",50],["Jordan Addison","WR",51]
].map((x,i)=>({name:x[0],pos:x[1],rank:x[2],id:i}));

let drafted=new Set(), roster=[], slot="", filter="ALL";
const $=x=>document.getElementById(x);
for(let i=1;i<=12;i++) $("slot").insertAdjacentHTML("beforeend",`<option>${i}</option>`);
["ALL","QB","RB","WR","TE"].forEach((x,i)=>$("filters").insertAdjacentHTML("beforeend",`<button class="filter ${i===0?"active":""}" data-p="${x}">${x}</button>`));

function need(pos){let n=roster.filter(p=>p.pos===pos).length;return pos==="RB"?Math.max(0,2-n):pos==="WR"?Math.max(0,2-n):pos==="QB"?Math.max(0,1-n):pos==="TE"?Math.max(0,1-n):0}
function scarcity(pos){let n=players.filter(p=>!drafted.has(p.id)&&p.pos===pos).length;return pos==="TE"||pos==="QB"?Math.max(0,16-n)*1.3:pos==="RB"?Math.max(0,42-n)*.35:Math.max(0,58-n)*.22}
function score(p){return +(100-(p.rank*.52)+ (need(p.pos)?8:-1)+scarcity(p.pos)).toFixed(1)}
function best(){return players.filter(p=>!drafted.has(p.id)).sort((a,b)=>score(b)-score(a))[0]}
function reason(p){let a=[];if(need(p.pos))a.push(`fills a ${p.pos} need`);if(scarcity(p.pos)>5)a.push("scarcity is rising");if(p.rank<=15)a.push("elite early-round value");return (a.length?a.join(" • "):"best roster fit and remaining value")+"."}
function render(){
$("slotLabel").textContent=slot?`Slot #${slot}`:"Set draft position";
let b=best();
$("rec").className="rec"+(b?"":" empty");
$("rec").innerHTML=b?`<div class="score">${score(b)}</div><div class="name">${b.name}</div><div class="pills"><span class="pill">${b.pos}</span><span class="pill">Overall ${b.rank}</span><span class="pill">${need(b.pos)?"NEED":"DEPTH"}</span></div><div class="why">${reason(b)}</div><button class="pick" onclick="draft(${b.id})">Draft ${b.name}</button>`:"Draft pool exhausted.";
$("count").textContent=`${roster.length} / 15`;
$("roster").innerHTML=roster.map(p=>`<span class="chip"><b>${p.pos}</b> ${p.name}</span>`).join("");
let list=players.filter(p=>!drafted.has(p.id)&&(filter==="ALL"||p.pos===filter)).sort((a,b)=>score(b)-score(a)).slice(0,35);
$("players").innerHTML=list.map((p,i)=>`<div class="player"><div class="rank">${i+1}</div><div><b>${p.name}</b><div class="sub">${p.pos} • Overall ${p.rank}</div></div><div class="val">${score(p)}</div><button class="pick" onclick="draft(${p.id})">Draft</button></div>`).join("");
$("dc").textContent=drafted.size;
$("drafted").innerHTML=players.filter(p=>drafted.has(p.id)).map(p=>`<button onclick="undraft(${p.id})">${p.name} · ${p.pos}</button>`).join("");
}
function draft(id){let p=players.find(x=>x.id===id);if(!p||drafted.has(id))return;drafted.add(id);roster.push(p);render()}
function undraft(id){drafted.delete(id);roster=roster.filter(p=>p.id!==id);render()}
$("slot").onchange=e=>{slot=e.target.value;render()};
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");filter=b.dataset.p;render()});
$("reset").onclick=()=>{if(confirm("Reset draft?")){drafted.clear();roster=[];render()}};
render();