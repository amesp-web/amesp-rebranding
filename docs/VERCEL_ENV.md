# Variáveis de ambiente na Vercel

No projeto na Vercel: **Settings → Environment Variables**.  
Adicione cada variável para os ambientes **Production** e **Preview** (e **Development** se usar).

---

## Obrigatórias (site + admin + Supabase)

| Nome | Descrição | Exemplo |
|------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima (pública) do Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (segredo, nunca expor no front) | `eyJ...` |

---

## URL do site (emails e links)

| Nome | Descrição | Exemplo |
|------|-----------|---------|
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (usada em emails e redirects) | `https://amespmaricultura.org.br` ou `https://seu-projeto.vercel.app` |

---

## Push (notificações PWA)

| Nome | Descrição | Exemplo |
|------|-----------|---------|
| `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY` | Chave pública VAPID (igual à abaixo) | gerada com `npx web-push generate-vapid-keys` |
| `WEB_PUSH_PUBLIC_KEY` | Mesmo valor da chave pública VAPID | mesmo valor de cima |
| `WEB_PUSH_PRIVATE_KEY` | Chave privada VAPID (segredo) | gerada junto com a pública |
| `WEB_PUSH_CONTACT_EMAIL` | (Opcional) Email de contato para push | `amesp@amespmaricultura.org.br` |

---

## E-mail (Gmail / formulário de contato)

| Nome | Descrição |
|------|-----------|
| `GMAIL_USER` | E-mail da conta Gmail |
| `GMAIL_PASSWORD` | Senha de app do Gmail (não a senha normal) |
| `GMAIL_FROM_NAME` | Nome que aparece no “De” (ex.: AMESP) |
| `GMAIL_FROM_EMAIL` | E-mail que aparece no “De” (pode ser o mesmo que GMAIL_USER) |
| `CONTACT_EMAIL_RECIPIENT` | E-mail que recebe os envios do formulário de contato |

---

## Opcionais

| Nome | Descrição |
|------|-----------|
| `NEXT_PUBLIC_GEOAPIFY_KEY` | API key Geoapify (mapas / autocomplete de endereço) |
| `GEMINI_API_KEY` | API key Google Gemini (sugestão de notícias no admin) |
| `GEMINI_MODEL` | Modelo Gemini (ex.: `gemini-2.5-flash`) |

---

## Resumo rápido para Push no iPhone

Para o prompt de notificações e o push funcionarem no iPhone (e em produção):

1. Preencher na Vercel: **Supabase** (3 vars) + **NEXT_PUBLIC_SITE_URL** (URL HTTPS do deploy).
2. Preencher as **4 variáveis de Push** (as duas chaves públicas com o **mesmo** valor).
3. Fazer **Redeploy** após salvar as variáveis (Deployments → ⋮ → Redeploy).

Depois: no iPhone, abrir o site em **HTTPS**, adicionar à tela inicial e abrir pelo ícone — o prompt de notificações deve aparecer.
