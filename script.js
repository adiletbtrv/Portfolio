//dynamic theme acc
const hour = new Date().getHours();
if(hour >= 6 && hour < 12){ 
  document.documentElement.style.setProperty('--acc1', '#06b6d4'); 
}
else if(hour >= 12 && hour < 18){ 
  document.documentElement.style.setProperty('--acc1', '#8b5cf6'); 
}
else{ 
  document.documentElement.style.setProperty('--acc1', '#f59e0b'); 
}

//cursor
const orb = document.querySelector('.cursor-orb');
window.addEventListener('pointermove', (e)=>{
  orb.style.transform = `translate(${e.clientX-9}px, ${e.clientY-9}px)`;
  document.body.style.setProperty('--mx', (e.clientX/window.innerWidth*100)+'%');
  document.body.style.setProperty('--my', (e.clientY/window.innerHeight*100)+'%');
  document.querySelector('.logo').style.setProperty('--rot', (e.clientX + e.clientY)/8 + 'deg');
}, {
  passive:true
});

//scroll progress ring
const pbar = document.getElementById('pbar');
const CIRC = 2 * Math.PI * 24;
const updateProgress = ()=>{
  const max = document.body.scrollHeight - innerHeight;
  const val = Math.max(0, Math.min(1, scrollY / max));
  pbar.style.strokeDasharray = CIRC.toFixed(0);
  pbar.style.strokeDashoffset = (CIRC - CIRC * val).toFixed(1);
};
addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

//Video loader
const vcontainers = document.querySelectorAll('.video-container');
const loadVideo = (el)=>{
  if(el.dataset.loaded) return;
  const src = el.dataset.video || '';
  el.innerHTML = `<video playsinline muted loop preload="none" style="width:100%; height:100%; display:block;">
    ${src ? `<source src="${src}" type="video/webm" />` : ''}
  </video>`;
  const v = el.querySelector('video');
  v && v.play && v.play().catch(()=>{});
  el.dataset.loaded = '1';
};
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{ 
    if(en.isIntersecting) { 
      loadVideo(en.target); 
      io.unobserve(en.target); 
    } 
  });
}, { 
  threshold: .5 
});
vcontainers.forEach(v=> io.observe(v));

//Keyboard nav
const cards = [...document.querySelectorAll('.card')];
let idx = 0;
const focusCard = (i)=>{ 
  idx = (i+cards.length)%cards.length; 
  cards[idx].focus({preventScroll:true}); 
  cards[idx].scrollIntoView({behavior:'smooth', block:'center'}); 
};
addEventListener('keydown', (e)=>{
  if(e.target.tagName==='INPUT' || e.target.tagName==='TEXTAREA') return;
  if(e.key.toLowerCase()==='j'){ 
    focusCard(idx+1); 
  }
  if(e.key.toLowerCase()==='k'){ 
    focusCard(idx-1); 
  }
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k'){ 
    e.preventDefault(); 
    toggleCmd(true); 
  }
  if(e.key==='/'){ 
    e.preventDefault(); 
    toggleCmd(true); 
  }
  if(e.key==='Escape'){ 
    toggleCmd(false); 
  }
});

//Draggable capsules
const area = document.getElementById('dragArea');
const caps = [...area.querySelectorAll('.capsule')];
const clamp = (n,min,max)=> Math.min(max, Math.max(min,n));
caps.forEach((c,i)=>{
  c.style.left = c.style.getPropertyValue('--x') || (20 + i*15)+'%';
  c.style.top  = c.style.getPropertyValue('--y') || (30 + i*10)+'%';
  let offX=0, offY=0, drag=false;
  c.addEventListener('pointerdown', (e)=>{ 
    drag=true; 
    c.setPointerCapture(e.pointerId); 
    const r=c.getBoundingClientRect(); 
    offX=e.clientX-r.left; 
    offY=e.clientY-r.top; 
  });
  c.addEventListener('pointermove', (e)=>{
    if(!drag) return; 
    const r=area.getBoundingClientRect();
    const x = clamp(e.clientX - r.left - offX, 6, r.width - c.offsetWidth - 6);
    const y = clamp(e.clientY - r.top - offY, 6, r.height - c.offsetHeight - 6);
    c.style.left = x+'px'; 
    c.style.top = y+'px';
  });
  addEventListener('pointerup', ()=> drag=false);
});

//contact form and json
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = JSON.stringify({ submittedAt: new Date().toISOString(), ...data }, null, 2);
  try{ 
    await navigator.clipboard.writeText(payload); 
    status.textContent = 'Скопировано в json'; 
    status.style.borderColor = 'var(--ok)'; 
  }
  catch{ 
    status.textContent = 'Готово (скопировать не удалось)'; 
    status.style.borderColor = 'var(--bad)'; 
  }
  form.reset();
  setTimeout(()=> status.textContent='', 3000);
});

//Command palette
const cmd = document.getElementById('cmdk');
const cmdInput = document.getElementById('cmdInput');
const cmdList = document.getElementById('cmdList');
const commands = [
  {label:'Go: Projects', action:()=> location.hash='#work'},
  {label:'Go: Skills', action:()=> location.hash='#services'},
  {label:'Go: About', action:()=> location.hash='#about'},
  {label:'Go: Contact', action:()=> location.hash='#contact'},
  {label:'Theme: violet', action:()=> document.documentElement.style.setProperty('--acc1', '#8b5cf6')},
  {label:'Theme: cyan', action:()=> document.documentElement.style.setProperty('--acc1', '#06b6d4')},
  {label:'Theme: amber', action:()=> document.documentElement.style.setProperty('--acc1', '#f59e0b')},
];
function renderCmd(list){
  cmdList.innerHTML = list.map((c,i)=>`<div class='item' role='option' data-i='${i}'>${c.label}</div>`).join('');
  [...cmdList.children].forEach(el=> el.addEventListener('click', ()=>{ 
    const i=+el.dataset.i; 
    commands[i].action(); 
    toggleCmd(false); 
  }));
}
function toggleCmd(show){ cmd.classList.toggle('active', show); 
  if(show){ 
    renderCmd(commands); 
    cmdInput.value=''; 
    cmdInput.focus(); 
  } 
}
document.getElementById('cmdBtn').addEventListener('click', ()=> toggleCmd(true));
cmd.addEventListener('click', (e)=>{ 
  if(e.target===cmd) toggleCmd(false); 
});
cmdInput.addEventListener('input', ()=>{
  const q = cmdInput.value.trim().toLowerCase();
  const list = commands.filter(c=> c.label.toLowerCase().includes(q));
  renderCmd(list);
});

//Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Theme button 
const themeCycle = document.getElementById('themeCycle');
const themeColorIcon = document.getElementById('themeColorIcon');

const themeColors = [
  { name: "violet", color: "#8b5cf6", icon: "🟣" },
  { name: "cyan",   color: "#06b6d4", icon: "🔵" },
  { name: "amber",  color: "#f59e0b", icon: "🟠" },
];

let themeIdx = +localStorage.getItem('themeIdx') || 0;
function setAccent(idx) {
  const t = themeColors[idx % themeColors.length];
  document.documentElement.style.setProperty('--acc1', t.color);
  themeColorIcon.textContent = t.icon;
  localStorage.setItem('themeIdx', idx % themeColors.length);
}
setAccent(themeIdx);

themeCycle.addEventListener('click', () => {
  themeIdx = (themeIdx + 1) % themeColors.length;
  setAccent(themeIdx);
});

const burger = document.getElementById("burgerBtn");
const navMenu = document.getElementById("navMenu");
const themeBtn = document.getElementById("themeCycle");

burger.addEventListener("click", () => {
  const isActive = burger.classList.toggle("active");
  navMenu.classList.toggle("open", isActive);

  if (themeBtn) {
    themeBtn.style.opacity = isActive ? "0" : "1";
    themeBtn.style.pointerEvents = isActive ? "none" : "auto";
  }
});

navMenu.querySelectorAll("a, button").forEach(el => {
  el.addEventListener("click", () => {
    burger.classList.remove("active");
    navMenu.classList.remove("open");
    if (themeBtn) {
      themeBtn.style.opacity = "1";
      themeBtn.style.pointerEvents = "auto";
    }
  });
});

