(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const data = {employees:[],activities:[],announcements:[]};
  let currentUser = null;
  let activeModule = "dashboard";
  let dashboardDepartment = "";
  let employees = [];
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let dataLoaded=true;
  let ready=Promise.resolve();
  const roleNames = {colaborador:"Colaboradora",rh:"Equipe de RH",admin:"Administrador"};
  const navGroups = [
    {label:"VISÃO GERAL",items:[["dashboard","⌂","Meu painel"]]},
    {label:"JORNADA DO COLABORADOR",items:[["holerites","▤","Meus holerites"],["beneficios","◇","Vale alimentação"],["ponto","◷","Ponto web"],["solicitacoes","✉","Central de solicitações"],["agenda","♡","Agenda psicológica"]]},
    {label:"COMUNICAÇÃO",items:[["comunicados","▧","Mural de comunicados"]]},
    {label:"GESTÃO",items:[["funcionarios","♙","Funcionários"],["usuarios","⚙","Usuários e permissões"],["relatorios","▥","Relatórios"]]}
  ];
  const modules = {
    holerites:["▤","Meus holerites","Consulte seus demonstrativos mensais e acesse seus documentos."],
    beneficios:["◇","Vale alimentação","Acompanhe informações e valores do seu benefício."],
    ponto:["◷","Ponto web","Consulte sua jornada e acompanhe seus registros de frequência."],
    solicitacoes:["✉","Central de solicitações","Abra e acompanhe solicitações para a equipe de RH."],
    agenda:["♡","Agenda psicológica","Consulte horários e conheça as iniciativas de bem-estar."],
    comunicados:["▧","Mural de comunicados","Fique por dentro das novidades e informações da empresa."],
    funcionarios:["♙","Gestão de funcionários","Consulte, cadastre e atualize os dados dos colaboradores."],
    usuarios:["⚙","Usuários e permissões","Gerencie perfis de acesso e níveis de permissão."],
    relatorios:["▥","Relatórios e indicadores","Acompanhe indicadores e informações consolidadas de RH."]
  };
  const permissions = {
    colaborador:["dashboard","holerites","beneficios","ponto","solicitacoes","agenda","comunicados"],
    rh:["dashboard","holerites","beneficios","ponto","solicitacoes","agenda","comunicados","funcionarios"],
    admin:Object.keys(modules).filter(id=>id!=="usuarios").concat(["dashboard"])
  };

  function toast(message,type="success"){
    const el=document.createElement("div");el.className=`toast ${type}`;el.setAttribute("role",type==="error"?"alert":"status");const symbol=document.createElement("span");symbol.className="toast-symbol";symbol.innerHTML=window.RHDesign.icon(type==="error"?"alert":"check");const copy=document.createElement("span");copy.textContent=message;el.append(symbol,copy);$("#toast-region").append(el);
    window.RHMotion.dismissibleToast(el);
  }
  function setTheme(theme){
    document.documentElement.dataset.theme=theme;
    localStorage.setItem("rhconnect-theme",theme);
    $$(".theme-toggle").forEach(b=>{b.innerHTML=window.RHDesign.icon(theme==="dark"?"sun":"moon");b.setAttribute("aria-pressed",String(theme==="dark"));b.setAttribute("aria-label",theme==="dark"?"Ativar tema claro":"Ativar tema escuro")});
    document.querySelector('meta[name="theme-color"]').content=theme==="dark"?"#11151d":"#f5f7fb";
  }
  function initTheme(){
    const saved=localStorage.getItem("rhconnect-theme");
    const preferred=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
    setTheme(saved||preferred);
  }
  function initials(name){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase()}
  function showAuth(){ $("#auth-screen").classList.remove("hidden");$("#app-screen").classList.add("hidden");$("#page-content").innerHTML="";$("#main-nav").innerHTML="";employees=[];currentUser=null; }
  function showApp(){
    dashboardDepartment="";
    $("#auth-screen").classList.add("hidden");$("#app-screen").classList.remove("hidden");
    $("#profile-name").textContent=currentUser.name;$("#profile-role").textContent=roleNames[currentUser.role]||currentUser.role;
    $("#profile-avatar").textContent=currentUser.initials||initials(currentUser.name);
    $("#topbar-avatar").textContent=currentUser.initials||initials(currentUser.name);
    $("#profile-avatar").className=`avatar avatar-${currentUser.color||"blue"}`;
    $("#topbar-avatar").className=`topbar-avatar avatar avatar-${currentUser.color||"blue"}`;
    renderNav();navigate("dashboard");
  }
  function renderNav(){
    const allowed=permissions[currentUser.role]||permissions.colaborador;
    $("#main-nav").innerHTML=navGroups.map(group=>{
      const items=group.items.filter(item=>allowed.includes(item[0]));
      if(!items.length)return "";
      return `<div class="nav-section">${group.label}</div>${items.map(([id,icon,label])=>`<button class="nav-item ${activeModule===id?"active":""}" data-module="${id}" ${activeModule===id?'aria-current="page"':""}><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</button>`).join("")}`;
    }).join("");
  }
  function heading(title,description,actions=""){
    return `<div class="page-heading"><div><span class="eyebrow">RH CONNECT / ${currentUser.role.toUpperCase()}</span><h1>${title}</h1><p>${description}</p></div><div class="page-actions">${actions}</div></div>`;
  }
  function stat(label,value,foot,icon,positive=true){
    return `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot"><span class="${positive?"positive":""}">${foot}</span></div></article>`;
  }
  function activityList(){
    return data.activities.map(a=>`<div class="activity-item"><div class="activity-icon">${a.icon}</div><div class="activity-copy"><b>${a.title}</b><p>${a.desc}</p></div><span class="activity-time">${a.time}</span></div>`).join("");
  }
  function announcements(){
    return data.announcements.map(a=>`<div class="announcement"><span class="announcement-mark"></span><div><b>${a.title}</b><p>${a.desc}</p><span class="eyebrow">${a.tag}</span></div></div>`).join("");
  }
  function dashboard(){
    const admin=currentUser.role!=="colaborador";
    const title=currentUser.role==="colaborador"?"Olá, "+currentUser.name.split(" ")[0]+"!":"Olá, "+currentUser.name.split(" ")[0]+".";
    return `${`<div class="welcome-card"><div class="welcome-copy"><span class="eyebrow">SEU ESPAÇO, SUAS CONEXÕES</span><h2>${esc(title)}</h2><p>Que bom ter você por aqui. Veja o que está acontecendo hoje.</p></div><div class="welcome-date"><strong>${new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"2-digit",month:"long"}).format(new Date())}</strong>Um ótimo dia para fazer acontecer ✨</div></div>`}
      ${admin?window.RHEnterprise.management(employees,dashboardDepartment):window.RHEnterprise.employee()}
      <div class="grid dashboard-columns"><div>
        <section class="panel"><div class="panel-header"><div><h3>Atividade recente</h3><p>As últimas atualizações do seu espaço</p></div><button class="link-button" data-module="comunicados">Ver tudo →</button></div><div class="activity-list"><p class="ed-empty">Nenhuma atividade registrada.</p></div></section>
        <section class="panel"><div class="panel-header"><div><h3>Acesso rápido</h3><p>Encontre o que você precisa em poucos cliques</p></div></div><div class="grid quick-grid">${[["holerites","▤","Meus holerites","Documentos mensais"],["beneficios","◇","Benefícios","Informações do mês"],["ponto","◷","Ponto web","Minha jornada"],["solicitacoes","✉","Solicitações","Fale com o RH"]].map(x=>`<button class="quick-card" data-module="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small></button>`).join("")}</div></section>
      </div><div><section class="panel"><div class="panel-header"><div><h3>Mural de comunicados</h3><p>Informações importantes para você</p></div><button class="link-button" data-module="comunicados">Abrir mural →</button></div><p class="ed-empty">Nenhum comunicado publicado.</p></section>
      <section class="panel"><div class="panel-header"><div><h3>Seu espaço de bem-estar</h3><p>Cuidar de pessoas também é prioridade</p></div></div><div class="activity-item"><div class="activity-icon">🌱</div><div class="activity-copy"><b>Agenda psicológica</b><p>Consulte os horários disponíveis e reserve um momento para você.</p><button class="link-button" data-module="agenda">Conhecer agenda →</button></div></div></section></div></div>`;
  }
  function modulePage(id){
    const [icon,title,desc]=modules[id];
    const action=(id==="funcionarios"||id==="usuarios")?`<button class="small-button primary" data-action="new-employee">＋ Novo funcionário</button>`:"";
    if(id==="funcionarios"||id==="usuarios") return heading(title,desc,action)+window.RHPeople.render(employees,data.employees,currentUser.role);
    if(id==="relatorios")return heading(title,desc)+window.RHEnterprise.management(employees,dashboardDepartment);
    const empty={holerites:"Nenhum holerite disponibilizado.",beneficios:"Nenhum benefício cadastrado.",ponto:"Nenhum registro de jornada disponível.",solicitacoes:"O canal de solicitações ainda não foi configurado.",agenda:"Nenhum horário disponibilizado.",comunicados:"Nenhum comunicado publicado."};
    return heading(title,desc)+'<section class="panel"><div class="empty-state"><div class="empty-icon">'+window.RHDesign.icon(icon)+'</div><b>'+empty[id]+'</b><p>As informações serão disponibilizadas pela equipe responsável após a configuração do serviço.</p></div></section>';
  }
  function employeeRows(list=employees){
    return list.map((e,i)=>`<tr><td><div class="person-cell"><span class="avatar avatar-${["blue","violet","green","orange"][i%4]}">${esc(e.initials||initials(e.name))}</span><span><b>${esc(e.name)}</b><small>${esc(e.email)}</small></span></div></td><td>${esc(e.department)}</td><td>${esc(e.role)}</td><td><span class="status-pill ${e.status==="Pendente"?"pending":e.status==="Inativo"?"inactive":""}">${esc(e.status)}</span></td><td><button class="link-button" data-action="view-employee" data-email="${esc(e.email)}">Ver perfil</button></td></tr>`).join("");
  }
  function profilePage(){
    return `${heading("Meu perfil","Suas informações pessoais e profissionais.")}<div class="profile-hero"><span class="avatar avatar-${currentUser.color||"blue"}">${esc(currentUser.initials||initials(currentUser.name))}</span><div><h2>${esc(currentUser.name)}</h2><p>${esc(currentUser.title)} · ${esc(currentUser.department)}</p></div><span class="status-pill">Ativo</span></div><section class="panel"><div class="panel-header"><h3>Informações profissionais</h3></div><div class="grid profile-fields">${[["Nome completo",currentUser.name],["E-mail",currentUser.email],["Cargo",currentUser.title],["Departamento",currentUser.department],["Nível de acesso",roleNames[currentUser.role]],["Situação","Ativo"]].map(x=>`<div class="info-field"><small>${x[0]}</small><b>${esc(x[1])}</b></div>`).join("")}</div></section>`;
  }
  function navigate(id){
    const allowed=permissions[currentUser.role]||permissions.colaborador;
    if(id!=="perfil"&&!allowed.includes(id)){toast("Seu perfil não tem permissão para acessar esta área.","error");return}
    activeModule=id;renderNav();
    const labels={dashboard:"Meu painel",perfil:"Meu perfil",...Object.fromEntries(Object.entries(modules).map(([k,v])=>[k,v[1]]))};
    $("#breadcrumb-current").textContent=labels[id]||"Meu painel";
    $("#page-content").innerHTML=id==="dashboard"?dashboard():id==="perfil"?profilePage():modulePage(id);
    if(id==="funcionarios"||id==="usuarios")window.RHPeople.bind($("#page-content"),employees,data.employees,currentUser.role);
    if(id==="dashboard"||id==="relatorios")window.RHEnterprise.bind($("#page-content"),employees,value=>{dashboardDepartment=value});
    window.RHMotion.enter($("#page-content"));
    if(id==="dashboard")window.RHMotion.syncFilter($("#page-content"));
    if(!dataLoaded){$("#page-content").setAttribute("aria-busy","true");$("#page-content").insertAdjacentHTML("afterbegin",window.RHMotion.skeleton());}else $("#page-content").removeAttribute("aria-busy");
    setMenu(false);
  }
  let modalReturnFocus=null;
  function openModal(title,subtitle,body,submitText="Salvar",onSubmit=null){
    modalReturnFocus=document.activeElement;document.body.classList.add("modal-open");
    $("#modal-root").innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title">${title}</h2><p>${subtitle}</p></div><button class="icon-button" aria-label="Fechar janela" data-close-modal>×</button></div>${body}<div class="modal-actions"><button class="small-button" data-close-modal>Cancelar</button><button class="small-button primary" id="modal-submit">${submitText}</button></div></section></div>`;
    $$("[data-close-modal]").forEach(b=>b.addEventListener("click",closeModal));
    $(".modal-backdrop").addEventListener("click",e=>{if(e.target.classList.contains("modal-backdrop"))closeModal()});
    $("#modal-submit").addEventListener("click",()=>onSubmit&&onSubmit());
    ($(".modal input")||$(".modal [data-close-modal]")).focus();
    $(".modal form").forEach(form=>form.addEventListener("submit",e=>{e.preventDefault();if(!$("#modal-submit").disabled)$("#modal-submit").click()}));
  }
  function closeModal(){$("#modal-root").innerHTML="";document.body.classList.remove("modal-open");if(modalReturnFocus?.isConnected)modalReturnFocus.focus();modalReturnFocus=null;}
  function canManage(){return currentUser && ["admin","rh"].includes(currentUser.role)}
  function mutable(email){return !data.employees.some(r=>r.email.toLowerCase()===email.toLowerCase())}
  function newEmployee(existing=null){
    if(!canManage()||(existing&&!mutable(existing.email)))return;
    const val=k=>esc(existing?.[k]||"");
    const opts=(values,key)=>values.map(v=>'<option'+(existing?.[key]===v?' selected':'')+'>'+v+'</option>').join("");
    const roles=currentUser.role==="admin"?["Colaborador","RH","Administrador"]:["Colaborador"];
    if(existing&&!roles.includes(existing.role)){toast("Somente o administrador pode alterar este perfil.","error");return}
    openModal(existing?"Editar funcionário":"Cadastrar funcionário","Preencha os dados profissionais. Este cadastro não cria uma conta de acesso.",`<form id="employee-form" class="modal-form"><label class="field-label wide">Nome completo<input name="name" maxlength="150" value="${val("name")}" required></label><label class="field-label wide">E-mail corporativo<input name="email" type="email" maxlength="254" value="${val("email")}" ${existing?"readonly":""} required></label><label class="field-label">Departamento<input name="department" maxlength="150" value="${val("department")}" required></label><label class="field-label">Cargo<input name="title" maxlength="150" value="${val("title")}" required></label><label class="field-label">Perfil<select name="role">${opts(roles,"role")}</select></label><label class="field-label">Situação<select name="status">${opts(["Ativo","Pendente","Inativo"],"status")}</select></label></form>`,"Salvar",async()=>{
      const form=$("#employee-form");if(!canManage()||!form.reportValidity())return;
      const f=new FormData(form),name=f.get("name").trim(),email=f.get("email").trim().toLowerCase(),department=f.get("department").trim(),title=f.get("title").trim();
      if(!name||!department||!title||!roles.includes(f.get("role"))){toast("Confira os campos obrigatórios.","error");return}
      const record={name,email,department,title,role:f.get("role"),status:f.get("status"),initials:initials(name)};
      const button=$("#modal-submit");button.disabled=true;button.setAttribute("aria-busy","true");
      const actor=currentUser;
      try{await ready;if(currentUser!==actor||!canManage())return;
        const index=employees.findIndex(r=>r.email.toLowerCase()===email);
        if(!existing&&index>=0){toast("E-mail já cadastrado.","error");return}
        if(existing&&(index<0||!mutable(email)))throw Error("Registro indisponível");
        await window.RHStore.add(record);if(index<0)employees.push(record);else employees[index]=record;
        if(currentUser===actor){closeModal();navigate(activeModule);toast("Cadastro salvo com sucesso.")}
      }catch(err){console.error(err);toast("Não foi possível salvar o cadastro.","error")}finally{if(button.isConnected){button.disabled=false;button.removeAttribute("aria-busy")}}
    });
  }
  function deleteEmployee(emp){
    if(currentUser?.role!=="admin"||!mutable(emp.email))return;
    openModal("Excluir funcionário","Esta operação remove o registro do diretório. Não revoga a conta de acesso.",'<p>Confirma a exclusão de <strong>'+esc(emp.name)+'</strong>?</p>',"Excluir",async()=>{
      const button=$("#modal-submit"),actor=currentUser;if(actor?.role!=="admin"||!mutable(emp.email))return;
      button.disabled=true;
      try{await ready;if(currentUser!==actor)return;await window.RHStore.remove(emp.email);employees=employees.filter(r=>r.email.toLowerCase()!==emp.email.toLowerCase());if(currentUser===actor){closeModal();navigate(activeModule);toast("Registro excluído.")}}
      catch(err){console.error(err);toast("Não foi possível excluir o registro.","error")}finally{if(button.isConnected)button.disabled=false}
    });
  }
  async function enterAccount(account){
    const rows=["admin","rh"].includes(account.role)?await window.RHStore.load():[];
    currentUser=account;employees=rows;showApp();
  }
  async function login(email,password){
    const button=$("#login-form button[type=submit]");if(button.disabled)return;button.disabled=true;
    try{const account=await window.RHStore.login(email,password,$("#remember-login").checked);await enterAccount(account);$("#login-password").value="";toast("Bem-vindo(a)!")}
    catch(e){console.error(e);await window.RHStore.logout().catch(()=>{});showAuth();toast("Não foi possível acessar. Confira suas credenciais, a confirmação do e-mail e a liberação pelo RH.","error")}
    finally{button.disabled=false}
  }
  $("#login-form").addEventListener("submit",e=>{e.preventDefault();login($("#login-email").value.trim(),$("#login-password").value)});
  $("#forgot-link").addEventListener("click",()=>openModal("Recuperar senha","Informe o e-mail da sua conta.",`<form id="recover-form"><label class="field-label">E-mail corporativo<input name="email" type="email" required></label></form>`,"Enviar instruções",async()=>{const form=$("#recover-form");if(!form.reportValidity())return;const button=$("#modal-submit");button.disabled=true;try{await window.RHStore.reset(new FormData(form).get("email").trim());closeModal();toast("Se a conta estiver cadastrada, as instruções serão enviadas.")}catch(e){toast("Não foi possível solicitar a recuperação.","error")}finally{if(button.isConnected)button.disabled=false}}));
  $$(".theme-toggle").forEach(b=>b.addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark")));
  document.addEventListener("input",e=>{if(e.target.id==="employee-search"){const q=e.target.value.toLowerCase();const rows=employees.filter(x=>(x.name+x.email+x.department+x.role).toLowerCase().includes(q));$("#employee-rows").innerHTML=rows.length?employeeRows(rows):'<tr><td colspan="5"><div class="empty-state"><b>Nenhum funcionário encontrado</b><p>Tente outro termo de busca.</p></div></td></tr>'}});
  document.addEventListener("click",e=>{
    const nav=e.target.closest("[data-module]");if(nav&&currentUser){navigate(nav.dataset.module);return}
    const action=e.target.closest("[data-action]");if(!action)return;
    if(action.dataset.action==="new-employee")newEmployee();
    if(["edit-employee","delete-employee"].includes(action.dataset.action)&&canManage()){const emp=employees.find(r=>r.email===action.dataset.email);if(emp){if(action.dataset.action==="edit-employee")newEmployee(emp);else deleteEmployee(emp)}}
    if(action.dataset.action==="view-employee"&&canManage()){const emp=employees.find(x=>x.email===action.dataset.email);if(emp)openModal(esc(emp.name),"Perfil do funcionário",`<div class="grid profile-fields">${[["E-mail",emp.email],["Cargo",emp.title],["Departamento",emp.department],["Perfil",emp.role],["Situação",emp.status]].map(x=>`<div class="info-field"><small>${x[0]}</small><b>${esc(x[1])}</b></div>`).join("")}</div>`,"Fechar",closeModal)}
  });
  function setMenu(open){$("#sidebar").classList.toggle("open",open);$("#mobile-menu").setAttribute("aria-expanded",String(open));$("#mobile-menu").setAttribute("aria-label",open?"Fechar menu":"Abrir menu");}
  $("#mobile-menu").addEventListener("click",()=>setMenu(!$("#sidebar").classList.contains("open")));
  $("#sidebar-overlay").addEventListener("click",()=>{setMenu(false);$("#mobile-menu").focus()});
  window.matchMedia("(min-width:961px)").addEventListener("change",()=>setMenu(false));
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){if($(".modal"))closeModal();else if($("#sidebar").classList.contains("open")){setMenu(false);$("#mobile-menu").focus();}}
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"&&currentUser&&!$(".modal")){e.preventDefault();$("#global-search").focus();}
    if(e.key==="Tab"&&$(".modal")){const items=$$("button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex='0']",$(".modal"));if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
  });
  $("#profile-menu").addEventListener("click",()=>navigate("perfil"));
  $("#notifications-button").addEventListener("click",()=>toast("Nenhuma notificação disponível."));
  $("#global-search").addEventListener("keydown",e=>{if(e.key==="Enter"){const q=e.target.value.trim().toLowerCase();if(!q)return;const match=Object.entries(modules).find(([id,m])=>permissions[currentUser.role].includes(id)&&m[1].toLowerCase().includes(q));if(match)navigate(match[0]);else if("painel dashboard".includes(q))navigate("dashboard");else toast("Nenhum módulo encontrado para esta busca.","error")}});
  $("#logout").addEventListener("click",async()=>{try{await window.RHStore.logout();closeModal();$("#login-password").value="";$("#global-search").value="";setMenu(false);showAuth();}catch(e){toast("Não foi possível encerrar a sessão.","error")}});
  $(".password-toggle").addEventListener("click",()=>{const p=$("#login-password");p.type=p.type==="password"?"text":"password";$(".password-toggle").setAttribute("aria-label",p.type==="password"?"Mostrar senha":"Ocultar senha");$(".password-toggle").setAttribute("aria-pressed",String(p.type==="text"));$(".password-toggle").innerHTML=window.RHDesign.icon(p.type==="text"?"eyeoff":"eye");});
  $("[data-presentation]").forEach(b=>b.addEventListener("click",()=>{$("#login-email").value=b.dataset.presentation+"@rhconnect.com";$("#login-password").value="123456";login($("#login-email").value,$("#login-password").value)}));
  initTheme();
  localStorage.removeItem("rh-demo-role");
  if(!window.RHStore.enabled){$("#login-form button[type=submit]").disabled=true;$("#forgot-link").disabled=true;$("#auth-subtitle").textContent="Portal em configuração. O acesso será liberado pela administração."}
  else {const button=$("#login-form button[type=submit]");button.disabled=true;window.RHStore.restore().then(account=>account&&enterAccount(account)).catch(async e=>{console.error(e);await window.RHStore.logout().catch(()=>{});showAuth();toast("Não foi possível restaurar a sessão.","error")}).finally(()=>{button.disabled=false})}
})();
