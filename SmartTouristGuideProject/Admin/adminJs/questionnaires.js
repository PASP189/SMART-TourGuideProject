document.addEventListener("DOMContentLoaded",()=>{

const modal=document.getElementById("questionnaireModal");
const closeBtn=document.querySelector(".close");
const searchInput=document.getElementById("searchQuestionnaire");
const responseCount=document.getElementById("responseCount");
const exportBtn=document.getElementById("exportResponses");
const printBtn=document.getElementById("printResponses");
const statsModal=document.getElementById("statsModal");
const filterModal=document.getElementById("filterModal");

document.querySelectorAll(".view").forEach(button=>{

button.addEventListener("click",function(){

const row=this.closest("tr");

document.getElementById("userName").innerText=row.cells[0].innerText;
document.getElementById("travelType").innerText=row.cells[1].innerText;
document.getElementById("budget").innerText=row.cells[2].innerText;
document.getElementById("duration").innerText=row.cells[3].innerText;
document.getElementById("companions").innerText=row.cells[4].innerText;
document.getElementById("submittedDate").innerText=row.cells[5].innerText;

document.getElementById("userEmail").innerText=
row.cells[0].innerText.toLowerCase().replace(/\s+/g,".")+"@gmail.com";

document.getElementById("climate").innerText="Moderate";
document.getElementById("accommodation").innerText="Hotel";
document.getElementById("transport").innerText="Private Vehicle";
document.getElementById("interest").innerText="Nature Photography";

if(modal)modal.style.display="flex";

});

});

if(closeBtn){

closeBtn.addEventListener("click",()=>{

if(modal)modal.style.display="none";

});

}

window.addEventListener("click",(e)=>{

if(e.target===modal){

modal.style.display="none";

}

if(statsModal&&e.target===statsModal){

statsModal.style.display="none";

}

if(filterModal&&e.target===filterModal){

filterModal.style.display="none";

}

});

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

if(statsModal)statsModal.style.display="none";

if(filterModal)filterModal.style.display="none";

}

});

if(searchInput){

searchInput.addEventListener("keyup",()=>{

const value=searchInput.value.toLowerCase();

document.querySelectorAll(".questionnaire-table tbody tr").forEach(row=>{

row.style.display=row.innerText.toLowerCase().includes(value)?"":"none";

});

});

}

document.querySelectorAll(".delete").forEach(button=>{

button.addEventListener("click",function(){

const row=this.closest("tr");

const user=row.cells[0].innerText;

if(confirm("Delete questionnaire of "+user+" ?")){

row.remove();

updateCount();

}

});

});

function updateCount(){

const total=document.querySelectorAll(".questionnaire-table tbody tr").length;

if(responseCount)responseCount.innerText=total;

}

if(printBtn){

printBtn.addEventListener("click",()=>{

window.print();

});

}

if(exportBtn){

exportBtn.addEventListener("click",exportResponsesToCSV);

}

const saveBtn=document.querySelector(".save-btn");

if(saveBtn){

saveBtn.addEventListener("click",()=>{

window.print();

});

}

document.querySelectorAll(".quick-card").forEach(card=>{

card.addEventListener("click",()=>{

const title=card.querySelector("h3").innerText;

switch(title){

case "View Responses":

document.querySelector(".table-section").scrollIntoView({behavior:"smooth"});

break;

case "Travel Statistics":

showTravelStatistics();

break;

case "Export Reports":

exportResponsesToCSV();

break;

case "Filter Results":

showFilterMenu();

break;

}

});

});

const closeStatsBtn=document.getElementById("closeStatsModal");

if(closeStatsBtn){

closeStatsBtn.addEventListener("click",()=>{

if(statsModal)statsModal.style.display="none";

});

}

const closeFilterBtn=document.getElementById("closeFilterModal");

if(closeFilterBtn){

closeFilterBtn.addEventListener("click",()=>{

if(filterModal)filterModal.style.display="none";

});

}

document.querySelectorAll(".pagination button").forEach(button=>{

button.addEventListener("click",()=>{

document.querySelectorAll(".pagination button").forEach(btn=>{

btn.classList.remove("active-page");

});

if(button.innerText!=="❮"&&button.innerText!=="❯"){

button.classList.add("active-page");

}

});

});

setInterval(()=>{

const activity=document.querySelector(".activity-section");

if(activity){

const card=document.createElement("div");

card.className="activity-card";

card.innerHTML=`

<i class="fa-solid fa-clipboard-question"></i>

<p>New questionnaire received successfully.</p>

<span>Just now</span>

`;

activity.appendChild(card);

const cards=document.querySelectorAll(".activity-card");

if(cards.length>6){

cards[0].remove();

}

}

},60000);

console.log("VISIT LANKA Questionnaire Management Loaded");

});


function exportResponsesToCSV(){

const rows=document.querySelectorAll(".questionnaire-table tbody tr");

if(rows.length===0){

alert("No responses to export.");

return;

}

const header=["User","Travel Type","Budget","Days","Companions","Submitted"];

const csvRows=[header.join(",")];

rows.forEach(row=>{

if(row.style.display==="none")return;

const cells=row.querySelectorAll("td");

const values=[

cells[0]?cells[0].innerText:"",

cells[1]?cells[1].innerText:"",

cells[2]?cells[2].innerText:"",

cells[3]?cells[3].innerText:"",

cells[4]?cells[4].innerText:"",

cells[5]?cells[5].innerText:""

];

const escape=(val)=>`"${String(val).replace(/"/g,'""')}"`;

csvRows.push(values.map(escape).join(","));

});

const csvContent=csvRows.join("\n");

const blob=new Blob([csvContent],{type:"text/csv;charset=utf-8;"});

const url=URL.createObjectURL(blob);

const link=document.createElement("a");

link.href=url;

link.setAttribute("download",`visit-lanka-questionnaires-${new Date().toISOString().slice(0,10)}.csv`);

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

URL.revokeObjectURL(url);

}


function showTravelStatistics(){

const statsModal=document.getElementById("statsModal");

const statsBars=document.getElementById("statsBars");

if(!statsModal||!statsBars){

alert("Statistics view is not available. The stats modal is missing from this page.");

return;

}

const rows=document.querySelectorAll(".questionnaire-table tbody tr");

const counts={};

let total=0;

rows.forEach(row=>{

if(row.style.display==="none")return;

const type=row.cells[1]?row.cells[1].innerText.trim():"Unknown";

counts[type]=(counts[type]||0)+1;

total++;

});

statsBars.innerHTML="";

if(total===0){

statsBars.innerHTML="<p>No responses to analyze.</p>";

}else{

Object.entries(counts)

.sort((a,b)=>b[1]-a[1])

.forEach(([type,count])=>{

const percent=Math.round((count/total)*100);

const row=document.createElement("div");

row.className="stats-row";

row.innerHTML=`

<div class="stats-row-label">

<span>${type}</span>

<span>${count} (${percent}%)</span>

</div>

<div class="stats-bar-track">

<div class="stats-bar-fill" style="width:${percent}%"></div>

</div>

`;

statsBars.appendChild(row);

});

}

statsModal.style.display="flex";

}


function showFilterMenu(){

const filterModal=document.getElementById("filterModal");

const filterOptions=document.getElementById("filterOptions");

if(!filterModal||!filterOptions){

alert("Filter view is not available. The filter modal is missing from this page.");

return;

}

const rows=document.querySelectorAll(".questionnaire-table tbody tr");

const types=[...new Set(

Array.from(rows).map(row=>row.cells[1]?row.cells[1].innerText.trim():"")

)].filter(Boolean);

filterOptions.innerHTML="";

if(types.length===0){

filterOptions.innerHTML="<p>No travel types available to filter by.</p>";

filterModal.style.display="flex";

return;

}

function setActiveChip(selected){

document.querySelectorAll(".filter-chip").forEach(chip=>{

chip.classList.remove("active");

});

selected.classList.add("active");

}

const allChip=document.createElement("span");

allChip.className="filter-chip active";

allChip.innerText="All";

allChip.addEventListener("click",()=>{

applyTravelTypeFilter(null);

setActiveChip(allChip);

});

filterOptions.appendChild(allChip);

types.forEach(type=>{

const chip=document.createElement("span");

chip.className="filter-chip";

chip.innerText=type;

chip.addEventListener("click",()=>{

applyTravelTypeFilter(type);

setActiveChip(chip);

});

filterOptions.appendChild(chip);

});

filterModal.style.display="flex";

}


function applyTravelTypeFilter(type){

const rows=document.querySelectorAll(".questionnaire-table tbody tr");

rows.forEach(row=>{

const rowType=row.cells[1]?row.cells[1].innerText.trim():"";

row.style.display=(!type||rowType===type)?"":"none";

});

}