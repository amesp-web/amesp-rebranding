# Como testar e instalar o app (PWA) AMESP

## 1. Subir o site

No terminal, na pasta do projeto:

```bash
npm run dev
```

Abra o navegador em: **http://localhost:3002**

### Testar no celular (mesma rede Wi‑Fi)

1. No terminal, use o comando que libera acesso pela rede:
   ```bash
   npm run dev:mobile
   ```
2. No Mac: **Preferências do Sistema → Rede** (ou **Configurações → Wi‑Fi → (i) na rede)** e veja o **endereço IP** (ex.: 192.168.0.10).
3. No celular, conectado no **mesmo Wi‑Fi**, abra o navegador e acesse: **http://SEU_IP:3002** (ex.: http://192.168.0.10:3002).
4. A partir daí, as opções de “Instalar app” são as do celular (Chrome ou Safari), conforme a seção 2 abaixo.

---

## 2. Onde está o botão "Instalar app"

O botão **não fica dentro do site**. Ele fica **no próprio navegador** (Chrome, Edge, Safari).

### No **Chrome** (computador)

- **Opção A:** Olhe no **canto direito da barra de endereço** (onde fica o cadeado ou "Seguro").  
  Quando o site for instalável, aparece um **ícone de instalação** (quadrado com seta para baixo ou um +).  
  Clique nele e depois em **"Instalar"**.
- **Opção B:** Clique nos **três pontinhos** (⋮) no canto superior direito do Chrome → **"Instalar AMESP..."** ou **"Adicionar ao Chrome"** (ou algo parecido). Se aparecer essa opção, use-a para instalar.

### No **Chrome** (celular Android)

- Toque nos **três pontinhos** (⋮) → **"Adicionar à tela inicial"** ou **"Instalar app"**.

### No **Safari** (iPhone/iPad)

- Toque no botão **Compartilhar** (quadrado com seta para cima).
- Role e toque em **"Adicionar à Tela de Início"**.

---

## 3. O que precisa estar ok para aparecer "Instalar"

- Você está em **http://localhost:3002** (ou no seu domínio em produção com **HTTPS**).
- O site tem **manifest** e **service worker** (já configurados no projeto).
- No Chrome (desktop), às vezes o ícone de instalação só aparece depois de **navegar um pouco** ou **recarregar** a página (F5).

Se não aparecer nenhuma opção de instalar, recarregue a página (F5) e espere alguns segundos, ou tente pelo menu (três pontinhos).

---

## 4. Depois de instalar

- **Computador:** o app abre em uma janela própria (sem a barra de endereço do Chrome).
- **Celular:** o ícone do AMESP aparece na tela inicial; ao tocar, o site abre em tela cheia.
