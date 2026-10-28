# CLAUDE.md --- DOGGO \| Dog Services

## 1. Contexto obrigatório

@contexto.md

O arquivo `contexto.md` é a referência central para a visão do produto,
as regras de negócio, a arquitetura conhecida, as decisões técnicas e o
estado das funcionalidades.

Antes de iniciar uma tarefa: - Leia as partes relevantes de
`contexto.md`. - Inspecione o código atual do frontend e/ou backend. -
Confirme se a documentação continua correta. - Diferencie
funcionalidades implementadas, parciais, planejadas e propostas. - Não
invente endpoints, campos, modelos, rotas ou comportamentos.

O código existente e os testes são a principal referência para o
comportamento implementado.

## 2. Objetivo e prioridade do produto

O DOGGO é uma plataforma que conecta tutores de cães a prestadores de
serviços. **O foco principal do produto é Dog Walking (passeios com
cães).**

Priorize a experiência completa de passeio: - descoberta e consulta de
passeadores; - cadastro e gerenciamento dos cães; - solicitação e
gerenciamento de passeios; - confirmação, recusa, cancelamento e
conclusão do serviço; - acompanhamento da localização durante o
passeio; - registro e consulta do trajeto; - histórico e avaliação do
serviço.

Pet Sitter e hospedagem são modalidades secundárias. Preserve o que já
existe, mas não priorize novas funcionalidades dessas modalidades sem
solicitação explícita. Não remova recursos ou dados existentes apenas
porque deixaram de ser prioridade.

## 3. Stack obrigatória

### 3.1. Frontend

-   Vue 3 com Composition API.
-   JavaScript, sem TypeScript.
-   Vite.
-   Vue Router.
-   Pinia.
-   Axios.
-   Tailwind CSS v4 (já em uso, com configuração CSS-first).
-   `lucide-vue-next` para os ícones (em uso; `@mdi/font` e
    `@heroicons/vue` foram removidos).
-   GSAP conforme já configurado no projeto.
-   `vue3-toastify` para notificações (em uso, via `src/utils/notify.js`;
    `vue-toast-notification` foi removido).
-   PWA conforme a implementação existente.

Confirme `package.json` e os arquivos de configuração antes de usar
bibliotecas ou scripts. Não instale dependências nem altere a stack sem
justificativa e autorização quando a mudança tiver impacto relevante.

Regras: - Não criar arquivos `.ts` ou `.tsx`. - Não introduzir
TypeScript. - Reutilizar dependências e padrões
existentes. - Manter a interface responsiva, mobile-first e acessível. -
Não substituir bibliotecas ou reestruturar toda a aplicação para
resolver um problema localizado.

### 3.2. Backend

-   Python e Django.
-   Django REST Framework.
-   SimpleJWT conforme a implementação existente.
-   PDM para dependências e comandos do projeto.
-   drf-spectacular para documentação OpenAPI.
-   Django Channels, Daphne e Redis para funcionalidades em tempo real,
    conforme configurados no repositório.

Confirme `pyproject.toml`, arquivos de configuração, rotas e
dependências antes de utilizar comandos ou introduzir recursos. Não
migre o backend para outro framework.

## 4. Padrões de código do frontend

### 4.1. Arquitetura e responsabilidades

Respeite a organização real de `src/`. Quando a estrutura existente
corresponder a este padrão, utilize:

  -----------------------------------------------------------------------
  Responsabilidade        Localização             Convenção
  ----------------------- ----------------------- -----------------------
  Views/páginas           `src/views/`            `XView.vue`

  Componentes de domínio  `src/components/`       PascalCase

  Componentes base        `src/components/ui/`    `UiX.vue` (UiIcon,
                                                  UiBadge, UiCard,
                                                  UiSheet, etc.)

  Casca de navegação      `src/components/shell/` AppSidebar, AppTopBar,
                                                  AppBottomNav,
                                                  ModeSwitch

  Layouts                 `src/layouts/`          `XLayout.vue`

  Stores Pinia            `src/stores/`           `useXStore`

  Chamadas HTTP           `src/api/`              funções nomeadas por
                                                  operação

  Composables             `src/composables/`      `useX.js`

  Utilitários puros       `src/utils/`            nomes claros em
                                                  camelCase

  Router                  `src/router/`           respeitar configuração
                                                  existente

  Estilos globais         confirmar o arquivo     tokens e reset globais
                          existente, como         
                          `src/assets/main.css`   
  -----------------------------------------------------------------------

Não crie uma nova estrutura paralela se o projeto já tiver uma convenção
estabelecida. Confira os arquivos reais antes de decidir onde colocar
código.

### 4.2. Componentes e views

-   Preferir Composition API e `<script setup>` em JavaScript.
-   Manter a ordem e o estilo já adotados nos componentes.
-   Declarar props e emits explicitamente.
-   Utilizar props para dados que descem e eventos para ações que sobem.
-   Usar `computed` para valores derivados, em vez de recalcular lógica
    no template.
-   Usar `v-for` com `:key` estável.
-   Não colocar `v-if` e `v-for` no mesmo elemento; extraia ou filtre os
    dados quando necessário.
-   Não utilizar `v-html` com dados fornecidos pelo usuário.
-   Separar responsabilidades e evitar componentes excessivamente
    grandes.
-   Toda tela com dados deve tratar carregamento, erro, estado vazio e
    sucesso.
-   Formulários devem seguir os componentes, validadores e padrões
    existentes. A validação no frontend melhora a experiência, mas não
    substitui a validação no backend.
-   Não usar `alert()` como mecanismo de notificação; utilizar os
    `notify` (`src/utils/notify.js`, sobre `vue3-toastify`):
    `notify.success`, `notify.error`, `notify.info`.
-   Não deixar `console.log` como tratamento de erro ou depuração
    permanente.

### 4.3. Stores e camada de API

Respeite o padrão real da aplicação. Se a arquitetura existente seguir
`View → Store → API`, mantenha esse fluxo:

-   Views e componentes não devem chamar a API diretamente quando já
    existe uma store responsável pelo fluxo.
-   A camada `src/api/` deve centralizar as chamadas HTTP.
-   Reutilize a instância Axios configurada no projeto, incluindo
    interceptors e autenticação.
-   Não use `axios` diretamente nem URLs fixas quando houver uma
    instância centralizada.
-   Monte explicitamente os campos enviados à API; não envie objetos de
    formulário inteiros sem necessidade.
-   Stores devem controlar estados compartilhados, como dados,
    carregamento e erros.
-   Trate erros de forma consistente e relance-os quando a camada
    chamadora precisar reagir.
-   Mensagens visíveis ao usuário devem estar em português e aproveitar
    as mensagens de validação da API quando forem adequadas.
-   Evite manter a mesma informação em múltiplos estados independentes.

Não force esse padrão sobre módulos que já tenham uma arquitetura
específica e testada. Investigue exceções antes de alterar.

### 4.4. Router

-   Preserve o router e os layouts existentes.
-   Reutilize os mecanismos de autenticação e proteção de rotas.
-   Siga a convenção de nomes de rotas já adotada.
-   Prefira lazy loading para páginas quando consistente com a
    configuração existente.
-   Não crie links de navegação para páginas inexistentes.
-   Não considere a proteção da rota no frontend suficiente para
    garantir autorização.

### 4.5. CSS e identidade visual

-   Usar Tailwind CSS v4.
-   Utilizar a skill tailwind-design-system
-   Reutilizar os tokens semânticos de `src/assets/css/main.css`
    (`bg-canvas`, `bg-surface`, `text-fg`, `text-fg-muted`,
    `border-line`, `bg-primary`, `text-primary-fg`, `text-danger`...),
    que já trocam entre tema claro e escuro. Não usar cores cruas
    (`bg-white`, `text-gray-*`) nem os tokens antigos `doggo-*`.
-   Ícones: sempre componentes de `lucide-vue-next`, renderizados com
    `UiIcon`.
-   Evitar repetir valores de cores, espaçamentos e tipografia em vários
    arquivos.
-   Manter consistência visual com a identidade atual do DOGGO.
-   Utilizar estilos escopados em componentes quando esse for o padrão
    existente.
-   Garantir responsividade, foco de teclado, rótulos acessíveis e
    contraste adequado.
-   Priorizar os fluxos de Dog Walking em telas móveis, sem prejudicar a
    experiência desktop.
-   Não criar outro arquivo de CSS global quando já existir um com essa
    responsabilidade.

Não invente uma nova paleta ou identidade visual. Inspecione os estilos
existentes e `contexto.md`.

## 5. Padrões de código do backend

### 5.1. Arquitetura

Siga a arquitetura real do Django e do Django REST Framework. Reutilize
models, serializers, ViewSets, permissões, routers e testes existentes.

Antes de criar módulos ou apps: - inspecione a estrutura atual; -
procure implementações semelhantes; - mantenha a organização
existente; - evite criar abstrações ou camadas adicionais sem
necessidade concreta.

Não imponha a estrutura de outro projeto ao DOGGO. Se a organização
atual utilizar `core/`, `uploader/` ou outros módulos, confirme
suas responsabilidades antes de alterar.

### 5.2. Models e migrations

-   Escolha relacionamentos e regras de exclusão considerando a
    integridade dos dados e o histórico dos serviços.
-   Utilize `related_name` coerentes com os padrões existentes.
-   Defina restrições de unicidade no banco quando forem necessárias
    para garantir invariantes.
-   Respeite os padrões existentes de timestamps e choices.
-   Ao alterar models, inspecione e gere migrations com os comandos PDM
    adequados.
-   Não apague nem reescreva migrations existentes para contornar
    problemas.
-   Não execute operações destrutivas ou migrações com risco de perda de
    dados sem explicar o impacto e obter autorização.

### 5.3. Serializers

-   Defina os campos explicitamente em código novo.
-   Separe serializers de listagem, detalhe e escrita quando isso
    simplificar o contrato e seguir os padrões existentes.
-   Marque campos calculados ou apenas informativos como somente
    leitura.
-   Valide campos e regras de negócio no backend.
-   Use mensagens de validação claras, preferencialmente em português.
-   Para operações que alterem várias tabelas, avalie transações
    atômicas.
-   Use serializer próprio para entradas de ações customizadas quando
    apropriado.
-   Nunca aceite do frontend dados de autoria, propriedade ou permissões
    como prova de autorização.

### 5.4. ViewSets, permissões e consultas

-   Reutilize o padrão de `get_queryset()` e `get_serializer_class()` já
    adotado.
-   Restringir o queryset aos recursos que o usuário pode acessar sempre
    que necessário.
-   Aplicar autenticação e permissões de objeto adequadas.
-   Evitar confiar somente em verificações feitas no frontend.
-   Evitar consultas N+1; avaliar `select_related()` e
    `prefetch_related()` quando apropriado.
-   Documentar endpoints e ações com drf-spectacular conforme o padrão
    existente.
-   Preservar os contratos da API, incluindo nomes de campos, formatos
    de resposta e códigos HTTP, salvo quando a mudança for intencional e
    coordenada com o frontend.

Não adote automaticamente regras de autorização de outro domínio. As
permissões do DOGGO devem refletir os relacionamentos reais entre
usuários, cães, serviços, tutores e passeadores.

## 6. Regras de negócio prioritárias

### 6.1. Usuários e perfis

A aplicação possui perfis de cliente/tutor e prestador/passeador
relacionados ao usuário. A implementação conhecida utiliza
relacionamentos como `user.client_profile` e `user.provider_profile`.

Não presuma que o modelo `User` possui um campo `role`. Confira os
models e os serializers antes de alterar a lógica de perfil.

O usuário autenticado deve ser obtido no backend a partir da requisição,
e não aceito do corpo como fonte de identidade ou autorização.

### 6.2. Serviços e estados

A implementação conhecida utiliza os seguintes status:

    ID Status
  ---- --------------
     1 Em Análise
     2 Confirmado
     3 Em Andamento
     4 Concluído
     5 Cancelado
     6 Recusado

Confirme as choices e regras reais no código antes de utilizá-las ou
alterá-las.

Ao implementar mudanças de estado: - verifique o estado atual e o
destino permitido; - valide quem pode executar a transição; - impeça
transições inválidas; - preserve consistência entre frontend, backend e
banco; - atualize testes e documentação pertinentes.

Não altere os IDs nem o significado dos estados sem analisar a
compatibilidade com os dados existentes.

### 6.3. Avaliações

A implementação conhecida possui uma ação de avaliação `rate` associada
ao serviço e restringe a avaliação ao tutor vinculado ao serviço.

Antes de modificar o fluxo, confira o ViewSet, serializer, model e
testes existentes. Preserve a autorização no backend e as condições de
elegibilidade para avaliar.

### 6.4. Localização e WebSockets

O projeto possui acompanhamento em tempo real relacionado a serviços,
com uma rota WebSocket conhecida no formato `ws/services/<service_id>/`,
Redis e armazenamento temporário de localização. A implementação
conhecida utiliza uma chave no formato
`doggo:service:{service_id}:location`, TTL de uma hora, intervalo de
referência de 10 segundos para salvamento e distância de referência de
10 metros. Daphne é utilizado conforme a configuração de deploy.

Esses detalhes devem ser confirmados no código antes de qualquer
alteração.

Ao trabalhar nessa área: - inspecione cliente WebSocket, consumers,
routing ASGI, autenticação e permissões; - confirme quem pode receber e
transmitir a localização; - preserve reconexão e tratamento de
desconexões; - diferencie dados temporários no Redis do trajeto
persistido; - verifique frequência de atualização, condições de
salvamento e limpeza; - preserve a compatibilidade entre frontend e
backend; - verifique as variáveis de ambiente e as diferenças entre
desenvolvimento e produção; - não exponha a localização a usuários que
não tenham autorização.

Não presuma que um TTL do Redis define o tempo de retenção dos dados
persistidos.

## 7. Segurança e privacidade

-   A autorização deve ser aplicada no backend, não somente na
    interface.
-   Verifique se o usuário autenticado pode consultar ou modificar cada
    recurso.
-   Não confie em IDs enviados pelo frontend para determinar propriedade
    ou permissão.
-   Proteja dados pessoais, informações dos cães e localização.
-   Não exponha tokens, secrets, credenciais ou informações privadas em
    logs, respostas ou documentação.
-   Não altere arquivos `.env` nem sobrescreva configurações locais.
-   Não enfraqueça permissões para facilitar testes.
-   Não permita que um usuário modifique serviços, perfis ou avaliações
    de terceiros sem autorização.
-   Considere autenticação, autorização e validação em conexões
    WebSocket.
-   Não altere o armazenamento de tokens ou migre para cookies JWT sem
    analisar a arquitetura e os requisitos atuais.

## 8. Procedimento antes de implementar

Para cada tarefa:

1.  Entenda o objetivo e os critérios de conclusão.
2.  Consulte `contexto.md` e as instruções relevantes.
3.  Verifique `git status` e `git diff` para preservar mudanças locais.
4.  Inspecione os arquivos e testes relacionados.
5.  Confirme dependências, comandos e variáveis de ambiente necessárias.
6.  Identifique impactos no frontend, backend, banco, API e WebSockets.
7.  Apresente um plano breve quando a tarefa for abrangente ou envolver
    decisões relevantes.
8.  Implemente a menor alteração coesa que resolva o problema.
9.  Execute verificações proporcionais ao risco.
10. Informe mudanças, testes realizados e pendências.

Não modifique arquivos que não tenham relação com a tarefa. Não
sobrescreva trabalho preexistente. Se uma alteração local conflitar com
a tarefa, preserve-a e informe o conflito antes de prosseguir.

## 9. Git e operações destrutivas

-   Não execute `git reset --hard`, limpeza destrutiva ou comandos que
    descartem alterações do usuário.
-   Não reverta alterações preexistentes sem autorização.
-   Não faça commit, push, criação de PR ou merge sem solicitação
    explícita.
-   Não mude de branch de modo que possa perder ou ocultar trabalho
    local.
-   Antes de operações Git relevantes, confira o estado do repositório.
-   Não inclua `.env`, credenciais, tokens ou arquivos sensíveis em
    commits.
-   Não presuma que o fluxo de branches ou o formato de commits de outro
    projeto se aplica ao DOGGO.

## 10. Testes e validação

Consulte os scripts e as ferramentas configuradas no repositório antes
de executar comandos.

### Frontend

Quando aplicável: - execute o build configurado no `package.json`; -
execute lint apenas com comandos que não alterem arquivos fora do
escopo; - execute testes existentes relacionados à mudança; - verifique
rotas, formulários, estados de carregamento, erros e estados vazios; -
valide responsividade e fluxos afetados; - confirme integração com os
endpoints reais ou contratos documentados.

Não use um comando de lint com correção automática em todo o projeto sem
necessidade, pois pode modificar arquivos não relacionados.

### Backend

Quando aplicável: - execute os testes relevantes e, quando viável, a
suíte completa; - verifique migrations pendentes; - execute as
verificações de lint configuradas; - valide autenticação, permissões,
respostas HTTP e erros; - verifique contratos da API; - teste regras de
transição de estado e propriedade de recursos; - valide integrações com
WebSockets e Redis quando afetadas.

Não invente nomes de scripts ou comandos. Confira `package.json`,
`pyproject.toml` e a documentação do projeto.

### Critério de conclusão

Não declare que algo foi testado se o comando não foi executado. Se um
teste não puder ser executado, explique a limitação e o que permanece
sem validação.

## 11. Documentação

Atualize `contexto.md` ou documentação específica quando uma tarefa
alterar de forma relevante: - arquitetura; - regras de negócio; -
contratos de API; - autenticação e permissões; - estados de serviços; -
fluxo de localização ou WebSockets; - modelos e relacionamentos; -
decisões duradouras do produto.

Diferencie claramente o que está implementado, planejado e pendente. Não
reescreva toda a documentação para registrar uma alteração pequena.

## 12. Formato da resposta final

Ao terminar uma tarefa, informe de forma objetiva:

-   **Implementado:** resumo das mudanças.
-   **Arquivos alterados:** caminhos e finalidade.
-   **Validação:** comandos executados e resultados reais.
-   **Integração:** impactos no frontend/backend, quando aplicável.
-   **Pendências:** limitações, configurações ou decisões necessárias.

Não afirme que uma funcionalidade está pronta se partes importantes não
foram implementadas ou verificadas.

## 13. Ambiente de desenvolvimento

O desenvolvimento é realizado em Windows. Prefira comandos compatíveis
com PowerShell e os scripts já definidos no projeto.

-   Frontend: utilize os scripts do `package.json`.
-   Backend: utilize PDM e os comandos Django configurados.
-   Adapte comandos de shell para PowerShell quando necessário.
-   Não presuma que ferramentas, serviços ou variáveis de ambiente
    estejam disponíveis sem verificar.

## Regra de ouro

Trabalhe como desenvolvedor full stack responsável por um produto
existente: entenda o código real, priorize Dog Walking, preserve o
trabalho existente, proteja os dados dos usuários, coordene mudanças
entre frontend e backend e valide o resultado antes de declarar a tarefa
concluída.
