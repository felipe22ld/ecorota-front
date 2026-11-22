# EcoRota — Front-end (Angular 22 + Bootstrap 5)

Front-end feito a partir do Figma **[GRUPO 2] EcoRota** para testar a API do EcoRota enquanto ela é construída.
**Este repositório não contém back-end.**

## Requisitos

- **Node.js 22.12 ou mais novo** (o Angular 22 não roda no Node 20). Com nvm: `nvm install 22 && nvm use 22`.
- O Angular 22 usa **TypeScript 6** (já está no `package.json`).

## Como rodar

```bash
npm install
npm start          # abre em http://localhost:4200
```

Deixe a API rodando em paralelo (`dotnet run` no projeto `EcoRota.Api`, perfil **http** → `http://localhost:5134`).

## Como o front fala com a API

- Em desenvolvimento, as chamadas vão para `/api/...` no próprio `ng serve`, e o `proxy.conf.json` repassa para `http://localhost:5134`. **Por isso não é preciso configurar CORS na API para desenvolver.**
- Se a API estiver em outra porta, mude o `target` em `proxy.conf.json`.
- Em produção, ajuste `apiUrl` em `src/environments/environment.ts` (aí sim a API vai precisar de CORS).
- O token JWT só é enviado para a sua API (não vai para serviços de fora, como o ViaCEP).

## O que já usa a API de verdade

| Tela | Endpoint |
| --- | --- |
| Login (aba Telefone) — envia `{ telefone, senha }` | `POST /api/auth/login` |
| Cabeçalho da área logada (nome/perfil) | `GET /api/auth/me` |
| Cadastro → Etapa 3 "Quero recolher" | `POST /api/auth/cadastrar-catador` |
| Cadastro → Etapa 3 "Quero descartar" | `POST /api/auth/cadastrar-gerador` |
| Cadastro → Etapa 4 / `/confirmar-telefone` | `POST /api/auth/confirmar-telefone` |

- Erros **422** do FluentValidation aparecem embaixo de cada campo. Erros nos dados básicos (e-mail ou telefone já cadastrado, senha fraca) levam o usuário de volta para a Etapa 2.
- Login com **403** (telefone não confirmado) mostra um link para confirmar o telefone.
- O telefone é enviado no formato E.164 (`+5511912345678`), o mesmo que o `TelefoneNormalizer` da API gera.
- A aba **E-mail** do login fica só pelo visual do Figma: a API autentica pelo telefone.
- A confirmação do telefone continua usando o **e-mail** (`{ email, codigo }`), como na API.
- No cadastro do Gerador, o CEP preenche rua/bairro/cidade pelo **ViaCEP** (serviço público).

## O que ainda usa dados de exemplo

Essas telas mostram o selo **"Dados de exemplo"** e leem de `src/app/core/services/dados-exemplo.service.ts`.
Cada método tem um comentário `TODO API:` com o endpoint sugerido; quando o endpoint existir,
troque o corpo do método por `this.http.get/post(...)` e as telas continuam funcionando.

- **Gerador:** início, nova solicitação, solicitação publicada, minhas solicitações, detalhes,
  prestadores próximos, contato com prestador (abre o WhatsApp), pontos de descarte.
- **Catador:** início, pedidos próximos, detalhes do pedido (aceitar/recusar), pedido aceito, minhas coletas.
- **Ambos:** a parte de endereço/região do "Meu perfil" e o botão "Salvar alterações".
- Sem endpoint ainda (mostram aviso): esqueci minha senha, reenviar código, notificações.

## Rotas

| Rota | Tela |
| --- | --- |
| `/` | Landing page |
| `/login` (`?telefone=` opcional) | Login pelo telefone |
| `/cadastro` (`?perfil=Gerador` ou `Catador`) | Cadastro em 4 etapas + sucesso |
| `/confirmar-telefone?email=` | Confirmação avulsa do telefone |
| `/gerador/...` | Área de quem descarta (só perfil Gerador) |
| `/catador/...` | Área de quem recolhe (só perfil Catador) |

## Imagem do hero

A foto do topo da landing não pôde ser exportada do Figma. Salve a imagem em `public/images/hero.jpg`
que ela aparece automaticamente (até lá fica um degradê verde).

## Estrutura

```
src/app/
  core/
    models/        contratos (espelham os DTOs da API) e modelos das telas futuras
    services/      AuthService (endpoints), SessaoService (token/usuário), DadosExemploService (mocks)
    interceptors/  envia o Bearer token e trata 401
    guards/        autenticado, visitante e por perfil
    utils/         conversão do ProblemDetails e erros por campo
  shared/          logo, mensagens de erro, máscaras, avisos (toasts), pipes de rótulos
  layout/          cabeçalhos e rodapé
  features/
    landing/  auth/ (login, cadastro, confirmar-telefone)  gerador/  catador/  perfil/
src/styles.scss    tema do Bootstrap com as cores do Figma
```

O Angular 22 usa **OnPush** por padrão: o estado das telas fica em **signals**.
