# RH CONNECT — Portal Corporativo

Portal de RH em HTML, CSS e JavaScript, preparado para apresentação via GitHub Pages.

## Acesso para apresentação

O projeto possui dois acessos locais de demonstração:

| Perfil | E-mail | Senha |
|---|---|---|
| Colaborador | colaborador@rhconnect.com | 123456 |
| RH Administrador | rh@rhconnect.com | 123456 |

Os botões de acesso rápido da tela inicial preenchem as credenciais automaticamente.

## Módulos implementados

- **Meu painel:** indicadores pessoais ou visão geral de gestão, atalhos, atividades recentes e comunicados.
- **Meus holerites:** consulta por colaborador, cadastro pelo RH e visualização para impressão/salvar como PDF.
- **Vale alimentação:** histórico de créditos, valores por competência e lançamento pelo RH.
- **Ponto web:** espelho de registros e fluxo demonstrativo de entrada, intervalo, retorno e saída.
- **Central de solicitações:** abertura de chamados pelo colaborador e atualização de status pelo RH.
- **Agenda psicológica:** consulta, reserva e cancelamento de horários; RH pode cadastrar novos horários.
- **Mural de comunicados:** leitura de publicações e criação de comunicados pelo RH.
- **Funcionários:** diretório, cadastro, pesquisa e exportação CSV.
- **Usuários e permissões:** consulta dos perfis de apresentação.
- **Relatórios:** indicadores consolidados dos registros disponíveis.

## Persistência e limites desta versão

**Modo de apresentação local:** os dados de exemplo e as alterações feitas durante a demonstração são salvos no `localStorage` do navegador utilizado. Eles permanecem após atualizar a página nesse mesmo navegador, mas não são compartilhados entre dispositivos ou usuários.

O arquivo `js/firebase-config.js` ainda contém campos vazios. Portanto, esta versão **não está conectada ao Firebase** e não deve ser usada para armazenar dados reais de colaboradores.

Os holerites, valores de benefícios, registros de ponto, solicitações, horários e comunicados pré-carregados são **fictícios e exclusivamente demonstrativos**. O holerite gerado para impressão contém aviso explícito de que não possui validade legal, fiscal ou trabalhista. O ponto não substitui um sistema oficial de controle de jornada.

Para produção, configure Firebase Authentication e Firestore, implemente regras de segurança por perfil, armazenamento protegido de documentos e auditoria. Não publique senhas reais, dados pessoais, documentos ou informações salariais em repositórios públicos.

## Publicação no GitHub Pages

1. Envie os arquivos do repositório para a branch publicada.
2. Em **Settings → Pages**, selecione a branch e a pasta raiz (`/(root)`).
3. Aguarde a publicação e abra o endereço do GitHub Pages.
4. Atualize com `Ctrl + F5` se o navegador mantiver arquivos antigos em cache.

Não é necessário executar `npm install` nem iniciar um servidor Node.js para esta versão estática.
