(() => {
    const $ = (s, root=document) => root.querySelector(s);
    const $$ = (s, root=document) => [...root.querySelectorAll(s)];
    const data = window.RHConnectData;
    let currentUser = null;
    let activeModule = "dashboard";
    let employees = [...data.employees];
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
        admin:Object.keys(modules).concat(["dashboard"])
    };

    function toast(message,type="success"){
        const el=document.createElement("div");el.className=`toast ${type}`;el.textContent=message;$("#toast-region").append(el);
        setTimeout(()=>el.remove(),3600);
    }
    function setTheme(theme){
        document.documentElement.dataset.theme=theme;
        localStorage.setItem("rhconnect-theme",theme);
    }
    function initTheme(){
        const saved=localStorage.getItem("rhconnect-theme");
        const preferred=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
        setTheme(saved||preferred);
    }
    function initials(name){return name.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase()}
    function showAuth(){ $("#auth-screen").classList.remove("hidden");$("#app-screen").classList.add("hidden"); }
    function showApp(){
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
            return `<div class="nav-section">${group.label}</div>${items.map(([id,icon,label])=>`<button class="nav-item ${activeModule===id?"active":""}" data-module="${id}"><span class="nav-icon">${icon}</span>${label}${id==="solicitacoes"?'<span class="nav-count">2</span>':""}</button>`).join("")}`;
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
        return `${`<div class="welcome-card"><div class="welcome-copy"><span class="eyebrow">SEU ESPAÇO, SUAS CONEXÕES</span><h2>${title}</h2><p>Que bom ter você por aqui. Veja o que está acontecendo hoje.</p></div><div class="welcome-date"><strong>${new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"2-digit",month:"long"}).format(new Date())}</strong>Um ótimo dia para fazer acontecer ✨</div></div>`}
      <div class="grid stats-grid">${admin?stat("Pessoas na organização",employees.length,"+ 2 neste mês","♙"):stat("Meu vale alimentação","R$ 680,00","Disponível neste mês","◇")}${admin?stat("Solicitações abertas","12","4 aguardando análise","✉",false):stat("Solicitações em andamento","2","Acompanhe suas solicitações","✉",false)}${admin?stat("Férias programadas","8","Próximos 30 dias","▦"):stat("Dias de férias disponíveis","24 dias","Consulte sua situação","▦")}${admin?stat("Comunicados ativos","6","2 publicados nesta semana","▧"):stat("Comunicados novos","3","Confira as novidades","▧")}</div>
      <div class="grid dashboard-columns"><div>
        <section class="panel"><div class="panel-header"><div><h3>Atividade recente</h3><p>As últimas atualizações do seu espaço</p></div><button class="link-button" data-module="comunicados">Ver tudo →</button></div><div class="activity-list">${activityList()}</div></section>
        <section class="panel"><div class="panel-header"><div><h3>Acesso rápido</h3><p>Encontre o que você precisa em poucos cliques</p></div></div><div class="grid quick-grid">${[["holerites","▤","Meus holerites","Documentos mensais"],["beneficios","◇","Benefícios","Informações do mês"],["ponto","◷","Ponto web","Minha jornada"],["solicitacoes","✉","Solicitações","Fale com o RH"]].map(x=>`<button class="quick-card" data-module="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small></button>`).join("")}</div></section>
      </div><div><section class="panel"><div class="panel-header"><div><h3>Mural de comunicados</h3><p>Informações importantes para você</p></div><button class="link-button" data-module="comunicados">Abrir mural →</button></div>${announcements()}</section>
      <section class="panel"><div class="panel-header"><div><h3>Seu espaço de bem-estar</h3><p>Cuidar de pessoas também é prioridade</p></div></div><div class="activity-item"><div class="activity-icon">🌱</div><div class="activity-copy"><b>Agenda psicológica</b><p>Consulte os horários disponíveis e reserve um momento para você.</p><button class="link-button" data-module="agenda">Conhecer agenda →</button></div></div></section></div></div>`;
    }
    function modulePage(id){
        const [icon,title,desc]=modules[id];
        const action=(id==="funcionarios"||id==="usuarios")?`<button class="small-button primary" data-action="new-employee">＋ Novo funcionário</button>`:"";
        if(id==="funcionarios"||id==="usuarios") return `${heading(title,desc,action)}<section class="panel"><div class="table-toolbar"><input class="table-search" id="employee-search" placeholder="Buscar funcionário..."><span class="muted-label">${employees.length} REGISTROS</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>FUNCIONÁRIO</th><th>DEPARTAMENTO</th><th>PERFIL</th><th>SITUAÇÃO</th><th>AÇÃO</th></tr></thead><tbody id="employee-rows">${employeeRows()}</tbody></table></div></section>`;
        if(id==="comunicados")return `${heading(title,desc)}<section class="panel">${announcements()}<button class="small-button" data-action="read-announcement">Marcar comunicados como lidos</button></section>`;
        const details={
            holerites:["Demonstrativos de pagamento","Outubro 2026","Setembro 2026","Agosto 2026"],
            beneficios:["Resumo do benefício","Saldo mensal","R$ 680,00","Próxima recarga: 01/12/2026"],
            ponto:["Resumo da jornada","Horas registradas","156h 40min","Banco de horas: +02h 15min"],
            solicitacoes:["Minhas solicitações","Ajuste de ponto · Em análise","Declaração de vínculo · Concluída","Dúvida sobre benefício · Respondida"],
            agenda:["Cuidar de você importa","Próximos horários","Terça-feira · 10:30","Quinta-feira · 14:00"],
            relatorios:["Visão consolidada","Colaboradores ativos",String(employees.filter(e=>e.status==="Ativo").length),"Solicitações em aberto: 12"]
        }[id]||["Informações","Conteúdo demonstrativo","Em breve",""];
        return `${heading(title,desc,`<button class="small-button" data-action="module-action">＋ Nova solicitação</button>`)}<div class="grid stats-grid">${stat(details[1],details[2],"Atualizado agora",icon)}${stat("Status","Disponível","Informação demonstrativa","✓")}${stat("Última atualização","Hoje","Dados de demonstração","◷")}${stat("Suporte","Equipe RH","Estamos à disposição","♡")}</div><section class="panel"><div class="panel-header"><div><h3>${details[0]}</h3><p>Esta área faz parte do protótipo navegável do RH CONNECT.</p></div><span class="status-pill">Demonstração</span></div><div class="activity-list">${details.slice(1).map((v,i)=>`<div class="activity-item"><div class="activity-icon">${["▤","◷","✦"][i]}</div><div class="activity-copy"><b>${v}</b><p>Informação ilustrativa para validar a experiência da tela.</p></div><button class="link-button" data-action="module-action">Consultar →</button></div>`).join("")}</div></section>`;
    }
    function employeeRows(list=employees){
        return list.map((e,i)=>`<tr><td><div class="person-cell"><span class="avatar avatar-${["blue","violet","green","orange"][i%4]}">${e.initials||initials(e.name)}</span><span><b>${e.name}</b><small>${e.email}</small></span></div></td><td>${e.department}</td><td>${e.role}</td><td><span class="status-pill ${e.status==="Pendente"?"pending":e.status==="Inativo"?"inactive":""}">${e.status}</span></td><td><button class="link-button" data-action="view-employee" data-email="${e.email}">Ver perfil</button></td></tr>`).join("");
    }
    function profilePage(){
        return `${heading("Meu perfil","Suas informações pessoais e profissionais.")}<div class="profile-hero"><span class="avatar avatar-${currentUser.color||"blue"}">${currentUser.initials||initials(currentUser.name)}</span><div><h2>${currentUser.name}</h2><p>${currentUser.title} · ${currentUser.department}</p></div><span class="status-pill">Ativo</span></div><section class="panel"><div class="panel-header"><h3>Informações profissionais</h3><button class="small-button" data-action="edit-profile">Solicitar alteração</button></div><div class="grid profile-fields">${[["Nome completo",currentUser.name],["E-mail",currentUser.email],["Cargo",currentUser.title],["Departamento",currentUser.department],["Nível de acesso",roleNames[currentUser.role]],["Situação","Ativo"]].map(x=>`<div class="info-field"><small>${x[0]}</small><b>${x[1]}</b></div>`).join("")}</div></section>`;
    }
    function navigate(id){
        const allowed=permissions[currentUser.role]||permissions.colaborador;
        if(id!=="perfil"&&!allowed.includes(id)){toast("Seu perfil não tem permissão para acessar esta área.","error");return}
        activeModule=id;renderNav();
        const labels={dashboard:"Meu painel",perfil:"Meu perfil",...Object.fromEntries(Object.entries(modules).map(([k,v])=>[k,v[1]]))};
        $("#breadcrumb-current").textContent=labels[id]||"Meu painel";
        $("#page-content").innerHTML=id==="dashboard"?dashboard():id==="perfil"?profilePage():modulePage(id);
        $("#page-content").classList.remove("page-content");void $("#page-content").offsetWidth;$("#page-content").classList.add("page-content");
        $("#sidebar").classList.remove("open");
    }
    function openModal(title,subtitle,body,submitText="Salvar",onSubmit=null){
        $("#modal-root").innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="icon-button" data-close-modal>×</button></div>${body}<div class="modal-actions"><button class="small-button" data-close-modal>Cancelar</button><button class="small-button primary" id="modal-submit">${submitText}</button></div></section></div>`;
        $$("[data-close-modal]").forEach(b=>b.addEventListener("click",closeModal));
        $(".modal-backdrop").addEventListener("click",e=>{if(e.target.classList.contains("modal-backdrop"))closeModal()});
        $("#modal-submit").addEventListener("click",()=>onSubmit&&onSubmit());
    }
    function closeModal(){$("#modal-root").innerHTML=""}
    function newEmployee(){
        openModal("Cadastrar funcionário","Preencha os dados para adicionar uma pessoa ao diretório.",`<form id="employee-form" class="modal-form"><label class="field-label wide">Nome completo<input name="name" placeholder="Nome do funcionário" required></label><label class="field-label wide">E-mail corporativo<input name="email" type="email" placeholder="nome@empresa.com.br" required></label><label class="field-label">Departamento<input name="department" placeholder="Ex.: Operações" required></label><label class="field-label">Cargo<input name="title" placeholder="Ex.: Analista" required></label><label class="field-label">Perfil de acesso<select name="role"><option>Colaborador</option><option>RH</option><option>Administrador</option></select></label><label class="field-label">Situação<select name="status"><option>Ativo</option><option>Pendente</option></select></label></form>`,"Cadastrar",()=>{
            const form=$("#employee-form");if(!form.reportValidity())return;const f=new FormData(form);const name=f.get("name").trim(),email=f.get("email").trim();
            if(employees.some(e=>e.email.toLowerCase()===email.toLowerCase())){toast("Já existe um funcionário com este e-mail.","error");return}
            employees.push({name,email,department:f.get("department"),title:f.get("title"),role:f.get("role"),status:f.get("status"),initials:initials(name)});
            closeModal();navigate(activeModule);toast("Funcionário cadastrado no protótipo.");
        });
    }
    function login(email,password){
        const account=data.accounts.find(a=>a.email.toLowerCase()===email.toLowerCase()&&a.password===password);
        if(!account){toast("E-mail ou senha inválidos. Confira os dados e tente novamente.","error");return}
        currentUser={...account};showApp();toast(`Bem-vindo(a), ${account.name.split(" ")[0]}!`);
    }
    function registerRequest(){
        openModal("Solicitar cadastro","Envie seus dados para uma futura validação da equipe de RH.",`<form id="request-form" class="modal-form"><label class="field-label wide">Nome completo<input name="name" required placeholder="Seu nome"></label><label class="field-label wide">E-mail corporativo<input name="email" type="email" required placeholder="voce@empresa.com.br"></label><label class="field-label wide">Departamento<input name="department" required placeholder="Seu departamento"></label></form>`,"Enviar solicitação",()=>{if(!$("#request-form").reportValidity())return;closeModal();toast("Solicitação de cadastro registrada nesta demonstração.")});
    }
    $("#login-form").addEventListener("submit",e=>{e.preventDefault();login($("#login-email").value.trim(),$("#login-password").value)});
    $$(".demo-account").forEach(b=>b.addEventListener("click",()=>{const a=data.accounts.find(x=>x.role===b.dataset.demo);$("#login-email").value=a.email;$("#login-password").value=a.password;login(a.email,a.password)}));
    $("#register-link").addEventListener("click",registerRequest);
    $("#forgot-link").addEventListener("click",()=>openModal("Recuperar senha","Informe seu e-mail corporativo para receber as instruções.",`<form id="recover-form"><label class="field-label">E-mail corporativo<input name="email" type="email" required placeholder="voce@empresa.com.br"></label></form>`,"Enviar instruções",()=>{if(!$("#recover-form").reportValidity())return;closeModal();toast("Se o e-mail estiver cadastrado, você receberá as instruções.")}));
    $$(".theme-toggle").forEach(b=>b.addEventListener("click",()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark")));
    document.addEventListener("input",e=>{if(e.target.id==="employee-search"){const q=e.target.value.toLowerCase();$("#employee-rows").innerHTML=employeeRows(employees.filter(x=>(x.name+x.email+x.department+x.role).toLowerCase().includes(q)))}});
    document.addEventListener("click",e=>{
        const nav=e.target.closest("[data-module]");if(nav&&currentUser){navigate(nav.dataset.module);return}
        const action=e.target.closest("[data-action]");if(!action)return;
        if(action.dataset.action==="new-employee")newEmployee();
        if(action.dataset.action==="module-action")toast("Ação demonstrativa registrada.");
        if(action.dataset.action==="read-announcement")toast("Comunicados marcados como lidos.");
        if(action.dataset.action==="edit-profile")toast("Solicitação de alteração enviada ao RH.");
        if(action.dataset.action==="view-employee"){const emp=employees.find(x=>x.email===action.dataset.email);if(emp)openModal(emp.name,"Perfil do funcionário",`<div class="grid profile-fields">${[["E-mail",emp.email],["Cargo",emp.title],["Departamento",emp.department],["Perfil",emp.role],["Situação",emp.status]].map(x=>`<div class="info-field"><small>${x[0]}</small><b>${x[1]}</b></div>`).join("")}</div>`,"Fechar",closeModal)}
    });
    $("#mobile-menu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
    $("#profile-menu").addEventListener("click",()=>navigate("perfil"));
    $("#notifications-button").addEventListener("click",()=>toast("Você está em dia com suas notificações."));
    $("#global-search").addEventListener("keydown",e=>{if(e.key==="Enter"){const q=e.target.value.toLowerCase();const match=Object.entries(modules).find(([id,m])=>m[1].toLowerCase().includes(q));if(match)navigate(match[0]);else if("painel dashboard".includes(q))navigate("dashboard");else toast("Nenhum módulo encontrado para esta busca.","error")}});
    initTheme();
})();