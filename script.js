/* ===== Mobile burger / drawer ===== */
const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');

function setDrawer(open){
  drawer.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  burger.setAttribute('aria-expanded', String(open));
}
burger?.addEventListener('click', (e)=>{
  e.stopPropagation();
  setDrawer(!drawer.classList.contains('open'));
});
// close on outside click
document.addEventListener('click', (e)=>{
  if (!drawer.classList.contains('open')) return;
  const inside = drawer.contains(e.target) || burger.contains(e.target);
  if (!inside) setDrawer(false);
});
// close after link click
drawer?.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', ()=> setDrawer(false), {passive:true});
});

/* ===== Tabs ===== */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
    tab.classList.add('active');
    const panel = document.getElementById(tab.dataset.tab);
    if (panel) panel.classList.add('show');
  });
});

/* ===== Year ===== */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== Lightbox with descriptions ===== */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbTitle = document.getElementById('lbTitle');
const lbDesc  = document.getElementById('lbDesc');
const prevBtn = document.querySelector('.lb-prev');
const nextBtn = document.querySelector('.lb-next');
const closeBtn= document.querySelector('.lb-close');

const GALLERIES = {
  trail:{ 
    title:"Honda Trail 125",
    desc:"For the Hunter model, I had the opportunity to collaborate with a team from Japan. This model, the Gold Wing, was one of the best-selling models at the time. The project required highly precise work within a very tight schedule, and it was both an enjoyable and truly challenging experience.",
    images:[
      "https://i.ibb.co/7JH2BzFR/denis-niko-view-00.jpg",
      "https://i.ibb.co/PGP1vHwf/denis-niko-view-06.jpg",
      "https://i.ibb.co/SDK2YjbG/denis-niko-view-wire-4.jpg"
    ]
  },
  click:{ 
    title:"Honda Click 160",
    desc:"For the Honda Click model, which was a top-selling product in both the Thai market and the Southeast Asian market, I was given the opportunity to lead the project as the project manager. This role was a significant challenge that demonstrated my ability to plan, manage, and successfully drive the project to completion with excellence.",
    images:[
      "https://i.ibb.co/TMdK769C/197952d88821491899ca3cf522b8cb9b.jpg",
      "https://i.ibb.co/3y26n5BH/Sell-Point-3.jpg",
      "https://i.ibb.co/CK5K48bD/Sell-Point-1.jpg"
    ]
  },
  giorno:{ 
    title:"Honda Giorno 125",
    desc:"For the Honda Giorno , a project I am truly proud of, the work was both exciting and highly challenging. At that time, competition in the motorcycle market was intense, and our task was to deliver a design that was fresh and distinctive, while still being well-accepted and not too disruptive. Striking this balance was a difficult challenge, but also one of the most rewarding aspects of the project.",
    images:[
      "https://i.ibb.co/Pvk3Hyt0/2323.jpg",
      "https://i.ibb.co/5gY9ktNZ/New-Bitmap-image.jpg",
      "https://i.ibb.co/S4yVx5XV/Giorno1.jpg"
    ]
  },
};

let current = { list:[], i:0, desc:"", title:"" };
function openLightbox(key){
  const g = GALLERIES[key]; if(!g||!g.images.length) return;
  current = { list:g.images, i:0, desc:g.desc, title:g.title };
  lbTitle.textContent = g.title;
  lbDesc.textContent  = g.desc;
  lbImg.src = g.images[0];
  lb.removeAttribute('hidden');
}
function show(i){
  if(!current.list.length) return;
  current.i = (i + current.list.length) % current.list.length;
  lbImg.src = current.list[current.i];
  lbTitle.textContent = current.title;
  lbDesc.textContent  = current.desc;
}
prevBtn?.addEventListener('click',()=>show(current.i-1));
nextBtn?.addEventListener('click',()=>show(current.i+1));
closeBtn?.addEventListener('click',()=>lb.setAttribute('hidden',''));
lb?.addEventListener('click',e=>{ if(e.target===lb) lb.setAttribute('hidden',''); });
window.addEventListener('keydown',e=>{
  if(!lb || lb.hasAttribute('hidden')) return;
  if(e.key==='Escape') lb.setAttribute('hidden','');
  if(e.key==='ArrowLeft') show(current.i-1);
  if(e.key==='ArrowRight') show(current.i+1);
});
document.querySelectorAll('.p-card').forEach(card=>{
  card.addEventListener('click', ()=> openLightbox(card.dataset.project) );
  card.querySelector('.sm-view')?.addEventListener('click', e=>{ e.stopPropagation(); openLightbox(card.dataset.project); });
});

/* ===== Contact form minimal anti-spam ===== */
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');
const tsInput     = document.getElementById('formTs');
if (contactForm && tsInput && formStatus) {
  tsInput.value = String(Date.now());
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(contactForm);
    if ((fd.get('_gotcha') || '').toString().trim() !== '') return;
    const started = parseInt(fd.get('_ts'), 10) || 0;
    if (Date.now() - started < 3000) return showStatus('Please wait a moment and try again.', 'error');
    showStatus('Sending…', 'info');
    try{
      const res = await fetch(contactForm.action,{method:'POST',body:fd,headers:{'Accept':'application/json'}});
      if(res.ok){ showStatus('Message sent successfully! ✅','success'); contactForm.reset(); tsInput.value=String(Date.now()); }
      else{ showStatus('Oops, something went wrong. Please try again.','error'); }
    }catch{ showStatus('Network error. Please try again later.','error'); }
  });
  function showStatus(text, kind){ formStatus.textContent=text; formStatus.className='form-status show '+(kind||'info'); }
}

/* ===== PDF inline preview + modal via PDF.js ===== */
(function () {
  const wrap = document.querySelector('.pdf-hover-wrap'); if (!wrap) return;

  const RAW_PDF_URL = 'https://raw.githubusercontent.com/MaxZabol/Codepen/main/Portfolio%20Picha%20Nillawong%2011Sep.pdf';
  const VIEWER_BASE = 'https://mozilla.github.io/pdf.js/web/viewer.html?file=';
  const RENDER_URL  = VIEWER_BASE + encodeURIComponent(RAW_PDF_URL);

  const slot    = wrap.querySelector('.preview-slot');
  const fullBtn = wrap.querySelector('.previewFullBtn');
  const leftBtn = wrap.querySelector('.pdf-thumb-left');

  let inlineLoaded = false;
  function ensureInline(){
    if (inlineLoaded) return;
    const iframe = document.createElement('iframe');
    iframe.title = 'Portfolio preview';
    iframe.loading = 'lazy';
    iframe.src = RENDER_URL + '#zoom=page-width&toolbar=0&navpanes=0';
    iframe.referrerPolicy = 'no-referrer';
    iframe.style.width = '100%';
    iframe.style.height = '72vh';
    iframe.style.border = '0';
    iframe.style.background = '#fff';
    slot.appendChild(iframe);
    inlineLoaded = true;
  }

  // Hover loads on desktop; click toggles on mobile
  wrap.addEventListener('mouseenter', ensureInline, { passive:true });
  leftBtn?.addEventListener('click', ()=>{
    const open = !wrap.classList.contains('is-open');
    wrap.classList.toggle('is-open', open);
    leftBtn.setAttribute('aria-expanded', String(open));
    if (open) ensureInline();
  });
  leftBtn?.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); leftBtn.click(); }
  });

  const modal   = document.getElementById('pdfModal');
  const frame   = document.getElementById('pdfFrame');
  const closeBtn= document.querySelector('.pdf-close');

  function openPdfModal(){
    frame.src = RENDER_URL + '#zoom=page-fit';
    modal.removeAttribute('hidden');
    document.documentElement.style.overflow = 'hidden';
  }
  function closePdfModal(){
    modal.setAttribute('hidden','');
    frame.src = 'about:blank';
    document.documentElement.style.overflow = '';
  }

  fullBtn?.addEventListener('click', openPdfModal);
  closeBtn?.addEventListener('click', closePdfModal);
  modal?.addEventListener('click', (e)=>{ if (e.target === modal) closePdfModal(); });
  window.addEventListener('keydown', (e)=>{ if (!modal.hasAttribute('hidden') && e.key==='Escape') closePdfModal(); });
})();