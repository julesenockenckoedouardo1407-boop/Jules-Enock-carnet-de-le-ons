const KEY="jules_enock_carnet_v1", DRAFTS="jules_enock_drafts_v1";
let data=JSON.parse(localStorage.getItem(KEY)||"[]"), drafts=JSON.parse(localStorage.getItem(DRAFTS)||"{}");
const $=id=>document.getElementById(id);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function render(){
 const q=$("search").value.toLowerCase().trim(), box=$("items"); box.innerHTML="";
 const list=data.filter(x=>Object.values(x).join(" ").toLowerCase().includes(q));
 $("empty").style.display=list.length?"none":"block";
 list.forEach(x=>{
  const el=document.createElement("article"); el.className="item";
  const status=x.status||"À faire";
  el.innerHTML=`<h3>${esc(x.title)} <small>(${esc(x.type)})</small></h3>
  <div class="meta">${x.subject?`📘 ${esc(x.subject)} · `:""}${x.book?`Livre: ${esc(x.book)} · `:""}${x.page?`Page: ${esc(x.page)} · `:""}${x.dueDate?`📅 ${esc(x.dueDate)} · `:""}${x.courseTime?`⏰ ${esc(x.courseTime)} · `:""}${x.teacher?`👨‍🏫 ${esc(x.teacher)}`:""}</div>
  ${x.teacherNotes?`<div class="meta">📝 Notes du professeur: ${esc(x.teacherNotes)}</div>`:""}
  <div class="badges">${statusBadge(status)} ${x.grade!==""&&x.grade!=null?`<span class="badge done">Note: ${esc(x.grade)}</span>`:""}</div>
  <div class="item-actions">
   <button onclick="cycleStatus('${x.id}')">🔄 État</button>
   <button onclick="grade('${x.id}')">⭐ Note</button>
   <button onclick="editItem('${x.id}')">✏️ Modifier</button>
   <button onclick="prepareDraft('${x.id}')">📝 Rédiger</button>
   <button onclick="removeItem('${x.id}')">🗑️ Supprimer</button>
  </div>`;
  box.appendChild(el);
 });
 renderDraftSelect();
}
function statusBadge(s){let c=s.includes("non")||s.includes("Non")?"bad":s.includes("Remis")||s.includes("su")?"done":"warn";return `<span class="badge ${c}">${esc(s)}</span>`}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
const statuses=["Leçon sue","Leçon non sue","Devoir rédigé","Devoir non rédigé","Devoir remis","Devoir non remis"];
function cycleStatus(id){let x=data.find(a=>a.id===id),i=statuses.indexOf(x.status);x.status=statuses[(i+1)%statuses.length];save();render()}
function grade(id){let x=data.find(a=>a.id===id),v=prompt("Note obtenue :",x.grade??"");if(v!==null){x.grade=v;save();render()}}
function removeItem(id){if(confirm("Supprimer cet élément ?")){data=data.filter(x=>x.id!==id);save();render()}}
function editItem(id){
 let x=data.find(a=>a.id===id); if(!x)return;
 ["itemId","title","type","subject","book","page","dueDate","courseTime","teacher","teacherNotes"].forEach(k=>$(k).value=x[k]??"");
 $("saveBtn").textContent="Mettre à jour"; window.scrollTo({top:0,behavior:"smooth"});
}
$("lessonForm").addEventListener("submit",e=>{
 e.preventDefault();
 const id=$("itemId").value, obj={id:id||uid(),title:$("title").value,type:$("type").value,subject:$("subject").value,book:$("book").value,page:$("page").value,dueDate:$("dueDate").value,courseTime:$("courseTime").value,teacher:$("teacher").value,teacherNotes:$("teacherNotes").value,status:"Leçon"=== $("type").value?"Leçon non sue":"Devoir non rédigé",grade:""};
 if(id){let old=data.find(x=>x.id===id);obj.status=old.status;obj.grade=old.grade;data=data.map(x=>x.id===id?obj:x)}else data.unshift(obj);
 save();resetForm();render();
});
function resetForm(){$("lessonForm").reset();$("itemId").value="";$("saveBtn").textContent="Enregistrer"}
$("resetForm").onclick=resetForm;$("cancelEdit").onclick=resetForm;$("search").oninput=render;

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".view").forEach(x=>x.classList.add("hidden"));$(b.dataset.view+"View").classList.remove("hidden")});
function renderDraftSelect(){let s=$("draftSelect"),old=s.value;s.innerHTML='<option value="">— Nouveau devoir —</option>'+data.filter(x=>x.type==="Devoir").map(x=>`<option value="${x.id}">${esc(x.title)}</option>`).join("");s.value=old||""}
function prepareDraft(id){document.querySelector('[data-view="redaction"]').click();$("draftSelect").value=id;loadDraft(id)}
function loadDraft(id){
 let x=data.find(a=>a.id===id),d=drafts[id]||{};
 $("draftTitle").value=d.title||x?.title||"";$("draftDate").value=d.date||x?.dueDate||"";$("draftText").value=d.text||"";$("studentName").value=d.student||"";
}
$("draftSelect").onchange=e=>loadDraft(e.target.value);
$("saveDraftBtn").onclick=()=>{let id=$("draftSelect").value||uid();if(!$("draftSelect").value){let title=$("draftTitle").value||"Devoir";drafts[id]={title:$("draftTitle").value,date:$("draftDate").value,text:$("draftText").value,student:$("studentName").value};renderDraftSelect();$("draftSelect").value=id}else drafts[id]={title:$("draftTitle").value,date:$("draftDate").value,text:$("draftText").value,student:$("studentName").value};localStorage.setItem(DRAFTS,JSON.stringify(drafts));alert("Devoir enregistré sur cet appareil.")}
$("printBtn").onclick=()=>window.print();

let deferred;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("installBtn").classList.remove("hidden")});
$("installBtn").onclick=async()=>{if(deferred){deferred.prompt();deferred=null;$("installBtn").classList.add("hidden")}};
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(console.error));
render();
