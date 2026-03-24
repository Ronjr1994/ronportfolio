
let siteData = null;
let activeToolFilter = 'All Tools';
let galleryImages = [];
let galleryIndex = 0;

const $ = (s,p=document)=>p.querySelector(s);
const $$ = (s,p=document)=>[...p.querySelectorAll(s)];

async function loadSiteData(){
  try{
    const api = await fetch('/api/site');
    if(api.ok) return await api.json();
  }catch(e){}
  const file = await fetch('assets/data/site.json');
  return file.json();
}

function makeParticles(){
  const layer = $('#particleLayer');
  if(!layer) return;
  const count = window.innerWidth > 900 ? 110 : 56;
  layer.innerHTML = '';
  for(let i=0;i<count;i++){
    const dot = document.createElement('span');
    dot.className = 'particle' + (Math.random() > .68 ? ' bright' : '');
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = 2 + Math.random() * 5.5;
    dot.style.left = x + '%';
    dot.style.top = y + '%';
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.animationDuration = (12 + Math.random() * 20) + 's';
    dot.style.opacity = (0.28 + Math.random() * 0.72).toFixed(2);
    dot.style.animationDelay = (-Math.random() * 10) + 's';
    layer.appendChild(dot);
  }
}

function renderSocials(items){
  $('#socialLinks').innerHTML = items.map(item => `
    <a class="social-btn" href="${item.href}" target="_blank" rel="noreferrer" aria-label="${item.name}">
      <iconify-icon icon="${item.icon}"></iconify-icon>
    </a>
  `).join('');
}

function renderHero(hero){
  const chips = $('#heroChips');
  if(hero.chips && hero.chips.length){
    chips.innerHTML = hero.chips.map(chip => `
    <div class="hero-chip"><iconify-icon icon="${chip.icon}"></iconify-icon><span>${chip.text}</span></div>
  `).join('');
  }else{
    chips.innerHTML = '';
  }
  $('#heroTitle').textContent = hero.title;
  $('#heroLead').textContent = hero.lead;
  const email = $('#heroEmail');
  email.textContent = hero.email;
  email.href = `mailto:${hero.email}`;
  $('#solidWord').textContent = hero.solid;
  $('#solidLabel').textContent = hero.solidLabel;
  $('#knownForTitle').textContent = hero.knownForTitle;
  $('#knownForList').innerHTML = hero.knownFor.map(item => `
    <li><span class="emoji">${item.icon}</span><span>${item.text}</span></li>
  `).join('');
}

function renderServices(data){
  $('#servicesTitle').textContent = data.title;
  $('#servicesSubtitle').textContent = data.subtitle;
  $('#servicesGrid').innerHTML = data.items.map(item => `
    <article class="service-card reveal">
      <div class="service-icon"><iconify-icon icon="${item.icon}"></iconify-icon></div>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join('');
}

function renderWorkSummary(data){
  $('#workSummaryTitle').textContent = data.title;
  $('#workSummarySubtitle').textContent = data.subtitle;
  $('#summaryGrid').innerHTML = data.cards.map(card => `
    <article class="summary-card reveal">
      <span class="summary-badge">${card.badge}</span>
      <h3>${card.title}</h3>
      <p>${card.text}</p>
      <ul>
        ${card.bullets.map(b => `<li><iconify-icon icon="mdi:check-circle-outline"></iconify-icon><span>${b}</span></li>`).join('')}
      </ul>
    </article>
  `).join('');
}

function projectMedia(project){
  if(project.type === 'video'){
    return `
      <div class="project-media">
        <div class="video-overlay">
          <div class="video-play">
            <div class="circle"><iconify-icon icon="mdi:play"></iconify-icon></div>
            <span>Click to play</span>
          </div>
        </div>
      </div>
    `;
  }
  return `<div class="project-media"><img src="${project.image}" alt="${project.title}"></div>`;
}

function renderProjects(data){
  $('#projectsTitle').textContent = data.title;
  $('#projectsSubtitle').textContent = data.subtitle;
  $('#projectsGrid').innerHTML = data.items.map((project, idx) => `
    <article class="project-card reveal">
      ${projectMedia(project)}
      <div class="project-body">
        <span class="project-badge"><iconify-icon icon="${project.icon}"></iconify-icon>${project.badge}</span>
        <h3>${project.title}</h3>
        <p>${project.text}</p>
        ${project.type === 'link'
          ? `<a class="project-link" href="${project.href}" target="_blank" rel="noreferrer">View Project <iconify-icon icon="mdi:open-in-new"></iconify-icon></a>`
          : `<button class="project-link gallery-trigger" data-gallery="${project.title.includes('Lighthouse') ? 'lighthouse' : (project.type==='video' ? 'video' : 'designs')}" data-project-index="${idx}" type="button">View Project <iconify-icon icon="${project.type==='video' ? 'mdi:play-circle-outline':'mdi:open-in-new'}"></iconify-icon></button>`
        }
      </div>
    </article>
  `).join('');
}

function renderTools(data){
  $('#toolsTitle').textContent = data.title;
  $('#toolsSubtitle').textContent = data.subtitle;
  $('#toolFilter').innerHTML = data.filters.map(filter => `
    <button class="filter-btn ${filter === activeToolFilter ? 'active':''}" data-filter="${filter}">${filter}</button>
  `).join('');
  const items = activeToolFilter === 'All Tools'
    ? data.items
    : data.items.filter(item => item.group === activeToolFilter);
  $('#toolGrid').innerHTML = items.map(item => `
    <article class="tool-card reveal">
      <iconify-icon icon="${item.icon}"></iconify-icon>
      <span>${item.name}</span>
    </article>
  `).join('');
}

function renderTimeline(data){
  $('#timelineTitle').textContent = data.title;
  $('#timelineSubtitle').textContent = data.subtitle;
  $('#timelineList').innerHTML = data.items.map((item, i) => `
    <div class="timeline-item reveal">
      <div class="timeline-dot"></div>
      <article class="timeline-card ${item.open ? 'open' : ''}">
        <div class="timeline-head" data-index="${i}">
          <div class="timeline-head-main">
            <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
              <span class="timeline-date-pill"><iconify-icon icon="mdi:calendar-blank-outline"></iconify-icon>${item.date}</span>
              <span class="timeline-duration">${item.duration}</span>
            </div>
            <h3 class="timeline-title">${item.title}</h3>
            <div class="timeline-company">${item.company}</div>
            <div class="timeline-location"><iconify-icon icon="mdi:map-marker-outline"></iconify-icon>${item.location}</div>
          </div>
          <div class="timeline-head-right">
            <div class="timeline-toggle"><iconify-icon icon="mdi:chevron-down"></iconify-icon></div>
          </div>
        </div>
        <div class="timeline-content">
          <div class="timeline-divider"></div>
          <p>${item.summary}</p>
          <ul>${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
          <div class="timeline-tags">${item.tags.map(tag => `<span class="timeline-tag">${tag}</span>`).join('')}</div>
        </div>
      </article>
    </div>
  `).join('');
}

function renderTestimonials(data){
  $('#testimonialsTitle').textContent = data.title;
  $('#testimonialsGrid').innerHTML = data.items.map(item => `
    <article class="testimonial-card reveal">
      <p>“${item.quote}”</p>
      <div class="testimonial-author">- ${item.author}</div>
    </article>
  `).join('');
}

function renderCTA(data){
  $('#ctaTitle').textContent = data.title;
  $('#ctaSubtitle').textContent = data.subtitle;
  const btn = $('#ctaButton');
  btn.textContent = data.button;
  btn.href = data.mailto;
}

function renderFooter(data){
  $('#footerCopyright').textContent = data.copyright;
}

function setupToolFilter(){
  $('#toolFilter').addEventListener('click', (e)=>{
    const btn = e.target.closest('.filter-btn');
    if(!btn) return;
    activeToolFilter = btn.dataset.filter;
    renderTools(siteData.tools);
    setupReveal(true);
  });
}

function setupTimeline(){
  $('#timelineList').addEventListener('click', (e)=>{
    const head = e.target.closest('.timeline-head');
    if(!head) return;
    const card = head.closest('.timeline-card');
    card.classList.toggle('open');
  });
}

function openGallery(images, start=0){
  galleryImages = images;
  galleryIndex = start;
  updateGallery();
  $('#galleryModal').classList.add('open');
  $('#galleryModal').setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeGallery(){
  $('#galleryModal').classList.remove('open');
  $('#galleryModal').setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
function updateGallery(){
  $('#galleryImage').src = galleryImages[galleryIndex];
  $('#galleryCount').textContent = `${galleryIndex+1} / ${galleryImages.length}`;
}
function setupGallery(){
  document.addEventListener('click', (e)=>{
    const trigger = e.target.closest('.gallery-trigger');
    if(!trigger) return;
    const type = trigger.dataset.gallery;
    if(type === 'lighthouse') openGallery(siteData.galleries.lighthouse, 0);
    else if(type === 'designs') openGallery(siteData.galleries.designs, 0);
    else if(type === 'video'){
      // show the video in a simple modal
      const videoMarkup = `
        <video controls autoplay playsinline style="width:100%;max-height:72vh;border-radius:16px;background:#000">
          <source src="${siteData.projects.items[0].video}" type="video/mp4">
        </video>`;
      $('#galleryImage').replaceWith(Object.assign(document.createElement('div'),{id:'galleryImage', innerHTML:videoMarkup}));
      $('#galleryCount').textContent = 'Video';
      $('#galleryModal').classList.add('open');
      $('#galleryModal').setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      return;
    }
  });
  $('#galleryClose').addEventListener('click', ()=>{
    const custom = $('#galleryImage');
    if(custom && custom.tagName !== 'IMG'){
      const img = document.createElement('img');
      img.id = 'galleryImage';
      img.alt = 'Gallery image';
      custom.replaceWith(img);
    }
    closeGallery();
  });
  $('#galleryPrev').addEventListener('click', ()=>{
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateGallery();
  });
  $('#galleryNext').addEventListener('click', ()=>{
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    updateGallery();
  });
  $('#galleryModal').addEventListener('click', (e)=>{
    if(e.target.id === 'galleryModal') closeGallery();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeGallery();
  });
}

function setupMenu(){
  const btn = $('#menuToggle');
  const nav = $('#navLinks');
  btn.addEventListener('click', ()=>{
    nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(nav.classList.contains('open')));
  });
  nav.addEventListener('click', (e)=>{
    if(e.target.matches('a')) nav.classList.remove('open');
  });
}

function setupActiveNav(){
  const sections = ['services','works','projects','tools','experience'];
  const links = $$('.nav-links a');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        links.forEach(link=>link.classList.toggle('active', link.getAttribute('href') === '#'+entry.target.id));
      }
    });
  }, {rootMargin:'-45% 0px -45% 0px', threshold:0});
  sections.forEach(id=>{
    const el = document.getElementById(id);
    if(el) observer.observe(el);
  });
}

function setupReveal(force=false){
  const els = $$('.reveal').filter(el => force || !el.dataset.observed);
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.14});
  els.forEach(el=>{
    el.dataset.observed = '1';
    observer.observe(el);
  });
}

function heroMotion(){
  const visual = $('.hero-visual');
  if(!visual) return;
  visual.addEventListener('mousemove',(e)=>{
    const rect = visual.getBoundingClientRect();
    const x = ((e.clientX - rect.left)/rect.width - .5)*8;
    const y = ((e.clientY - rect.top)/rect.height - .5)*8;
    $('.portrait-wrap').style.transform = `translate3d(${x}px, ${y}px, 0)`;
    $('.bolt-backdrop').style.transform = `translate3d(${x * 1.2}px, ${y * 1.2}px, 0) rotate(${8 + x * .4}deg)`;
  });
  visual.addEventListener('mouseleave', ()=>{
    $('.portrait-wrap').style.transform = '';
    $('.bolt-backdrop').style.transform = '';
  });
}

async function init(){
  siteData = await loadSiteData();
  document.title = siteData.meta.title;
  document.querySelector('meta[name="description"]').setAttribute('content', siteData.meta.description);

  renderSocials(siteData.socials);
  renderHero(siteData.hero);
  renderServices(siteData.services);
  renderWorkSummary(siteData.workSummary);
  renderProjects(siteData.projects);
  renderTools(siteData.tools);
  renderTimeline(siteData.timeline);
  renderTestimonials(siteData.testimonials);
  renderCTA(siteData.cta);
  renderFooter(siteData.footer);

  makeParticles();
  setupToolFilter();
  setupTimeline();
  setupGallery();
  setupMenu();
  setupActiveNav();
  setupReveal();
  heroMotion();
}
window.addEventListener('resize', makeParticles);
init();
