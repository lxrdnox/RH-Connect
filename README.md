# RH CONNECT — Portal Corporativo

Frontend estático HTML, CSS e JavaScript, com Firebase Authentication e Cloud Firestore. Não requer servidor Node.js.

## Inicialização
1. Crie um projeto Firebase dedicado à organização e registre um aplicativo Web.
2. Preencha js/firebase-config.js com a configuração pública do aplicativo. Nunca inclua chaves de conta de serviço.
3. Habilite Authentication > Email/Password e configure os domínios autorizados para o GitHub Pages. Não habilite login anônimo.
4. Crie o Cloud Firestore e publique firestore.rules antes de cadastrar informações.
5. Crie a primeira conta no console Authentication. Envie um link de redefinição de senha e providencie a verificação do e-mail por um fluxo confiável do Firebase. O portal exige emailVerified. Não compartilhe senhas.
6. No Firestore, crie manualmente users/{UID da conta}, com os campos name (string), role ("admin"), active (boolean true), title (string) e department (string). O UID deve corresponder à conta no Authentication. Não conceda permissões de admin a outros usuários sem autorização.
7. Aplique o mesmo procedimento para os demais usuários, com role "rh" ou "colaborador". Para desativar acesso, altere active para false e desabilite a conta no Authentication. O diretório employees não controla autenticação.
8. No GitHub: Settings > Pages > Deploy from a branch > main > /(root) > Save.

## Funcionamento
- O portal começa vazio e não inclui contas, senhas ou funcionários fictícios.
- Login por e-mail e senha, recuperação de senha e sessão Firebase. Sem configuração, o login permanece bloqueado.
- Perfis autorizados são provisionados pela administração no console. Usuários não podem modificar o próprio nível de acesso.
- RH e administração podem consultar o diretório e cadastrar colaboradores; administração pode também gerenciar registros de RH e administração e excluir registros. As regras do Firestore verificam a autorização. Cadastro de funcionário não cria conta de acesso; exclusão não revoga conta.
- Dashboard usa os registros do diretório. Benefícios, holerites, jornada, agenda, solicitações e comunicados têm estados iniciais vazios; integrações operacionais ainda não foram implementadas.
- Registros antigos de demonstração não são migrados.

## Antes de liberar o uso
Testar regras no emulador e verificar autenticação real, recuperação, acesso negado de usuário sem perfil, usuário inativo, perfil colaborador tentando ler o diretório, RH tentando alterar administrador, e bloqueio de alterações de users pelo cliente. Testar navegação e acessibilidade em desktop, tablet e celular. Revisar privacidade, política de retenção, auditoria e LGPD antes de inserir informações de funcionários.
