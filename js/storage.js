(() => {
 const config=window.RH_FIREBASE_CONFIG||{};
 const enabled=Boolean(config.apiKey&&config.authDomain&&config.projectId&&config.appId);
 let client;
 async function db(){
   if(!enabled)throw Error("Firebase não configurado");
   if(!client)client=(async()=>{
     const [app,auth,fs]=await Promise.all([
       import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
       import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
       import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')]);
     const instance=app.initializeApp(config);
     return {auth,fs,a:auth.getAuth(instance),d:fs.getFirestore(instance)};
   })().catch(e=>{client=null;throw e});
   return client;
 }
 async function profile(c,user){
   if(!user||user.isAnonymous||!user.emailVerified)throw Error("Confirme seu e-mail antes de acessar.");
   const snap=await c.fs.getDoc(c.fs.doc(c.d,'users',user.uid));
   const p=snap.data();
   if(!snap.exists()||!['admin','rh','colaborador'].includes(p.role)||p.active!==true)throw Error("Acesso ainda não liberado pelo RH.");
   return {uid:user.uid,email:user.email,name:String(p.name||user.email),role:p.role,title:String(p.title||''),department:String(p.department||'')};
 }
 window.RHStore={enabled,
 async login(email,password,remember){
   const c=await db();await c.auth.setPersistence(c.a,remember?c.auth.browserLocalPersistence:c.auth.browserSessionPersistence);
   const {user}=await c.auth.signInWithEmailAndPassword(c.a,email,password);
   try{return await profile(c,user)}catch(e){await c.auth.signOut(c.a);throw e}
 },
 async restore(){const c=await db();await c.a.authStateReady();if(!c.a.currentUser)return null;try{return await profile(c,c.a.currentUser)}catch(e){await c.auth.signOut(c.a);throw e}},
 async logout(){if(enabled){const c=await db();await c.auth.signOut(c.a)}},
 async reset(email){const c=await db();await c.auth.sendPasswordResetEmail(c.a,email)},
 async load(){const c=await db();return (await c.fs.getDocs(c.fs.collection(c.d,'employees'))).docs.map(d=>d.data())},
 async add(record){const c=await db();await c.fs.setDoc(c.fs.doc(c.d,'employees',encodeURIComponent(record.email.toLowerCase())),record)},
 async remove(email){const c=await db();await c.fs.deleteDoc(c.fs.doc(c.d,'employees',encodeURIComponent(email.toLowerCase())))}
 };
})();