const URL =
"https://raw.githubusercontent.com/Smapifan/Random-Stories/stories/storys.json?t=" + Date.now();

let STORIES = [];
let LANG = "en";

const container = document.getElementById("container");
const view = document.getElementById("view");
const content = document.getElementById("content");
const langSelect = document.getElementById("lang");

// -------------------- INIT
(async function(){
  await load();
  buildLangMenu();
  render(STORIES);
  setupSearch();
})();

// -------------------- LOAD
async function load(){
  const res = await fetch(URL, {cache:"no-store"});
  STORIES = await res.json();
}

// -------------------- LANG MENU (dynamic!)
function buildLangMenu(){
  const set = new Set();

  STORIES.forEach(s=>{
    (s.language||[]).forEach(l=>{
      set.add(l.locale);
    });
  });

  langSelect.innerHTML = "";

  [...set].forEach(l=>{
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    langSelect.appendChild(opt);
  });

  LANG = langSelect.value || "en";

  langSelect.onchange = ()=>{
    LANG = langSelect.value;
    render(STORIES);
  };
}

// -------------------- RENDER
function render(list){
  container.innerHTML = "";

  list.forEach(s=>{
    const l = getLang(s);

    const div = document.createElement("div");
    div.className="card";

    div.innerHTML = `
      <div class="title">${cut(l.title,25)}</div>
      <div class="meta">${s.author||""}</div>
      <div class="desc">${cut(strip(l.content),50)}...</div>
    `;

    div.onclick=()=>open(s.id);
    container.appendChild(div);
  });
}

// -------------------- OPEN
function open(id){
  const s = STORIES.find(x=>x.id==id);
  if(!s) return;

  const l = getLang(s);

  container.style.display="none";
  view.style.display="block";

  content.innerHTML=`
    <h2>${l.title}</h2>
    <p>${s.author||""}</p>
    <hr>
    <p>${l.content.replace(/\n/g,"<br>")}</p>
  `;
}

// -------------------- BACK
function back(){
  view.style.display="none";
  container.style.display="grid";
}

// -------------------- LANG PICK
function getLang(story){
  const found =
    (story.language||[]).find(x=>x.locale===LANG) ||
    (story.language||[]).find(x=>x.locale==="en") ||
    (story.language||[])[0];

  return found || {title:"",content:""};
}

// -------------------- SEARCH
function setupSearch(){
  document.getElementById("search").oninput=(e)=>{
    const q=e.target.value.toLowerCase();

    render(STORIES.filter(s=>{
      const l=getLang(s);
      return l.title.toLowerCase().includes(q) ||
             l.content.toLowerCase().includes(q);
    }));
  };
}

// -------------------- SCALE
function setScale(v){
  document.documentElement.style.setProperty("--scale",v);
}

// -------------------- THEME
function toggleTheme(){
  document.body.classList.toggle("light");
}

// -------------------- UTIL
function cut(s,n){return s?s.slice(0,n):"";}
function strip(s){return s.replace(/<[^>]*>/g,"");}
