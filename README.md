# RH CONNECT — Portal Corporativo

## Funcionamento
- Login por e-mail e senha, recuperação de senha e sessão Firebase. Sem configuração, o login permanece bloqueado.
- Perfis autorizados são provisionados pela administração no console. Usuários não podem modificar o próprio nível de acesso.
- RH e administração podem consultar o diretório e cadastrar colaboradores; administração pode também gerenciar registros de RH e administração e excluir registros. As regras do Firestore verificam a autorização. Cadastro de funcionário não cria conta de acesso; exclusão não revoga conta.
- Dashboard usa os registros do diretório. Benefícios, holerites, jornada, agenda, solicitações e comunicados têm estados iniciais vazios; integrações operacionais ainda não foram implementadas.
- Registros antigos de demonstração não são migrados.

  
