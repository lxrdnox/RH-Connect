
(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const format = n => new Intl.NumberFormat('pt-BR').format(n);
  const percent = (n,total) => total ? Math.round(n/total*100) : 0;
  const icon = name => window.RHDesign.icon(name);
  const colors = ['#008F8C','#174D63','#69AAA5','#C8873A','#718894'];
  function summarize(rows,department=''){
    const filtered = rows.filter(row => !department || row.department===department);
    const groups = new Map();
    for(const row of filtered){const key=row.department||'Não informado';groups.set(key,(groups.get(key)||0)+1)}
    const active=filtered.filter(row=>row.status==='Ativo').length;
    const pending=filtered.filter(row=>row.status==='Pendente').length;
    return {total:filtered.length,active,pending,other:filtered.length-active-pending,groups:[...groups].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'pt-BR'))};
  }
  function metric(label,value,detail,glyph){
    return '<article class="ed-metric"><div class="ed-metric-top"><span>'+label+'</span><span class="ed-icon">'+icon(glyph)+'</span></div><strong>'+escape(value)+'</strong><small>'+escape(detail)+'</small></article>';
  }
  function managementContent(rows,department){
    const s=summarize(rows,department);
    const p=percent(s.active,s.total),q=percent(s.active+s.pending,s.total);
    return '<div class="ed-kpis">'+metric('Colaboradores',format(s.total),'Registros no filtro selecionado','people')+metric('Ativos',format(s.active),percent(s.active,s.total)+'% do total','check')+metric('Pendentes',format(s.pending),'Aguardando regularização cadastral','clock')+metric('Departamentos',format(s.groups.length),'Áreas com registros','chart')+'</div>'+
    '<div class="ed-chart-grid"><section class="panel ed-chart"><div class="panel-header"><div><h3>Distribuição por departamento</h3><p>Quantidade de colaboradores cadastrados</p></div>'+icon('chart')+'</div><div class="ed-bars">'+(s.groups.length?s.groups.map(([label,count],i)=>'<div class="ed-bar-row"><div><span>'+escape(label)+'</span><strong>'+format(count)+'</strong></div><div class="ed-bar-track" role="img" aria-label="'+escape(label)+': '+count+' colaboradores"><span style="width:'+percent(count,s.total)+'%;background:'+colors[i%colors.length]+'"></span></div></div>').join(''):'<p class="ed-empty">Nenhum registro no filtro selecionado.</p>')+'</div></section>'+
    '<section class="panel ed-chart"><div class="panel-header"><div><h3>Situação cadastral</h3><p>Composição dos registros atuais</p></div>'+icon('people')+'</div><div class="ed-donut-wrap"><div class="ed-donut" role="img" aria-label="'+(s.total?p+'% ativos, '+percent(s.pending,s.total)+'% pendentes, '+percent(s.other,s.total)+'% outros':'Sem registros')+'" style="--ed-active:'+p+'%;--ed-pending:'+q+'%;'+(s.total?'':'background:var(--surface-3)')+'"><div><strong>'+p+'%</strong><small>ativos</small></div></div><div class="ed-legend"><div><i class="ed-dot active"></i><span>Ativos</span><b>'+format(s.active)+'</b></div><div><i class="ed-dot pending"></i><span>Pendentes</span><b>'+format(s.pending)+'</b></div><div><i class="ed-dot other"></i><span>Outros</span><b>'+format(s.other)+'</b></div></div></div></section></div>';
  }
  function management(rows,department=''){
    const departments=[...new Set(rows.map(r=>r.department).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    return '<section class="ed-section" aria-label="Indicadores de gestão"><div class="ed-section-head"><div><span class="eyebrow">PEOPLE ANALYTICS</span><h2>Visão da organização</h2><p>Indicadores calculados a partir do diretório corporativo.</p></div><div class="ed-controls"><label for="ed-department">Departamento</label><select id="ed-department"><option value="">Todos os departamentos</option>'+departments.map(d=>'<option value="'+escape(d)+'"'+(d===department?' selected':'')+'>'+escape(d)+'</option>').join('')+'</select><button class="small-button" data-module="funcionarios">Abrir diretório</button></div></div><div id="ed-management-content" aria-live="polite">'+managementContent(rows,department)+'</div><p class="ed-note">Indicadores calculados a partir dos registros disponíveis.</p></section>';
  }
  function employee(data={},email=""){
    const benefits=(data.beneficios||[]).filter(x=>x.employeeEmail===email&&x.status==="Creditado");
    const benefitTotal=benefits.reduce((sum,x)=>sum+Number(x.amount||0),0);
    const openRequests=(data.solicitacoes||[]).filter(x=>x.employeeEmail===email&&x.status!=="Concluída").length;
    const appointments=(data.agenda||[]).filter(x=>x.employeeEmail===email&&x.status==="Reservado").length;
    const notices=(data.comunicados||[]).length;
    const currency=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(benefitTotal);
    return '<section class="ed-section" aria-label="Resumo do colaborador"><div class="ed-section-head"><div><span class="eyebrow">MEU ESPAÇO</span><h2>Seu dia a dia</h2><p>Consulte seus benefícios, documentos e atendimento.</p></div></div><div class="ed-kpis">'+metric("Vale alimentação",currency,"Créditos registrados no período","wallet")+metric("Solicitações",format(openRequests), "Chamados em aberto ou em andamento","mail")+metric("Agendamentos",format(appointments),"Horários reservados","calendar")+metric("Comunicados",format(notices),"Publicações no mural","news")+'</div><div class="ed-personal"><section class="panel ed-chart"><div class="panel-header"><div><h3>Minha jornada</h3><p>Atalhos para os seus serviços</p></div></div><div class="ed-service-list">'+[['holerites','document','Holerites','Consulte seus demonstrativos'],['beneficios','wallet','Benefícios','Acompanhe o vale alimentação'],['ponto','clock','Ponto web','Consulte os registros de jornada'],['solicitacoes','mail','Solicitações','Entre em contato com o RH']].map(([id,glyph,title,desc])=>'<button class="ed-service" data-module="'+id+'"><span class="ed-icon">'+icon(glyph)+'</span><span><b>'+title+'</b><small>'+desc+'</small></span>'+icon('arrow')+'</button>').join('')+'</div></section><section class="panel ed-chart ed-wellbeing"><div class="ed-icon">'+icon('heart')+'</div><h3>Cuidar de você também é trabalho.</h3><p>Encontre os canais de apoio e iniciativas de bem-estar disponíveis no portal.</p><button class="small-button primary" data-module="agenda">Conhecer agenda</button></section></div></section>';
  }
  function bind(root,rows,onChange){
    const select=root.querySelector('#ed-department');
    if(!select)return;
    select.addEventListener('change',()=>{root.querySelector('#ed-management-content').innerHTML=managementContent(rows,select.value);onChange(select.value);});
  }
  window.RHEnterprise={summarize,management,employee,bind};
})();