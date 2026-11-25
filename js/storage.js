(() => {
  "use strict";
  const keys = {
    employees: "rhconnect-apresentacao-employees",
    session: "rhconnect-apresentacao-session",
    remembered: "rhconnect-apresentacao-remembered"
  };
  const today = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
  };
  const shiftDate = (days) => {
    const d = new Date(); d.setDate(d.getDate()+days);
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
  };
  const accounts = [
    {uid:"apresentacao-colaborador",email:"colaborador@rhconnect.com",password:"123456",name:"Ana Martins",role:"colaborador",title:"Analista de Operações",department:"Operações",color:"blue"},
    {uid:"apresentacao-admin",email:"rh@rhconnect.com",password:"123456",name:"Mariana Costa",role:"admin",title:"Administradora de RH",department:"Recursos Humanos",color:"green"}
  ];
  const demoEmployees = [
    {name:"Ana Martins",email:"colaborador@rhconnect.com",department:"Operações",title:"Analista de Operações",role:"Colaborador",status:"Ativo",initials:"AM"},
    {name:"Mariana Costa",email:"rh@rhconnect.com",department:"Recursos Humanos",title:"Administradora de RH",role:"Administrador",status:"Ativo",initials:"MC"},
    {name:"Lucas Almeida",email:"lucas.almeida@rhconnect.com",department:"Tecnologia",title:"Desenvolvedor",role:"Colaborador",status:"Ativo",initials:"LA"},
    {name:"Beatriz Souza",email:"beatriz.souza@rhconnect.com",department:"Financeiro",title:"Assistente Financeira",role:"Colaborador",status:"Ativo",initials:"BS"},
    {name:"Gabriel Lima",email:"gabriel.lima@rhconnect.com",department:"Operações",title:"Supervisor",role:"Colaborador",status:"Pendente",initials:"GL"},
    {name:"Camila Rocha",email:"camila.rocha@rhconnect.com",department:"Comercial",title:"Executiva de Contas",role:"Colaborador",status:"Ativo",initials:"CR"}
  ];
  const seeds = {
    holerites: [
      {id:"hol-2026-11-ana",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",period:"Novembro/2026",gross:4200,discounts:920,net:3280,status:"Disponível",createdAt:today()},
      {id:"hol-2026-10-ana",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",period:"Outubro/2026",gross:4200,discounts:920,net:3280,status:"Disponível",createdAt:shiftDate(-30)},
      {id:"hol-2026-11-lucas",employeeEmail:"lucas.almeida@rhconnect.com",employeeName:"Lucas Almeida",period:"Novembro/2026",gross:5600,discounts:1210,net:4390,status:"Disponível",createdAt:today()}
    ],
    beneficios: [
      {id:"benef-ana-2026-11",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",period:"Novembro/2026",type:"Vale alimentação",amount:650,status:"Creditado",creditDate:today()},
      {id:"benef-lucas-2026-11",employeeEmail:"lucas.almeida@rhconnect.com",employeeName:"Lucas Almeida",period:"Novembro/2026",type:"Vale alimentação",amount:650,status:"Creditado",creditDate:today()},
      {id:"benef-beatriz-2026-11",employeeEmail:"beatriz.souza@rhconnect.com",employeeName:"Beatriz Souza",period:"Novembro/2026",type:"Vale alimentação",amount:650,status:"Creditado",creditDate:today()}
    ],
    ponto: [
      {id:"ponto-ana-today",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",date:today(),entry:"08:02",breakStart:"12:01",breakEnd:"13:02",exit:"",note:"Registro ilustrativo de apresentação"},
      {id:"ponto-ana-yesterday",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",date:shiftDate(-1),entry:"08:00",breakStart:"12:00",breakEnd:"13:00",exit:"17:04",note:""},
      {id:"ponto-ana-two-days",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",date:shiftDate(-2),entry:"08:06",breakStart:"12:03",breakEnd:"13:01",exit:"17:10",note:""},
      {id:"ponto-ana-three-days",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",date:shiftDate(-3),entry:"07:58",breakStart:"12:00",breakEnd:"13:00",exit:"17:02",note:""}
    ],
    solicitacoes: [
      {id:"sol-1001",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",category:"Benefícios",subject:"Dúvida sobre saldo do vale",description:"Gostaria de confirmar a data de crédito do próximo mês.",status:"Em andamento",createdAt:shiftDate(-1),updatedAt:shiftDate(-1)},
      {id:"sol-1002",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins",category:"Departamento pessoal",subject:"Atualização de dados cadastrais",description:"Preciso atualizar meu telefone de contato.",status:"Concluída",createdAt:shiftDate(-8),updatedAt:shiftDate(-5)},
      {id:"sol-1003",employeeEmail:"lucas.almeida@rhconnect.com",employeeName:"Lucas Almeida",category:"Documentos",subject:"Declaração de vínculo",description:"Solicito uma declaração de vínculo empregatício.",status:"Aberta",createdAt:shiftDate(-2),updatedAt:shiftDate(-2)}
    ],
    agenda: [
      {id:"agenda-01",date:shiftDate(1),time:"09:00",professional:"Dra. Paula Mendes",type:"Acolhimento individual",status:"Disponível",employeeEmail:""},
      {id:"agenda-02",date:shiftDate(1),time:"10:30",professional:"Dra. Paula Mendes",type:"Acolhimento individual",status:"Disponível",employeeEmail:""},
      {id:"agenda-03",date:shiftDate(2),time:"14:00",professional:"Dra. Paula Mendes",type:"Acolhimento individual",status:"Reservado",employeeEmail:"colaborador@rhconnect.com",employeeName:"Ana Martins"},
      {id:"agenda-04",date:shiftDate(3),time:"11:00",professional:"Dra. Paula Mendes",type:"Acolhimento individual",status:"Disponível",employeeEmail:""}
    ],
    comunicados: [
      {id:"com-01",title:"Novembro Azul: cuidar também é prevenção",category:"Saúde e bem-estar",body:"Durante este mês, reforçamos a importância da prevenção e do cuidado integral com a saúde. Procure os canais de orientação e participe das ações internas.",date:shiftDate(-1),author:"Equipe de RH",pinned:true},
      {id:"com-02",title:"Calendário de fechamento da folha",category:"Departamento pessoal",body:"O fechamento da folha deste mês seguirá o cronograma interno. Em caso de divergências cadastrais, abra uma solicitação na Central de RH até o último dia útil.",date:shiftDate(-3),author:"Departamento Pessoal",pinned:false},
      {id:"com-03",title:"Pesquisa de clima organizacional",category:"Pessoas",body:"Sua opinião ajuda a construir um ambiente de trabalho melhor. A pesquisa interna ficará disponível durante esta semana.",date:shiftDate(-5),author:"People Experience",pinned:false}
    ]
  };
  let user = null;
  const profile = account => {
    if(!account) return null;
    const {password,...safe}=account;
    return {...safe,initials:safe.name.split(/\\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()};
  };
  const read = name => {
    const key="rhconnect-demo-"+name;
    try {
      const stored=localStorage.getItem(key);
      if(stored!==null) return JSON.parse(stored);
    } catch(error) { console.warn("Falha ao ler dados locais:",name,error); }
    const initial=JSON.parse(JSON.stringify(seeds[name]||[]));
    localStorage.setItem(key,JSON.stringify(initial));
    return initial;
  };
  const write = (name,rows) => {
    if(!Array.isArray(rows)) throw Error("Formato de dados inválido");
    localStorage.setItem("rhconnect-demo-"+name,JSON.stringify(rows));
    return rows;
  };
  const requireAdmin = () => { if(user?.role!=="admin") throw Error("Acesso restrito à administração"); };
  const requireHr = () => { if(!user||!["admin","rh"].includes(user.role)) throw Error("Acesso restrito ao RH"); };
  window.RHStore = {
    enabled:true,
    demoMode:true,
    demoEmployees,
    async login(email,password,remember=false) {
      const normalized=String(email||"").trim().toLowerCase();
      const account=accounts.find(a=>a.email===normalized&&a.password===password);
      if(!account) throw Error("Credenciais inválidas");
      user=account;
      sessionStorage.setItem(keys.session,account.uid);
      if(remember) localStorage.setItem(keys.remembered,account.uid);
      else localStorage.removeItem(keys.remembered);
      return profile(account);
    },
    async restore() {
      const uid=sessionStorage.getItem(keys.session)||localStorage.getItem(keys.remembered);
      user=accounts.find(a=>a.uid===uid)||null;
      return profile(user);
    },
    async logout() {
      user=null;
      sessionStorage.removeItem(keys.session);
      localStorage.removeItem(keys.remembered);
    },
    async reset() { throw Error("A recuperação de senha será habilitada após a configuração do Firebase Auth."); },
    async load() {
      requireHr();
      const rows=read("employees");
      if(!rows.length) return write("employees",demoEmployees);
      return rows;
    },
    async add(record) {
      requireHr();
      const rows=await this.load();
      const i=rows.findIndex(r=>r.email.toLowerCase()===record.email.toLowerCase());
      if(i<0) rows.push(record); else rows[i]=record;
      write("employees",rows);
      return rows;
    },
    async remove(email) {
      requireAdmin();
      write("employees",(await this.load()).filter(r=>r.email.toLowerCase()!==String(email).toLowerCase()));
    },
    async read(name) { return read(name); },
    async write(name,rows) { requireHr(); return write(name,rows); },
    async create(name,record) {
      requireHr();
      const rows=read(name);
      const item={id:record.id||name.slice(0,3)+"-"+Date.now(),...record};
      rows.unshift(item);write(name,rows);return item;
    },
    async update(name,id,changes) {
      requireHr();
      const rows=read(name),index=rows.findIndex(r=>r.id===id);
      if(index<0) throw Error("Registro não encontrado");
      rows[index]={...rows[index],...changes};write(name,rows);return rows[index];
    },
    async removeRecord(name,id) {
      requireHr();
      write(name,read(name).filter(r=>r.id!==id));
    },
    async getAccounts() { requireAdmin(); return accounts.map(profile); },
    async currentUser() { return profile(user); },
    async markClock(email,date,field,time) {
      if(!user||user.email!==email) throw Error("Sessão inválida");
      const rows=read("ponto");
      let item=rows.find(r=>r.employeeEmail===email&&r.date===date);
      if(!item){item={id:"ponto-"+Date.now(),employeeEmail:email,employeeName:user.name,date,entry:"",breakStart:"",breakEnd:"",exit:""};rows.unshift(item);}
      if(item[field]) throw Error("Este registro já foi realizado.");
      item[field]=time;write("ponto",rows);return item;
    }
  };
})();