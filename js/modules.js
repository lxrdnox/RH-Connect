(() => {
  "use strict";
  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const money = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(n)||0);
  const date = s => s ? new Intl.DateTimeFormat("pt-BR",{dateStyle:"medium"}).format(new Date(s+"T12:00:00")) : "—";
  const today = () => {const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
  const timeNow = () => new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());
  const all = name => window.RHStore.readNow(name);
  const isHr = user => ["admin","rh"].includes(user.role);
  const banner = '<div class="rhm-demo-note"><span>i</span><span><b>Ambiente de apresentação</b> · Dados ilustrativos salvos neste navegador. Não representam registros oficiais da empresa.</span></div>';
  const panel = (title,subtitle,body,extra="") => '<section class="panel rhm-panel"><div class="panel-header"><div><h3>'+title+'</h3><p>'+subtitle+'</p></div>'+extra+'</div>'+body+'</section>';
  const empty = (title,copy) => '<div class="rhm-empty"><span>✓</span><b>'+title+'</b><p>'+copy+'</p></div>';
  const badge = status => '<span class="status-pill '+(status==="Concluída"||status==="Creditado"||status==="Disponível"||status==="Ativo"?"":status==="Em andamento"||status==="Reservado"?"pending":"inactive")+'">'+esc(status)+'</span>';
  const head = (title,description,actions) => '<div class="page-heading"><div><span class="eyebrow">RH CONNECT / '+(window.RHAppRole||"ESPAÇO")+'</span><h1>'+title+'</h1><p>'+description+'</p></div><div class="page-actions">'+(actions||"")+'</div></div>';
  const action = (name,label,attrs="") => '<button type="button" class="small-button '+(name.startsWith("new-")?"primary":"")+'" data-rhm-action="'+name+'" '+attrs+'>'+label+'</button>';
  const canCreate = user => isHr(user);
  function holerites(user,rows,employees){
    const mine=rows.filter(r=>user.role!=="colaborador"||r.employeeEmail===user.email);
    const add=canCreate(user)?action("new-holerite","＋ Novo holerite"):"";
    const body=mine.length?'<div class="table-wrap"><table class="data-table"><thead><tr><th>Colaborador</th><th>Referência</th><th>Salário bruto</th><th>Descontos</th><th>Líquido</th><th>Documento</th></tr></thead><tbody>'+mine.map(r=>'<tr><td><b>'+esc(r.employeeName)+'</b><br><small>'+esc(r.employeeEmail)+'</small></td><td>'+esc(r.period)+'</td><td>'+money(r.gross)+'</td><td>'+money(r.discounts)+'</td><td><b>'+money(r.net)+'</b></td><td>'+action("print-holerite","Visualizar / PDF",'data-id="'+esc(r.id)+'"')+'</td></tr>').join("")+'</tbody></table></div>':empty("Nenhum demonstrativo cadastrado","A equipe de RH poderá cadastrar os demonstrativos para esta apresentação.");
    return head("Meus holerites","Consulte seus demonstrativos mensais e visualize uma versão para impressão.",add)+banner+panel("Demonstrativos disponíveis","Valores fictícios para demonstração do fluxo.",body);
  }
  function benefits(user,rows){
    const mine=rows.filter(r=>user.role!=="colaborador"||r.employeeEmail===user.email);
    const sum=mine.filter(r=>r.status==="Creditado").reduce((a,r)=>a+Number(r.amount||0),0);
    const add=canCreate(user)?action("new-benefit","＋ Lançar benefício"):"";
    const cards=mine.map(r=>'<article class="rhm-benefit-card"><div class="rhm-benefit-icon">◇</div><span class="eyebrow">'+esc(r.period)+'</span><h3>'+esc(r.type)+'</h3><strong>'+money(r.amount)+'</strong><div class="rhm-row">'+badge(r.status)+'<small>Crédito: '+date(r.creditDate)+'</small></div><small class="rhm-person">'+esc(r.employeeName)+'</small></article>').join("");
    return head("Vale alimentação","Acompanhe os valores e os créditos registrados para o benefício.",add)+banner+'<div class="rhm-summary-grid"><article class="rhm-summary"><span>Créditos listados</span><b>'+money(sum)+'</b><small>Somatório dos registros creditados</small></article><article class="rhm-summary"><span>Lançamentos</span><b>'+mine.length+'</b><small>Registros disponíveis nesta visualização</small></article></div>'+panel("Histórico de benefícios","Lançamentos ilustrativos por competência.",cards?'<div class="rhm-benefit-grid">'+cards+'</div>':empty("Nenhum benefício cadastrado","A equipe de RH poderá registrar os créditos."));
  }
  function points(user,rows){
    const mine=rows.filter(r=>user.role!=="colaborador"||r.employeeEmail===user.email).sort((a,b)=>b.date.localeCompare(a.date));
    const current=mine.find(r=>r.date===today()&&r.employeeEmail===user.email);
    const fields=[["entry","Entrada"],["breakStart","Início do intervalo"],["breakEnd","Retorno do intervalo"],["exit","Saída"]];
    let next=null;
    if(!current||!current.entry)next="entry";else if(!current.breakStart)next="breakStart";else if(!current.breakEnd)next="breakEnd";else if(!current.exit)next="exit";
    const labels={entry:"Registrar entrada",breakStart:"Iniciar intervalo",breakEnd:"Registrar retorno",exit:"Registrar saída"};
    const controls=user.role==="colaborador"?'<div class="rhm-clock"><div><span class="eyebrow">REGISTRO DE HOJE</span><strong>'+timeNow()+'</strong><small>'+date(today())+'</small></div><div><p>'+(next?"Próxima etapa: "+labels[next]:"Jornada de hoje concluída")+'</p>'+(next?action("clock",labels[next],'data-field="'+next+'"'):'<span class="status-pill">Jornada concluída</span>')+'</div></div>':'';
    const body=mine.length?'<div class="table-wrap"><table class="data-table"><thead><tr><th>Colaborador</th><th>Data</th><th>Entrada</th><th>Intervalo</th><th>Retorno</th><th>Saída</th><th>Total</th></tr></thead><tbody>'+mine.map(r=>{let total="Em andamento";if(r.entry&&r.exit){const mins=(t)=>{const p=t.split(":").map(Number);return p[0]*60+p[1]};total=Math.max(0,mins(r.exit)-mins(r.entry)-(r.breakStart&&r.breakEnd?mins(r.breakEnd)-mins(r.breakStart):0));total=Math.floor(total/60)+"h "+String(total%60).padStart(2,"0")+"min"}return '<tr><td><b>'+esc(r.employeeName)+'</b></td><td>'+date(r.date)+'</td><td>'+esc(r.entry||"—")+'</td><td>'+esc(r.breakStart||"—")+'</td><td>'+esc(r.breakEnd||"—")+'</td><td>'+esc(r.exit||"—")+'</td><td>'+esc(total)+'</td></tr>'}).join("")+'</tbody></table></div>':empty("Nenhum registro encontrado","Os registros aparecerão aqui quando forem lançados.");
    return head("Ponto web","Acompanhe os horários e os registros de jornada.",'')+banner+controls+panel("Espelho de ponto","Registros demonstrativos. Não há integração com relógio de ponto.",body);
  }
  function requests(user,rows){
    const mine=rows.filter(r=>user.role!=="colaborador"||r.employeeEmail===user.email).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    const add=user.role==="colaborador"?action("new-request","＋ Nova solicitação"):"";
    const body=mine.length?'<div class="rhm-request-list">'+mine.map(r=>'<article class="rhm-request"><div class="rhm-request-top"><span class="eyebrow">'+esc(r.category)+' · '+esc(r.id)+'</span>'+badge(r.status)+'</div><h3>'+esc(r.subject)+'</h3><p>'+esc(r.description)+'</p><div class="rhm-row"><small>'+esc(r.employeeName)+' · '+date(r.createdAt)+'</small>'+(isHr(user)?'<label class="rhm-status">Atualizar status <select data-rhm-action="request-status" data-id="'+esc(r.id)+'"><option '+(r.status==="Aberta"?"selected":"")+' >Aberta</option><option '+(r.status==="Em andamento"?"selected":"")+' >Em andamento</option><option '+(r.status==="Concluída"?"selected":"")+' >Concluída</option></select></label>':'')+'</div></article>').join("")+'</div>':empty("Nenhuma solicitação encontrada","Abra uma solicitação para iniciar o atendimento.");
    return head("Central de solicitações","Abra chamados e acompanhe o andamento das suas demandas.",add)+banner+panel("Acompanhamento de chamados","Histórico de atendimento do portal.",body);
  }
  function agenda(user,rows){
    const mine=rows.filter(r=>r.status==="Disponível"||r.employeeEmail===user.email||isHr(user)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    const add=canCreate(user)?action("new-slot","＋ Adicionar horário"):"";
    const body=mine.length?'<div class="rhm-agenda-grid">'+mine.map(r=>'<article class="rhm-slot"><div class="rhm-slot-date"><b>'+new Intl.DateTimeFormat("pt-BR",{day:"2-digit"}).format(new Date(r.date+"T12:00:00"))+'</b><small>'+new Intl.DateTimeFormat("pt-BR",{month:"short"}).format(new Date(r.date+"T12:00:00"))+'</small></div><div class="rhm-slot-info"><b>'+esc(r.time)+' · '+esc(r.professional)+'</b><p>'+esc(r.type)+'</p><small>'+(r.employeeName?"Reservado para "+esc(r.employeeName):"Horário disponível")+'</small></div><div class="rhm-slot-action">'+(r.status==="Disponível"&&user.role==="colaborador"?action("book-slot","Reservar",'data-id="'+esc(r.id)+'"'):r.employeeEmail===user.email&&user.role==="colaborador"?action("cancel-slot","Cancelar",'data-id="'+esc(r.id)+'"'):badge(r.status))+'</div></article>').join("")+'</div>':empty("Nenhum horário disponível","A equipe de RH poderá adicionar novos horários à agenda.");
    return head("Agenda psicológica","Um espaço de acolhimento, escuta e cuidado com o bem-estar.",add)+banner+panel("Horários de acolhimento","Agendamentos fictícios para demonstrar a experiência.",body);
  }
  function announcements(user,rows){
    const sorted=[...rows].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)||b.date.localeCompare(a.date));
    const add=canCreate(user)?action("new-announcement","＋ Novo comunicado"):"";
    const body=sorted.length?'<div class="rhm-news-grid">'+sorted.map(r=>'<article class="rhm-news"><div class="rhm-news-top"><span class="eyebrow">'+esc(r.category)+'</span>'+(r.pinned?'<span class="status-pill">Destaque</span>':'')+'</div><h3>'+esc(r.title)+'</h3><p>'+esc(r.body)+'</p><div class="rhm-row"><small>'+esc(r.author)+' · '+date(r.date)+'</small></div></article>').join("")+'</div>':empty("Nenhum comunicado publicado","A equipe de RH poderá publicar atualizações neste mural.");
    return head("Mural de comunicados","Informações, novidades e orientações importantes para todos.",add)+banner+panel("Comunicados da empresa","Atualizações internas de exemplo.",body);
  }
  function users(user){
    if(user.role!=="admin")return head("Usuários e permissões","Área restrita à administração.")+banner+empty("Acesso restrito","Somente o perfil administrador pode consultar os acessos.");
    const rows=window.RHStore.demoAccounts||[];
    const accounts=rows.length?rows: [{name:"Ana Martins",email:"colaborador@rhconnect.com",role:"colaborador",title:"Analista de Operações"},{name:"Mariana Costa",email:"rh@rhconnect.com",role:"admin",title:"Administradora de RH"}];
    return head("Usuários e permissões","Consulte os perfis de acesso disponíveis no ambiente de apresentação.")+banner+panel("Contas de apresentação","Os perfis abaixo são contas locais de demonstração.",'<div class="table-wrap"><table class="data-table"><thead><tr><th>Usuário</th><th>E-mail</th><th>Função</th><th>Nível de acesso</th></tr></thead><tbody>'+accounts.map(a=>'<tr><td><b>'+esc(a.name)+'</b></td><td>'+esc(a.email)+'</td><td>'+esc(a.title)+'</td><td>'+badge(a.role==="admin"?"Administrador":"Colaborador")+'</td></tr>').join("")+'</tbody></table></div><p class="rhm-disclaimer">A criação e a alteração de contas reais dependem da configuração do Firebase Authentication e das regras de segurança. Esta tela não altera credenciais.</p>');
  }
  function reports(user,employees,data){
    const requests=data.solicitacoes||[], hol=data.holerites||[], ben=data.beneficios||[], notices=data.comunicados||[];
    return head("Relatórios e indicadores","Resumo operacional dos dados disponíveis no ambiente de apresentação.")+banner+'<div class="rhm-summary-grid"><article class="rhm-summary"><span>Colaboradores cadastrados</span><b>'+employees.length+'</b><small>Diretório atual</small></article><article class="rhm-summary"><span>Solicitações abertas</span><b>'+requests.filter(x=>x.status!=="Concluída").length+'</b><small>Chamados em atendimento</small></article><article class="rhm-summary"><span>Holerites registrados</span><b>'+hol.length+'</b><small>Demonstrativos ilustrativos</small></article><article class="rhm-summary"><span>Benefícios lançados</span><b>'+ben.length+'</b><small>Registros de vale alimentação</small></article></div>'+panel("Visão geral","Indicadores calculados a partir dos dados locais.",'<div class="rhm-report-row"><span>Comunicados publicados</span><b>'+notices.length+'</b></div><div class="rhm-report-row"><span>Horários de acolhimento</span><b>'+(data.agenda||[]).length+'</b></div><div class="rhm-report-row"><span>Registros de ponto</span><b>'+(data.ponto||[]).length+'</b></div>');
  }
  function render(id,user,employees,data){
    const rows=data||{};
    if(id==="holerites")return holerites(user,rows.holerites||[],employees);
    if(id==="beneficios")return benefits(user,rows.beneficios||[]);
    if(id==="ponto")return points(user,rows.ponto||[]);
    if(id==="solicitacoes")return requests(user,rows.solicitacoes||[]);
    if(id==="agenda")return agenda(user,rows.agenda||[]);
    if(id==="comunicados")return announcements(user,rows.comunicados||[]);
    if(id==="usuarios")return users(user);
    if(id==="relatorios")return reports(user,employees,rows);
    return "";
  }
  function notify(message,type){
    const root=document.querySelector("#toast-region");if(!root)return;
    const el=document.createElement("div");el.className="toast "+(type||"success");el.setAttribute("role",type==="error"?"alert":"status");el.textContent=message;root.append(el);
    setTimeout(()=>el.remove(),3200);
  }
  function openForm(title,description,fields,onSave){
    const root=document.querySelector("#modal-root");
    const controls=fields.map(f=>'<label class="field-label">'+f.label+(f.type==="select"?'<select name="'+f.name+'" '+(f.required===false?"":"required")+'>'+f.options.map(o=>'<option value="'+esc(o.value)+'">'+esc(o.label)+'</option>').join("")+'</select>':f.type==="textarea"?'<textarea name="'+f.name+'" rows="4" maxlength="1200" '+(f.required===false?"":"required")+'></textarea>':'<input name="'+f.name+'" type="'+(f.type||"text")+'" '+(f.step?'step="'+f.step+'"':'')+' '+(f.min!==undefined?'min="'+f.min+'"':'')+' '+(f.required===false?"":"required")+' '+(f.maxlength?'maxlength="'+f.maxlength+'"':'')+'></label>').join("");
    root.innerHTML='<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div><h2>'+title+'</h2><p>'+description+'</p></div><button class="icon-button" type="button" data-rhm-close>×</button></div><form id="rhm-form" class="modal-form">'+controls+'</form><div class="modal-actions"><button class="small-button" type="button" data-rhm-close>Cancelar</button><button class="small-button primary" type="submit" form="rhm-form">Salvar</button></div></section></div>';
    document.body.classList.add("modal-open");
    const close=()=>{root.innerHTML="";document.body.classList.remove("modal-open")};
    root.querySelectorAll("[data-rhm-close]").forEach(b=>b.addEventListener("click",close));
    root.querySelector(".modal-backdrop").addEventListener("click",e=>{if(e.target.classList.contains("modal-backdrop"))close()});
    root.querySelector("#rhm-form").addEventListener("submit",async e=>{e.preventDefault();const button=root.querySelector('[type="submit"]');if(button.disabled)return;const form=new FormData(e.currentTarget),record=Object.fromEntries(form.entries());if(!e.currentTarget.reportValidity())return;button.disabled=true;try{await onSave(record);close();notify("Informações salvas com sucesso.");window.dispatchEvent(new CustomEvent("rhmodules:refresh"))}catch(error){console.error(error);notify(error.message||"Não foi possível salvar.","error");button.disabled=false}});
    const first=root.querySelector("input,select,textarea");if(first)first.focus();
  }
  function printSlip(record){
    const win=window.open("","_blank","width=850,height=700");if(!win){notify("Permita pop-ups para visualizar o demonstrativo.","error");return}
    const html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Demonstrativo - RH CONNECT</title><style>body{font:14px Arial,sans-serif;color:#17334b;margin:40px}header{border-bottom:3px solid #008f8c;padding-bottom:18px;margin-bottom:24px}h1{font-size:24px;margin:0 0 6px}small{color:#617783}.notice{background:#fff4dc;padding:12px;margin:22px 0;border:1px solid #e6c98b}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:12px;border-bottom:1px solid #dce7e9}td:last-child{text-align:right}.total{font-size:20px;font-weight:bold;color:#007774}footer{margin-top:50px;color:#617783;font-size:11px}@media print{button{display:none}}</style><body><header><h1>RH CONNECT</h1><small>Demonstrativo de pagamento · '+esc(record.period)+'</small></header><h2>'+esc(record.employeeName)+'</h2><small>'+esc(record.employeeEmail)+'</small><div class="notice"><b>DOCUMENTO FICTÍCIO PARA APRESENTAÇÃO</b><br>Este demonstrativo contém dados ilustrativos e não possui validade legal, fiscal ou trabalhista.</div><table><tr><td>Salário bruto</td><td>'+money(record.gross)+'</td></tr><tr><td>Descontos</td><td>− '+money(record.discounts)+'</td></tr><tr><td><b>Valor líquido</b></td><td class="total">'+money(record.net)+'</td></tr></table><footer>RH CONNECT · People Experience · Documento de demonstração</footer><script>window.onload=()=>window.print()<\/script></body></html>';
    win.document.open();win.document.write(html);win.document.close();
  }
  function bind(root,user,employees){
    const refresh=()=>window.dispatchEvent(new CustomEvent("rhmodules:refresh"));
    root.addEventListener("click",async e=>{
      const b=e.target.closest("[data-rhm-action]");if(!b)return;
      const kind=b.dataset.rhmAction,id=b.dataset.id;
      try{
        if(kind==="new-holerite"&&isHr(user)){
          const opts=employees.map(x=>({value:x.email,label:x.name+" · "+x.email}));
          openForm("Cadastrar holerite","Informe os valores do demonstrativo fictício.",[{name:"employeeEmail",label:"Colaborador",type:"select",options:opts},{name:"period",label:"Competência",maxlength:40},{name:"gross",label:"Salário bruto (R$)",type:"number",step:"0.01",min:0},{name:"discounts",label:"Descontos (R$)",type:"number",step:"0.01",min:0}],async r=>{const emp=employees.find(x=>x.email===r.employeeEmail);if(!emp)throw Error("Selecione um colaborador válido.");const gross=Number(r.gross),discounts=Number(r.discounts);if(discounts>gross)throw Error("Descontos não podem superar o valor bruto.");await window.RHStore.create("holerites",{employeeEmail:emp.email,employeeName:emp.name,period:r.period,gross,discounts,net:gross-discounts,status:"Disponível",createdAt:today()})});
        }else if(kind==="new-benefit"&&isHr(user)){
          openForm("Lançar vale alimentação","Crie um registro ilustrativo para um colaborador.",[{name:"employeeEmail",label:"Colaborador",type:"select",options:employees.map(x=>({value:x.email,label:x.name+" · "+x.email}))},{name:"period",label:"Competência",maxlength:40},{name:"amount",label:"Valor do benefício (R$)",type:"number",step:"0.01",min:0},{name:"creditDate",label:"Data do crédito",type:"date"},{name:"status",label:"Situação",type:"select",options:["Creditado","Programado"].map(x=>({value:x,label:x}))}],async r=>{const emp=employees.find(x=>x.email===r.employeeEmail);if(!emp)throw Error("Selecione um colaborador.");await window.RHStore.create("beneficios",{employeeEmail:emp.email,employeeName:emp.name,period:r.period,type:"Vale alimentação",amount:Number(r.amount),creditDate:r.creditDate,status:r.status})});
        }else if(kind==="print-holerite"){const record=all("holerites").find(x=>x.id===id);if(record&&(user.role!=="colaborador"||record.employeeEmail===user.email))printSlip(record)}
        else if(kind==="clock"&&user.role==="colaborador"){
          const field=b.dataset.field,sequence=["entry","breakStart","breakEnd","exit"],rows=all("ponto"),existing=rows.find(x=>x.employeeEmail===user.email&&x.date===today());
          const next=existing?sequence.find(x=>!existing[x]):"entry";if(next!==field)throw Error("Registre os horários na ordem indicada.");
          await window.RHStore.markClock(user.email,today(),field,timeNow());notify("Horário registrado: "+timeNow());refresh();
        }else if(kind==="new-request"&&user.role==="colaborador"){
          openForm("Nova solicitação","Descreva sua necessidade para que o RH possa ajudar.",[{name:"category",label:"Categoria",type:"select",options:["Benefícios","Departamento pessoal","Documentos","Ponto e jornada","Outros"].map(x=>({value:x,label:x}))},{name:"subject",label:"Assunto",maxlength:120},{name:"description",label:"Descrição",type:"textarea"}],async r=>{await window.RHStore.create("solicitacoes",{employeeEmail:user.email,employeeName:user.name,category:r.category,subject:r.subject,description:r.description,status:"Aberta",createdAt:today(),updatedAt:today()})});
        }else if(kind==="new-slot"&&isHr(user)){
          openForm("Adicionar horário","Disponibilize um novo horário para acolhimento.",[{name:"date",label:"Data",type:"date"},{name:"time",label:"Horário",type:"time"},{name:"professional",label:"Profissional responsável",maxlength:100},{name:"type",label:"Tipo de atendimento",maxlength:100}],async r=>{await window.RHStore.create("agenda",{...r,status:"Disponível",employeeEmail:""})});
        }else if(kind==="book-slot"&&user.role==="colaborador"){
          const slot=all("agenda").find(x=>x.id===id);if(!slot||slot.status!=="Disponível")throw Error("Este horário não está mais disponível.");
          await window.RHStore.update("agenda",id,{status:"Reservado",employeeEmail:user.email,employeeName:user.name});notify("Horário reservado com sucesso.");refresh();
        }else if(kind==="cancel-slot"&&user.role==="colaborador"){
          const slot=all("agenda").find(x=>x.id===id);if(slot?.employeeEmail!==user.email)throw Error("Este agendamento não pertence à sua conta.");
          await window.RHStore.update("agenda",id,{status:"Disponível",employeeEmail:"",employeeName:""});notify("Reserva cancelada.");refresh();
        }else if(kind==="new-announcement"&&isHr(user)){
          openForm("Publicar comunicado","Compartilhe uma informação com a equipe.",[{name:"title",label:"Título",maxlength:140},{name:"category",label:"Categoria",type:"select",options:["Pessoas","Departamento pessoal","Saúde e bem-estar","Comunicados gerais"].map(x=>({value:x,label:x}))},{name:"body",label:"Mensagem",type:"textarea"},{name:"pinned",label:"Destacar no mural",type:"select",options:[{value:"false",label:"Não"},{value:"true",label:"Sim"}]}],async r=>{await window.RHStore.create("comunicados",{...r,pinned:r.pinned==="true",date:today(),author:user.name})});
        }
      }catch(error){console.error(error);notify(error.message||"Não foi possível concluir a ação.","error")}
    });
    root.addEventListener("change",async e=>{
      const select=e.target.closest('[data-rhm-action="request-status"]');if(!select||!isHr(user))return;
      try{await window.RHStore.update("solicitacoes",select.dataset.id,{status:select.value,updatedAt:today()});notify("Status da solicitação atualizado.");refresh()}catch(error){notify(error.message||"Falha ao atualizar status.","error")}
    });
  }
  window.RHModules={render,bind};
})();