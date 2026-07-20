/* ---------- PAGE NAVIGATION ----------- */
function showPage(pageId){

document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active");
});

document.getElementById(pageId).classList.add("active");

if(pageId==="list") renderList();
if(pageId==="report"){
    calcTotal();
    renderMonthlyReport();
    renderBoxBalance();
}
if(pageId==="settings") loadSettings();
if(pageId==="report"){
    calcTotal();
    renderMonthlyReport();
}

}

/* ---------- INIT ---------- */
window.onload = function(){

// تاریخ امروز
document.getElementById("date").value =
new Date().toISOString().split("T")[0];
$("#date").persianDatepicker({
    format: "YYYY/MM/DD",
    initialValue: true,
    initialValueType: "persian",
    autoClose: true
});

searchText.addEventListener("input", renderList);
searchType.addEventListener("change", renderList);


// load settings
initSettings();

// events
document.getElementById("saveBtn").onclick = saveExpense;

renderList();

};

/* ---------- STORAGE ---------- */
function getData(){
return JSON.parse(localStorage.getItem("expenses")||"[]");
}

function setData(data){
localStorage.setItem("expenses",JSON.stringify(data));
}

/* ---------- SAVE ---------- */
function saveExpense(){

let data = getData();

data.push({
type: type.value,
subject: subject.value,
amount: Number(amount.value.replace(/,/g, "")),
date: date.value,
project: project.value,
source: source.value
});

setData(data);

subject.value="";
amount.value="";

alert("ثبت شد");

renderList();
}

/* ---------- LIST ---------- */
function renderList(){

let data = getData();

data = data.map(x => ({
    type: x.type || "expense",
    ...x
}));

let keyword = document.getElementById("searchText").value.toLowerCase().trim();
let type = document.getElementById("searchType").value;

if(keyword !== ""){

    data = data.filter(x=>{


        if(type === "subject")
            return x.subject.toLowerCase().includes(keyword);

        if(type === "project")
            return x.project.toLowerCase().includes(keyword);

        if(type === "source")
            return x.source.toLowerCase().includes(keyword);

        // همه
        return (
            x.subject.toLowerCase().includes(keyword) ||
            x.project.toLowerCase().includes(keyword) ||
            x.source.toLowerCase().includes(keyword)
        );

    })

if(data.length === 0){
    document.getElementById("listBox").innerHTML = `
        <div style="text-align:center;padding:20px;color:#888">
            هیچ موردی یافت نشد 😕
        </div>
    `;
    return;
};

}

let html="";

data.forEach((x,i)=>{

let icon = x.type === "income" ? "🟢" : "🔴";
let title = x.type === "income" ? "درآمد" : "هزینه";

html += `
<div class="item ${x.type}">

    <div class="item-header">

        <div class="item-title">
            ${x.type=="expense" ? "💸 هزینه" : "💰 درآمد"} | ${x.subject}
        </div>

        <div class="actions">
            <button onclick="edit(${i})">✏️</button>
            <button onclick="del(${i})">🗑</button>
        </div>

    </div>

    <div class="item-amount">
        ${Number(x.amount).toLocaleString('fa-IR')} تومان
    </div>

    <div class="item-info">
        ${x.project} | ${x.source} | ${x.date}
    </div>

</div>
`;

});

document.getElementById("listBox").innerHTML=html;

}

/* ---------- DELETE ---------- */
function del(i){

let data = getData();
data.splice(i,1);
setData(data);

renderList();

}

/* ---------- EDIT ---------- */
function edit(i){

let data = getData();
let x = data[i];

subject.value=x.subject;
amount.value=x.amount;
date.value=x.date;
project.value=x.project;
source.value=x.source;

del(i);

}

/* ---------- TOTAL ---------- */
function calcTotal(){

    let data = getData();

    let income = 0;
    let expense = 0;

    data.forEach(x=>{

        if((x.type || "expense") === "income")
            income += Number(x.amount);

        else
            expense += Number(x.amount);

    });

    document.getElementById("incomeTotal").innerText =
        income.toLocaleString('fa-IR') + " تومان";

    document.getElementById("expenseTotal").innerText =
        expense.toLocaleString('fa-IR') + " تومان";

    document.getElementById("balanceTotal").innerText =
        (income-expense).toLocaleString('fa-IR') + " تومان";

}

/* ---------- EXPORT CSV ---------- */
function exportCSV(){

    let data = getData();

    let expenses = [
        ["موضوع","مبلغ","تاریخ","پروژه","محل تامین"]
    ];

    let incomes = [
        ["موضوع","مبلغ","تاریخ","پروژه","محل تامین"]
    ];

    data.forEach(x=>{

        let row = [
            x.subject,
            x.amount,
            x.date,
            x.project,
            x.source
        ];

        if((x.type || "expense") === "income")
            incomes.push(row);
        else
            expenses.push(row);

    });

    const wb = XLSX.utils.book_new();

    const wsExpense = XLSX.utils.aoa_to_sheet(expenses);
    const wsIncome = XLSX.utils.aoa_to_sheet(incomes);

    XLSX.utils.book_append_sheet(wb, wsExpense, "هزینه ها");
    XLSX.utils.book_append_sheet(wb, wsIncome, "درآمدها");

    XLSX.writeFile(wb, "Finance.xlsx");

}

/* ---------- SETTINGS ---------- */
function initSettings(){

if(!localStorage.getItem("projects")){
localStorage.setItem("projects",JSON.stringify(["خانواده","سایت","کار"]));
}

if(!localStorage.getItem("sources")){
localStorage.setItem("sources",JSON.stringify(["سامان","مهر","راضیه","نقد"]));
}

loadDropdowns();

}

/* ---------- LOAD DROPDOWNS ---------- */
function loadDropdowns(){

let projects = JSON.parse(localStorage.getItem("projects") || "[]");
let sources  = JSON.parse(localStorage.getItem("sources") || "[]");

const projectSelect = document.getElementById("project");
const sourceSelect  = document.getElementById("source");

if(!projectSelect || !sourceSelect) return;

projectSelect.innerHTML = "";
sourceSelect.innerHTML  = "";

projects.forEach(p=>{
projectSelect.innerHTML += `<option>${p}</option>`;
});

sources.forEach(s=>{
sourceSelect.innerHTML += `<option>${s}</option>`;
});

}

/* ---------- LOAD SETTINGS PAGE ---------- */
function loadSettings(){
renderProjects();
renderSources();
}

/* ---------- PROJECT ---------- */
function addProject(){

let val = newProject.value.trim();
if(val === "") return;

let arr = JSON.parse(localStorage.getItem("projects") || "[]");

// جلوگیری از تکراری
if(arr.includes(val)) return;

arr.push(val);

localStorage.setItem("projects",JSON.stringify(arr));

newProject.value = "";

loadDropdowns();
renderProjects();

}

function renderProjects(){

let arr = JSON.parse(localStorage.getItem("projects") || "[]");

let html = "";

arr.forEach((p,i)=>{
html += `
<div class="row">
    <span>${p}</span>
    <div class="actions">
        <button onclick="deleteProject(${i})">🗑</button>
    </div>
</div>
`;
});

document.getElementById("projectList").innerHTML = html;

}

function deleteProject(i){

let arr = JSON.parse(localStorage.getItem("projects") || "[]");

arr.splice(i,1);

localStorage.setItem("projects", JSON.stringify(arr));

loadDropdowns();
renderProjects();

}

/* ---------- SOURCE ---------- */
function addSource(){

let val = newSource.value.trim();
if(val === "") return;

let arr = JSON.parse(localStorage.getItem("sources") || "[]");

// جلوگیری از تکراری
if(arr.includes(val)) return;

arr.push(val);

localStorage.setItem("sources", JSON.stringify(arr));

newSource.value = "";

loadDropdowns();
renderSources();

}

function renderSources(){

let arr = JSON.parse(localStorage.getItem("sources") || "[]");

let html = "";

arr.forEach((s,i)=>{
html += `
<div class="row">
    <span>${s}</span>
    <div class="actions">
        <button onclick="deleteSource(${i})">🗑</button>
    </div>
</div>
`;
});

document.getElementById("sourceList").innerHTML = html;

}

function deleteSource(i){

let arr = JSON.parse(localStorage.getItem("sources") || "[]");

arr.splice(i,1);

localStorage.setItem("sources", JSON.stringify(arr));

loadDropdowns();
renderSources();

}


/* ---------- month ---------- */
function renderMonthlyReport(){

    let data = getData();

    let months = {};

    data.forEach(x=>{

        // فقط هزینه‌ها
        if(x.type !== "expense") return;

        let month = x.date.substring(0,7); // 1405/04

        if(!months[month])
            months[month]=0;

        months[month]+=Number(x.amount);

    });

    let html="";

    Object.keys(months).sort().forEach(m=>{

        html += `
        <div class="total-row">
            <span>${m}</span>
            <span>${months[m].toLocaleString('fa-IR')} تومان</span>
        </div>
        `;

    });

    document.getElementById("monthlyReport").innerHTML=html;

}

/* ---------- mablagh be mmomayez------- */
document.getElementById("amount").addEventListener("input", function () {

    let value = this.value.replace(/,/g, "").replace(/\D/g, "");

    if(value === ""){
        this.value = "";
        return;
    }

    this.value = Number(value).toLocaleString("en-US");
});

/* ---------- import/export------- */
function exportBackup(){

    let backup = {

        data: getData(),

        projects: JSON.parse(localStorage.getItem("projects")) || [],

        sources: JSON.parse(localStorage.getItem("sources")) || []

    };

    let blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        {type: "application/json"}
    );

    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
    a.click();

    URL.revokeObjectURL(url);

}

document.getElementById("importFile").addEventListener("change", function(e){

    let file = e.target.files[0];

    if(!file) return;

    let reader = new FileReader();

    reader.onload = function(event){

        try{

            let backup = JSON.parse(event.target.result);

            if(!backup.data){
                alert("فایل معتبر نیست");
                return;
            }

            setData(backup.data);

            if(backup.projects){
                localStorage.setItem("projects", JSON.stringify(backup.projects));
            }

            if(backup.sources){
                localStorage.setItem("sources", JSON.stringify(backup.sources));
            }

            alert("بازیابی انجام شد");

            location.reload();

        }catch(err){

            alert("خطا در فایل بکاپ");

        }

    };

    reader.readAsText(file);

});

/* ---------- صندوق ها ---------- */
function renderBoxBalance(){

    let data = getData();

    let boxes = {};

    data.forEach(x=>{

        if(!x.source) return;

        if(!boxes[x.source]){
            boxes[x.source]=0;
        }

        if(x.type === "income"){
            boxes[x.source] += Number(x.amount);
        }

        if(x.type === "expense"){
            boxes[x.source] -= Number(x.amount);
        }

    });


    let html="";


    Object.keys(boxes).forEach(box=>{

        html += `
        <div class="total-row">
            <span>${box}</span>
            <span>${boxes[box].toLocaleString('fa-IR')} تومان</span>
        </div>
        `;

    });


    document.getElementById("boxBalance").innerHTML = html;

}
