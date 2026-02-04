const APP={token:null,user:null,companies:[],projects:[],currentCompany:null,currentProject:null,currentView:'home'};

document.addEventListener('DOMContentLoaded',()=>{checkAuth();setupEventListeners()});

function checkAuth(){
  const urlParams=new URLSearchParams(window.location.search);
  const tokenFromUrl=urlParams.get('token');
  if(tokenFromUrl){APP.token=tokenFromUrl;localStorage.setItem('procore_token',tokenFromUrl);window.history.replaceState({},'','/')}
  else{APP.token=localStorage.getItem('procore_token')}
  if(APP.token){showMainApp();loadUserData()}else{showLoginScreen()}
}

function showLoginScreen(){document.getElementById('login-screen').classList.remove('hidden');document.getElementById('main-app').classList.add('hidden')}
function showMainApp(){document.getElementById('login-screen').classList.add('hidden');document.getElementById('main-app').classList.remove('hidden')}
function logout(){APP.token=null;localStorage.removeItem('procore_token');showLoginScreen()}

async function apiCall(endpoint,params={}){
  const qs=new URLSearchParams(params).toString();
  const url=`/api/${endpoint}${qs?'?'+qs:''}`;
  const res=await fetch(url,{headers:{'Authorization':`Bearer ${APP.token}`}});
  if(res.status===401){logout();throw new Error('Session expired')}
  return res.json();
}

async function loadUserData(){
  try{
    APP.user=await apiCall('me');
    document.getElementById('user-name').textContent=APP.user.name;
    document.getElementById('user-email').textContent=APP.user.login;
    APP.companies=await apiCall('companies');
    if(APP.companies.length>0){APP.currentCompany=APP.companies[0];loadProjects(APP.currentCompany.id)}
  }catch(e){console.error(e)}
}

async function loadProjects(companyId){
  try{
    APP.projects=await apiCall('projects',{company_id:companyId});
    const select=document.getElementById('project-select');
    select.innerHTML='<option value="">Seleccionar...</option>';
    APP.projects.forEach(p=>{const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name;select.appendChild(opt)});
    if(APP.projects.length>0){select.value=APP.projects[0].id;selectProject(APP.projects[0].id)}
  }catch(e){console.error(e)}
}

async function selectProject(projectId){
  APP.currentProject=APP.projects.find(p=>p.id==projectId);
  if(APP.currentProject)loadDashboardData();
}

async function loadDashboardData(){
  if(!APP.currentProject)return;
  try{
    const rfis=await apiCall('rfis',{project_id:APP.currentProject.id,company_id:APP.currentCompany.id});
    document.getElementById('stat-rfis').textContent=rfis.length||0;
    document.getElementById('badge-rfis').textContent=rfis.length||0;
    const subs=await apiCall('submittals',{project_id:APP.currentProject.id,company_id:APP.currentCompany.id});
    document.getElementById('stat-submittals').textContent=subs.length||0;
    document.getElementById('badge-submittals').textContent=subs.length||0;
    const punch=await apiCall('punch-list',{project_id:APP.currentProject.id,company_id:APP.currentCompany.id});
    document.getElementById('stat-punch').textContent=punch.length||0;
    document.getElementById('badge-punch').textContent=punch.length||0;
  }catch(e){console.error(e)}
}

async function loadRFIs(){
  if(!APP.currentProject)return;
  const tbody=document.getElementById('rfis-table-body');
  tbody.innerHTML='<tr><td colspan="4" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';
  try{
    const rfis=await apiCall('rfis',{project_id:APP.currentProject.id,company_id:APP.currentCompany.id});
    if(!rfis.length){tbody.innerHTML='<tr><td colspan="4" class="loading-cell">No hay RFIs</td></tr>';return}
    tbody.innerHTML=rfis.map(r=>`<tr><td>#${r.number||r.id}</td><td>${r.subject||'-'}</td><td>${r.status||'Abierto'}</td><td>${r.created_at?.substring(0,10)||'-'}</td></tr>`).join('');
  }catch(e){tbody.innerHTML='<tr><td colspan="4" class="loading-cell">Error</td></tr>'}
}

async function loadSubmittals(){
  if(!APP.currentProject)return;
  const tbody=document.getElementById('submittals-table-body');
  tbody.innerHTML='<tr><td colspan="4" class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';
  try{
    const subs=await apiCall('submittals',{project_id:APP.currentProject.id,company_id:APP.currentCompany.id});
    if(!subs.length){tbody.innerHTML='<tr><td colspan="4" class="loading-cell">No hay Submittals</td></tr>';return}
    tbody.innerHTML=subs.map(s=>`<tr><td>#${s.number||s.id}</td><td>${s.title||'-'}</td><td>${s.status?.name||'Pendiente'}</td><td>${s.created_at?.substring(0,10)||'-'}</td></tr>`).join('');
  }catch(e){tbody.innerHTML='<tr><td colspan="4" class="loading-cell">Error</td></tr>'}
}

async function loadPunchList(){
  if(!APP.currentProject)return;
  const grid=document.getElementById('punch-grid');
  grid.innerHTML='<div class="loading-cell"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
  try{
    const items=await apiCall('punch-list',{project_id:APP.currentProject.id,company_id:APP.currentCompany.id});
    if(!items.length){grid.innerHTML='<div class="loading-cell">No hay Punch Items</div>';return}
    grid.innerHTML=items.map(i=>`<div class="punch-item"><h4>#${i.number||i.id}</h4><p>${i.name||'Sin nombre'}</p></div>`).join('');
  }catch(e){grid.innerHTML='<div class="loading-cell">Error</div>'}
}

function showView(viewName){
  APP.currentView=viewName;
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  const view=document.getElementById(`view-${viewName}`);
  if(view)view.classList.add('active');else{document.getElementById('view-generic').classList.add('active')}
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.toggle('active',i.dataset.view===viewName));
  if(viewName==='rfis')loadRFIs();
  if(viewName==='submittals')loadSubmittals();
  if(viewName==='punch-list')loadPunchList();
}

function setupEventListeners(){
  document.querySelectorAll('.nav-item').forEach(i=>i.addEventListener('click',e=>{e.preventDefault();showView(i.dataset.view)}));
  document.getElementById('project-select').addEventListener('change',e=>selectProject(e.target.value));
  document.getElementById('btn-logout').addEventListener('click',logout);
}
