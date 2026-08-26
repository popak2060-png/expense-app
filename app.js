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
      renderCategoryReport();
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
renderCategories();

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

    let transactionType = type.value;

    let value =
        Number(amount.value.replace(/,/g, ""));


    /* ---------- TRANSFER ---------- */

    if(transactionType === "transfer"){

        let from = fromSource.value;
        let to = toSource.value;


        if(!value || value <= 0){

            alert("مبلغ را وارد کنید");
            return;

        }


        if(!from){

            alert("صندوق مبدأ را انتخاب کنید");
            return;

        }


        if(!to){

            alert("صندوق مقصد را انتخاب کنید");
            return;

        }


        if(from === to){

            alert(
                "صندوق مبدأ و مقصد نمی‌توانند یکسان باشند"
            );

            return;

        }


        let transferData = {

            type: "transfer",

            subject: "جابجایی بین صندوق‌ها",

            amount: value,

            date: date.value,

            project: "",

            source: "",

            fromSource: from,

            toSource: to

        };


        /* ---------- ویرایش ---------- */

        if(editingIndex !== null){

            data[editingIndex] = transferData;

        }

        /* ---------- ثبت جدید ---------- */

        else{

            data.push(transferData);

        }


        setData(data);

        editingIndex = null;


        amount.value = "";
        fromSource.value = "";
        toSource.value = "";


        alert("جابجایی با موفقیت ثبت شد");

        renderList();

        return;

    }


    /* ---------- EXPENSE / INCOME ---------- */

    let transactionData = {

        type: transactionType,

        subject: subject.value,

        amount: value,

        date: date.value,

        project: project.value,

        source: source.value

    };


    /* ---------- ویرایش ---------- */

    if(editingIndex !== null){

        data[editingIndex] = transactionData;

    }

    /* ---------- ثبت جدید ---------- */

    else{

        data.push(transactionData);

    }


    setData(data);

    editingIndex = null;


    subject.value = "";
    amount.value = "";


    alert("ثبت شد");

    renderList();
    renderCategoryReport();

}


/*--------فیلتر لیست---*/
let currentListFilter = "all";
function filterList(type){

    currentListFilter = type;

    renderList();

}
/* ---------- LIST ---------- */
function renderList(){

let data = getData().map((x, index) => ({
    ...x,
    originalIndex: index
}));

/* ---------- SORT BY DATE ---------- */

function dateToNumber(date){

    if(!date) return 0;

    let d = date
        .replace(/[۰-۹]/g, function(c){
            return "۰۱۲۳۴۵۶۷۸۹".indexOf(c);
        })
        .replace(/\//g, "");

    return Number(d);
}

data.sort((a, b) => {
    return dateToNumber(b.date) - dateToNumber(a.date);
});
	
  /* ---------- FILTER ---------- */

	
	if(currentListFilter !== "all"){

    data = data.filter(x =>
        (x.type || "expense") === currentListFilter
    );

}

    data = data.map(x => ({
        type: x.type || "expense",
        subject: x.subject || "",
        project: x.project || "",
        source: x.source || "",
        fromSource: x.fromSource || "",
        toSource: x.toSource || "",
        ...x
    }));


    let keyword =
        document.getElementById("searchText")
        .value
        .toLowerCase()
        .trim();

    let type =
        document.getElementById("searchType").value;



    /* ---------- SEARCH ---------- */

    if(keyword !== ""){

        data = data.filter(x => {

            if(type === "subject")
                return x.subject
                    .toLowerCase()
                    .includes(keyword);


            if(type === "project")
                return x.project
                    .toLowerCase()
                    .includes(keyword);


            if(type === "source")
                return (
                    x.source
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    x.fromSource
                        .toLowerCase()
                        .includes(keyword)

                    ||

                    x.toSource
                        .toLowerCase()
                        .includes(keyword)
                );


            // همه
            return (
                x.subject.toLowerCase().includes(keyword) ||
                x.project.toLowerCase().includes(keyword) ||
                x.source.toLowerCase().includes(keyword) ||
                x.fromSource.toLowerCase().includes(keyword) ||
                x.toSource.toLowerCase().includes(keyword)
            );

        });


        if(data.length === 0){

            document.getElementById("listBox").innerHTML = `
                <div style="text-align:center;padding:20px;color:#888">
                    هیچ موردی یافت نشد 😕
                </div>
            `;

            return;

        }

    }


    /* ---------- CARDS ---------- */

    let html = "";


    data.forEach((x,i) => {


        /* ---------- TRANSFER ---------- */

        if(x.type === "transfer"){

            html += `
            <div class="item transfer-item">

                <div class="item-header">

                    <div class="item-title">
                        🔄 جابجایی صندوق
                    </div>

                    <div class="actions">
                       <button onclick="edit(${x.originalIndex})">✏️</button>
                       <button onclick="del(${x.originalIndex})">🗑</button>
                    </div>

                </div>

                <div class="item-amount">
                    ${Number(x.amount).toLocaleString('fa-IR')} تومان
                </div>

                <div class="item-info">
                    ${x.fromSource} ← ${x.toSource} | ${x.date}
                </div>

            </div>
            `;

        }


        /* ---------- EXPENSE / INCOME ---------- */

        else{

            let cardClass =
                x.type === "income"
                ? "income-item"
                : "expense-item";


            html += `
            <div class="item ${cardClass}">

                <div class="item-header">

                    <div class="item-title">
                        ${
                            x.type === "expense"
                            ? "💸 هزینه"
                            : "💰 درآمد"
                        }
                        | ${x.subject}
                    </div>

                    <div class="actions">
                       <button onclick="edit(${x.originalIndex})">✏️</button>
                       <button onclick="del(${x.originalIndex})">🗑</button>
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

        }

    });


    document.getElementById("listBox").innerHTML = html;

}




/* ---------- DELETE ---------- */
function del(i){

let data = getData();
data.splice(i,1);
setData(data);

renderList();

}

/* ---------- EDIT ---------- */
let editingIndex = null;
function edit(i){

    let data = getData();
    let x = data[i];

    if(!x) return;

    // ذخیره اندیس رکورد در حال ویرایش
    editingIndex = i;


    // انتخاب نوع تراکنش
    type.value = x.type || "expense";

    changeTransactionType();


    // تاریخ
    date.value = x.date || "";

    // مبلغ
    amount.value = x.amount || "";


    /* ---------- هزینه / درآمد ---------- */

    if(x.type !== "transfer"){

        subject.value = x.subject || "";

        project.value = x.project || "";

        source.value = x.source || "";

    }


    /* ---------- جابجایی ---------- */

    else{

        fromSource.value = x.fromSource || "";

        toSource.value = x.toSource || "";

    }


    // رفتن به صفحه ثبت
    showPage("home");

}
/* ---------- TOTAL ---------- */
function calcTotal(){

    let data = getData();

    let income = 0;
    let expense = 0;

    data.forEach(x=>{

        if(x.type === "income"){

            income += Number(x.amount);

        }

        if(x.type === "expense"){

            expense += Number(x.amount);

        }

        // transfer عمداً در درآمد و هزینه محاسبه نمی‌شود

    });


    document.getElementById("incomeTotal").innerText =
        income.toLocaleString('fa-IR') + " تومان";


    document.getElementById("expenseTotal").innerText =
        expense.toLocaleString('fa-IR') + " تومان";


    document.getElementById("balanceTotal").innerText =
        (income - expense).toLocaleString('fa-IR') + " تومان";

}
/* ---------- خروجی اکسل ---------- */
function exportCSV(){

    let data = getData();


    /* ---------- SORT BY DATE ---------- */

    function dateToNumber(date){

        if(!date) return 0;

        let d = date
            .replace(/[۰-۹]/g, function(c){
                return "۰۱۲۳۴۵۶۷۸۹".indexOf(c);
            })
            .replace(/\//g, "");

        return Number(d);
    }

    data.sort((a, b) => {
        return dateToNumber(a.date) - dateToNumber(b.date);
    });


    let expenses = [
        ["موضوع","مبلغ","تاریخ","پروژه","محل تامین"]
    ];

    let incomes = [
        ["موضوع","مبلغ","تاریخ","پروژه","محل تامین"]
    ];

    let transfers = [
        ["مبلغ","تاریخ","صندوق مبدا","صندوق مقصد"]
    ];


    data.forEach(x=>{

        /* ---------- جابجایی ---------- */

        if(x.type === "transfer"){

            transfers.push([
                x.amount,
                x.date,
                x.fromSource,
                x.toSource
            ]);

            return;
        }


        /* ---------- درآمد / هزینه ---------- */

        let row = [
            x.subject,
            x.amount,
            x.date,
            x.project,
            x.source
        ];


        if((x.type || "expense") === "income"){

            incomes.push(row);

        }else{

            expenses.push(row);

        }

    });


    const wb = XLSX.utils.book_new();


    const wsExpense =
        XLSX.utils.aoa_to_sheet(expenses);

    const wsIncome =
        XLSX.utils.aoa_to_sheet(incomes);

    const wsTransfer =
        XLSX.utils.aoa_to_sheet(transfers);


    XLSX.utils.book_append_sheet(
        wb,
        wsExpense,
        "هزینه ها"
    );

    XLSX.utils.book_append_sheet(
        wb,
        wsIncome,
        "درآمدها"
    );

    XLSX.utils.book_append_sheet(
        wb,
        wsTransfer,
        "جابجایی"
    );


    XLSX.writeFile(
        wb,
        "Finance.xlsx"
    );

}

/* ---------- SETTINGS ---------- */
function initSettings(){

if(!localStorage.getItem("projects")){
localStorage.setItem("projects",JSON.stringify(["پیش فرض"]));
}

if(!localStorage.getItem("sources")){
localStorage.setItem("sources",JSON.stringify(["پیش فرض"]));
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

    let arr = JSON.parse(
        localStorage.getItem("sources") || "[]"
    );

    let html = "";

    arr.forEach((s, i) => {

        html += `
        <div class="row" id="sourceRow-${i}">

            <span id="sourceText-${i}">
                ${s}
            </span>

            <div class="actions">

                <button onclick="editSource(${i})">
                    ✏️
                </button>

                <button onclick="deleteSource(${i})">
                    🗑
                </button>

            </div>

        </div>
        `;

    });

    document.getElementById("sourceList").innerHTML = html;
}

function editSource(i){

    let arr = JSON.parse(
        localStorage.getItem("sources") || "[]"
    );

    let oldName = arr[i];

    let row = document.getElementById(
        "sourceRow-" + i
    );

    row.innerHTML = `

        <input
            type="text"
            id="editSourceInput-${i}"
            value="${oldName}"
        >

        <div class="actions">

            <button onclick="saveSourceEdit(${i})">
                ✔️
            </button>

            <button onclick="renderSources()">
                ❌
            </button>

        </div>

    `;

    document
        .getElementById(`editSourceInput-${i}`)
        .focus();
}

function saveSourceEdit(i){

    let arr = JSON.parse(
        localStorage.getItem("sources") || "[]"
    );

    let oldName = arr[i];

    let input = document.getElementById(
        `editSourceInput-${i}`
    );

    let newName = input.value.trim();

    if(newName === ""){

        alert("نام صندوق نمی‌تواند خالی باشد");
        return;

    }

    // جلوگیری از نام تکراری
    if(
        arr.some((x, index) =>
            index !== i && x === newName
        )
    ){

        alert("این نام صندوق قبلاً وجود دارد");
        return;

    }


    /* ---------- تغییر نام صندوق ---------- */

    arr[i] = newName;

    localStorage.setItem(
        "sources",
        JSON.stringify(arr)
    );


    /* ---------- اصلاح تمام تراکنش‌ها ---------- */

    let data = getData();

    data.forEach(x => {

        // درآمد / هزینه
        if(x.source === oldName){

            x.source = newName;

        }

        // جابجایی - صندوق مبدأ
        if(x.fromSource === oldName){

            x.fromSource = newName;

        }

        // جابجایی - صندوق مقصد
        if(x.toSource === oldName){

            x.toSource = newName;

        }

    });


    setData(data);


    /* ---------- بروزرسانی ---------- */

    loadDropdowns();
    renderSources();
    renderList();
    renderBoxBalance();
	

}


function deleteSource(i){

let arr = JSON.parse(localStorage.getItem("sources") || "[]");

arr.splice(i,1);

localStorage.setItem("sources", JSON.stringify(arr));

loadDropdowns();
renderSources();

}
/* ---------- CATEGORIES ---------- */

function getCategories(){

    return JSON.parse(
        localStorage.getItem("categories") || "[]"
    );

}


function saveCategories(data){

    localStorage.setItem(
        "categories",
        JSON.stringify(data)
    );

}


/* ---------- ADD CATEGORY ---------- */

function addCategory(){

    let input = document.getElementById("newCategory");

    let name = input.value.trim();

    if(name === "") return;

    let categories = getCategories();

    // جلوگیری از دسته تکراری
    if(
        categories.some(
            x => x.name === name
        )
    ){

        alert("این دسته قبلاً وجود دارد");
        return;

    }

    categories.push({

        name: name,

        keywords: []

    });

    saveCategories(categories);

    input.value = "";

    renderCategories();
      renderCategoryReport();

}


/* ---------- RENDER CATEGORIES ---------- */

function renderCategories(){

    let categories = getCategories();

    let html = "";

    categories.forEach((category, index) => {

        html += `

        <div class="category-box">

            <div class="category-header">

                <div class="category-name-area">

                    <span id="categoryName-${index}">
                        ${category.name}
                    </span>

                    <button
                        onclick="editCategoryName(${index})"
                        class="edit-category-btn"
                    >
                        ✏️
                    </button>

                </div>

                <button
                    onclick="deleteCategory(${index})"
                >
                    🗑
                </button>

            </div>

            <div class="keyword-area">

                <div
                    class="keyword-tags"
                    id="keywordTags-${index}"
                >
                    ${renderKeywords(
                        category.keywords,
                        index
                    )}
                </div>

                <input
                    type="text"
                    class="keyword-input"
                    placeholder="کلمه کلیدی را وارد کنید و Enter بزنید"
					enterkeyhint="enter"
                    onkeydown="addKeyword(event, ${index})"
                >

            </div>

        </div>

        `;

    });

    document.getElementById("categoryList").innerHTML = html;

}
/* ---------- EDIT CATEGORY NAME ---------- */

function editCategoryName(index){

    let categories = getCategories();

    let category = categories[index];

    let container =
        document.getElementById(`categoryName-${index}`);

    container.innerHTML = `

        <input
            type="text"
            id="editCategoryInput-${index}"
            value="${category.name}"
            class="edit-category-input"
        >

        <button
            onclick="saveCategoryName(${index})"
            class="confirm-category-btn"
        >
            ✓
        </button>

    `;

    document
        .getElementById(`editCategoryInput-${index}`)
        .focus();

}


/* ---------- SAVE CATEGORY NAME ---------- */

function saveCategoryName(index){

    let categories = getCategories();

    let input =
        document.getElementById(
            `editCategoryInput-${index}`
        );

    let newName = input.value.trim();

    if(newName === ""){

        alert("نام دسته را وارد کنید");
        return;

    }

    // جلوگیری از نام تکراری
    let duplicate = categories.some(
        (category, i) =>
            i !== index &&
            category.name === newName
    );

    if(duplicate){

        alert("این نام دسته قبلاً وجود دارد");
        return;

    }

    categories[index].name = newName;

    saveCategories(categories);

    renderCategories();
      renderCategoryReport();

}

/* ---------- KEYWORDS ---------- */

function renderKeywords(keywords, categoryIndex){

    return keywords.map(
        (keyword, keywordIndex) => {

            return `

            <span class="keyword-tag">

                ${keyword}

                <button
                    onclick="deleteKeyword(
                        ${categoryIndex},
                        ${keywordIndex}
                    )"
                >
                    ×
                </button>

            </span>

            `;

        }
    ).join("");

}


/* ---------- ADD KEYWORD ---------- */

function addKeyword(event, categoryIndex){

    if(event.key !== "Enter") return;

    event.preventDefault();

    let input = event.target;

    let keyword = input.value.trim();

    if(keyword === "") return;

    let categories = getCategories();

    let keywords =
        categories[categoryIndex].keywords;


    // جلوگیری از کلمه تکراری
    if(keywords.includes(keyword)){

        input.value = "";

        return;

    }


    keywords.push(keyword);

    saveCategories(categories);

    input.value = "";

    renderCategories();

}


/* ---------- DELETE KEYWORD ---------- */

function deleteKeyword(
    categoryIndex,
    keywordIndex
){

    let categories = getCategories();

    categories[categoryIndex]
        .keywords
        .splice(keywordIndex, 1);

    saveCategories(categories);

    renderCategories();

}


/* ---------- DELETE CATEGORY ---------- */

function deleteCategory(index){

    let categories = getCategories();

    if(
        !confirm(
            "این دسته و کلمات کلیدی آن حذف شود؟"
        )
    ){

        return;

    }

    categories.splice(index, 1);

    saveCategories(categories);

    renderCategories();

}

/* ---------- CATEGORY MATCHING ---------- */

function findCategoryBySubject(subject){

    if(!subject) return null;

    let categories = getCategories();

    let text = subject
        .toLowerCase()
        .trim();


    for(let category of categories){

        for(let keyword of category.keywords){

            keyword = keyword
                .toLowerCase()
                .trim();

            if(keyword === "") continue;


            if(text.includes(keyword)){

                return category.name;

            }

        }

    }


    return null;

}
/* ---------- CATEGORY REPORT ---------- */

function renderCategoryReport(){

    let data = getData();

    let categories = getCategories();

    let totals = {};

    // ایجاد دسته‌ها
    categories.forEach(category => {

        totals[category.name] = 0;

    });

    // دسته بدون تطابق
    totals["سایر"] = 0;


    data.forEach(x => {

        // فقط هزینه
        if((x.type || "expense") !== "expense"){
            return;
        }

        let amount = Number(x.amount) || 0;

        let category =
            findCategoryBySubject(x.subject);


        if(category && totals.hasOwnProperty(category)){

            totals[category] += amount;

        }else{

            totals["سایر"] += amount;

        }

    });


    let html = "";


    Object.keys(totals).forEach(category => {

        // دسته‌هایی که مبلغ ندارند نمایش داده نشوند
        if(totals[category] === 0){
            return;
        }


        html += `

        <div class="total-row category-report-row">

            <span>
                📂 ${category}
            </span>

            <span>
                ${totals[category].toLocaleString('fa-IR')}
                تومان
            </span>

        </div>

        `;

    });


    if(html === ""){

        html = `
            <div style="
                text-align:center;
                padding:15px;
                color:#888;
            ">
                هنوز هزینه‌ای ثبت نشده است
            </div>
        `;

    }


    document.getElementById(
        "categoryReport"
    ).innerHTML = html;

}

/* ---------- کد جایجایی صندوق در فرم ثبت---------- */

function changeTransactionType(){

    const type =
        document.getElementById("type").value;

    const transferFields =
        document.getElementById("transferFields");


    if(type === "transfer"){

        transferFields.style.display = "block";

        loadTransferSources();

    }else{

        transferFields.style.display = "none";

    }

}


function loadTransferSources(){

    const fromSource =
        document.getElementById("fromSource");

    const toSource =
        document.getElementById("toSource");


    const sources =
        JSON.parse(
            localStorage.getItem("sources") || "[]"
        );


    fromSource.innerHTML =
        '<option value="">انتخاب صندوق</option>';

    toSource.innerHTML =
        '<option value="">انتخاب صندوق</option>';


    sources.forEach(source => {

        fromSource.innerHTML += `
            <option value="${source}">
                ${source}
            </option>
        `;


        toSource.innerHTML += `
            <option value="${source}">
                ${source}
            </option>
        `;

    });

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

/* ---------- EXPORT BACKUP ---------- */

function exportBackup(){

    let backup = {

        // تراکنش‌ها
        data: getData(),

        // پروژه‌ها
        projects: JSON.parse(
            localStorage.getItem("projects") || "[]"
        ),

        // صندوق‌ها
        sources: JSON.parse(
            localStorage.getItem("sources") || "[]"
        ),

        // دسته‌بندی‌ها + کلمات کلیدی
        categories: JSON.parse(
            localStorage.getItem("categories") || "[]"
        )

    };


    let blob = new Blob(
        [
            JSON.stringify(
                backup,
                null,
                2
            )
        ],
        {
            type: "application/json"
        }
    );


    let url =
        URL.createObjectURL(blob);


    let a =
        document.createElement("a");


    a.href = url;

    a.download =
        "Finance_Backup.json";


    a.click();


    URL.revokeObjectURL(url);

}


/* ---------- IMPORT BACKUP ---------- */

document
    .getElementById("importFile")
    .addEventListener("change", function(e){

        let file = e.target.files[0];

        if(!file) return;


        let reader =
            new FileReader();


        reader.onload =
            function(event){

                try{

                    let backup =
                        JSON.parse(
                            event.target.result
                        );


                    /* ---------- بررسی فایل ---------- */

                    if(!backup.data){

                        alert(
                            "فایل بکاپ معتبر نیست"
                        );

                        return;
                    }


                    /* ---------- تراکنش‌ها ---------- */

                    setData(
                        backup.data
                    );


                    /* ---------- پروژه‌ها ---------- */

                    if(
                        Array.isArray(
                            backup.projects
                        )
                    ){

                        localStorage.setItem(
                            "projects",
                            JSON.stringify(
                                backup.projects
                            )
                        );

                    }


                    /* ---------- صندوق‌ها ---------- */

                    if(
                        Array.isArray(
                            backup.sources
                        )
                    ){

                        localStorage.setItem(
                            "sources",
                            JSON.stringify(
                                backup.sources
                            )
                        );

                    }


                    /* ---------- دسته‌بندی‌ها ---------- */

                    if(
                        Array.isArray(
                            backup.categories
                        )
                    ){

                        localStorage.setItem(
                            "categories",
                            JSON.stringify(
                                backup.categories
                            )
                        );

                    }


                    alert(
                        "بازیابی با موفقیت انجام شد"
                    );


                    /* ---------- بروزرسانی صفحه ---------- */

                    loadDropdowns();

                    renderCategories();

                    renderList();

                    renderCategoryReport();

                    renderBoxBalance();


                    /* ---------- پاک کردن انتخاب فایل ---------- */

                    e.target.value = "";


                }catch(err){

                    console.error(
                        "Import Error:",
                        err
                    );

                    alert(
                        "خطا در خواندن فایل بکاپ"
                    );

                }

            };


        reader.readAsText(file);

});



/* ---------- محاسبات صندوق ها ---------- */
function renderBoxBalance(){

    let data = getData();

    let boxes = {};

    data.forEach(x => {

        /* ---------- درآمد ---------- */

        if(x.type === "income"){

            if(!x.source) return;

            if(!boxes[x.source]){
                boxes[x.source] = 0;
            }

            boxes[x.source] += Number(x.amount);
        }


        /* ---------- هزینه ---------- */

        if(x.type === "expense"){

            if(!x.source) return;

            if(!boxes[x.source]){
                boxes[x.source] = 0;
            }

            boxes[x.source] -= Number(x.amount);
        }


        /* ---------- جابجایی ---------- */

        if(x.type === "transfer"){

            let from = x.fromSource;
            let to = x.toSource;
            let amount = Number(x.amount);


            // صندوق مبدأ
            if(from){

                if(!boxes[from]){
                    boxes[from] = 0;
                }

                boxes[from] -= amount;
            }


            // صندوق مقصد
            if(to){

                if(!boxes[to]){
                    boxes[to] = 0;
                }

                boxes[to] += amount;
            }

        }

    });


    let html = "";


    Object.keys(boxes).forEach(box => {

        html += `
        <div class="total-row">
            <span>${box}</span>
            <span>
                ${boxes[box].toLocaleString('fa-IR')} تومان
            </span>
        </div>
        `;

    });


    document.getElementById("boxBalance").innerHTML = html;

}


/* ---------- app version ---------- */
async function updateApp(){

    const message =
        document.getElementById("updateMessage");

    message.innerText =
        "در حال بروزرسانی برنامه...";

    try{

        // پاک کردن تمام Cache ها
        const cacheNames =
            await caches.keys();

        await Promise.all(
            cacheNames.map(
                cacheName =>
                    caches.delete(cacheName)
            )
        );


        // درخواست بروزرسانی Service Worker
        if("serviceWorker" in navigator){

            const registration =
                await navigator.serviceWorker
                .getRegistration();

            if(registration){

                await registration.update();

            }

        }


        message.innerText =
            "✅ بروزرسانی انجام شد";


        // بارگذاری مجدد برنامه
        setTimeout(() => {

            window.location.href =
                window.location.pathname +
                "?update=" +
                Date.now();

        }, 500);


    }catch(error){

        console.error(
            "Update Error:",
            error
        );

        message.innerText =
            "❌ خطا در بروزرسانی برنامه";

    }

}
/* ---------- installed version ---------- */

function getInstalledVersion(){

    return localStorage.getItem(
        "installedAppVersion"
    );

}


function setInstalledVersion(version){

    localStorage.setItem(
        "installedAppVersion",
        version
    );

}

/* ---------- check for update ---------- */


/* ---------- update app ---------- */
async function updateApp(latestVersion){

    const message =
        document.getElementById("updateMessage");

    message.innerText =
        "در حال بروزرسانی برنامه...";

    try{

        // پاک کردن Cache های قبلی
        const cacheNames =
            await caches.keys();

        await Promise.all(

            cacheNames.map(
                cacheName =>
                caches.delete(cacheName)
            )

        );


        // بروزرسانی Service Worker
        if("serviceWorker" in navigator){

            const registration =
                await navigator.serviceWorker
                .getRegistration();

            if(registration){

                await registration.update();

            }

        }


        // ثبت نسخه جدید
        if(latestVersion){

            setInstalledVersion(
                latestVersion
            );

        }


        message.innerText =
            "✅ بروزرسانی انجام شد";


        // Reload با جلوگیری از Cache
        setTimeout(() => {

            window.location.href =
                window.location.pathname +
                "?update=" +
                Date.now();

        }, 500);


    }catch(error){

        console.error(
            "Update Error:",
            error
        );

        message.innerText =
            "خطا در بروزرسانی برنامه";

    }

}
/* ---------- load app version ---------- */

async function loadAppVersion(){

    const versionElement =
        document.getElementById("appVersion");

    try{

        const response = await fetch(
            "version.json?time=" + Date.now()
        );

        const data = await response.json();

        const latestVersion = data.version;

        // نسخه نصب‌شده فعلی
        let installedVersion =
            getInstalledVersion();

        // اگر اولین اجرای برنامه است
        if(!installedVersion){

            setInstalledVersion(
                latestVersion
            );

            installedVersion =
                latestVersion;

        }

        // نمایش نسخه نصب‌شده
        if(versionElement){

            versionElement.innerText =
                installedVersion;

        }

    }catch(error){

        console.error(
            "Version Load Error:",
            error
        );

    }

}
/* ---------- auto update check ---------- */

async function autoCheckForUpdate(){

    try{

        const response = await fetch(
            "version.json?time=" + Date.now()
        );

        if(!response.ok) return;

        const data = await response.json();

        const latestVersion = data.version;

        const installedVersion =
            getInstalledVersion();


        // اگر نسخه جدید وجود دارد
        if(
            installedVersion &&
            installedVersion !== latestVersion
        ){

            alert(
                "🆕 نسخه جدید برنامه موجود است\n\n" +
                "نسخه جدید: " +
                latestVersion +
                "\n\n" +
                "برای بروزرسانی به بخش تنظیمات بروید."
            );

        }

    }catch(error){

        console.error(
            "Auto Update Check Error:",
            error
        );

    }

}

/* ---------- فرم جابجایی صندوق و مخفی سازی هزینه/درامد ---------- */
function changeTransactionType(){

    const type =
        document.getElementById("type").value;

    const normalFields =
        document.getElementById(
            "normalTransactionFields"
        );

    const transferFields =
        document.getElementById(
            "transferFields"
        );


    if(type === "transfer"){

        // مخفی کردن فرم درآمد و هزینه
        normalFields.style.display =
            "none";

        // نمایش فرم جابجایی
        transferFields.style.display =
            "block";

        loadTransferSources();

    }else{

        // نمایش فرم درآمد و هزینه
        normalFields.style.display =
            "block";

        // مخفی کردن فرم جابجایی
        transferFields.style.display =
            "none";

    }

}



autoCheckForUpdate();
loadAppVersion();

