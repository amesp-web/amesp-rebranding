# 🚀 Guia Completo de SEO para AMESP

## ⚠️ IMPORTANTE: Implementar Quando Migrar para o Domínio Oficial

Este guia deve ser usado quando o site for migrado para: **https://amespmaricultura.org.br**

**Não implementar agora** pois as URLs ainda vão mudar do domínio temporário (vercel.app) para o domínio oficial.

---

## 📋 Checklist Pré-Migração

Antes de implementar SEO, certifique-se de:
- [ ] Domínio oficial configurado e ativo (amespmaricultura.org.br)
- [ ] DNS apontando corretamente
- [ ] SSL/HTTPS configurado
- [ ] Site funcionando 100% no novo domínio
- [ ] Todas as variáveis de ambiente atualizadas com o novo domínio

---

## 🎯 Implementações de SEO (Para Fazer na Migração)

### **1. Meta Tags Completas** ⭐⭐⭐⭐⭐

**Quando migrar**, substitua o metadata no `app/layout.tsx` por:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://amespmaricultura.org.br'),
  title: {
    default: "AMESP - Associação dos Maricultores do Estado de São Paulo",
    template: "%s | AMESP"
  },
  description: "Promovendo a maricultura sustentável desde 1998. Associação dos Maricultores do Estado de São Paulo - cultivo de ostras, mexilhões e vieiras no litoral norte de SP.",
  keywords: [
    "maricultura", "maricultura sustentável", "cultivo de ostras",
    "cultivo de mexilhões", "aquicultura", "AMESP",
    "maricultores São Paulo", "litoral norte SP", "Ubatuba",
    "ostreicultura", "mitilicultura"
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://amespmaricultura.org.br',
    siteName: 'AMESP',
    title: 'AMESP - Maricultura Sustentável no Litoral Norte de São Paulo',
    description: 'Desde 1998 promovendo o desenvolvimento sustentável da maricultura.',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AMESP - Maricultura Sustentável',
    description: 'Associação dos Maricultores do Estado de São Paulo desde 1998',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### **2. Criar robots.txt**

Criar arquivo `app/robots.txt`:

```txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /login
Disallow: /auth
Disallow: /api
Disallow: /maricultor/dashboard

Sitemap: https://amespmaricultura.org.br/sitemap.xml
```

### **3. Criar sitemap.ts**

Criar arquivo `app/sitemap.ts` (já está pronto no código comentado abaixo).

---

## 🎯 Próximas Melhorias de SEO (Recomendadas)

### **1. Imagem Open Graph** ⭐⭐⭐⭐⭐
**O Que Fazer:**
Criar uma imagem `public/og-image.jpg` (1200x630px) com:
- Logo AMESP
- Texto: "Maricultura Sustentável"
- Imagem de fundo oceânico

**Por quê?**
Quando compartilharem seu site no Facebook/WhatsApp/LinkedIn, essa imagem aparecerá.

**Como criar:**
- Use Canva ou Figma
- Dimensões: 1200x630 pixels
- Salve como `og-image.jpg` na pasta `public/`

---

### **2. Google Search Console** ⭐⭐⭐⭐⭐
**O Que Fazer:**
1. Acesse: https://search.google.com/search-console
2. Adicione a propriedade: `https://amespmaricultura.org.br`
3. Verifique a propriedade (via HTML tag ou DNS)
4. Copie o código de verificação
5. Adicione no `app/layout.tsx`:
   ```typescript
   verification: {
     google: 'SEU-CODIGO-AQUI',
   }
   ```

**Por quê?**
- Monitorar como Google vê seu site
- Ver quais palavras-chave trazem tráfego
- Identificar erros de indexação

---

### **3. Schema.org (JSON-LD)** ⭐⭐⭐⭐
**O Que Fazer:**
Adicionar dados estruturados para:

#### a) **Organização**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AMESP",
  "alternateName": "Associação dos Maricultores do Estado de São Paulo",
  "url": "https://amespmaricultura.org.br",
  "logo": "https://amespmaricultura.org.br/amesp_logo.png",
  "description": "Associação que promove a maricultura sustentável desde 1998",
  "foundingDate": "1998",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ubatuba",
    "addressRegion": "SP",
    "addressCountry": "BR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-12-3833-8000",
    "contactType": "customer service",
    "email": "contato@amespmaricultura.org.br"
  },
  "sameAs": [
    "https://facebook.com/amesp",
    "https://instagram.com/amesp"
  ]
}
```

#### b) **Artigos (nas páginas de notícias)**
Para cada notícia, adicionar:
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Título da Notícia",
  "image": "URL da imagem",
  "datePublished": "2025-10-30",
  "dateModified": "2025-10-30",
  "author": {
    "@type": "Organization",
    "name": "AMESP"
  }
}
```

**Por quê?**
Google mostra rich snippets (resultados enriquecidos) com estrelas, preços, avaliações, etc.

---

### **4. URLs Amigáveis** ⭐⭐⭐⭐
**Status Atual:** ✅ Já está bom!
- `/news/slug-da-noticia` ✅
- `/downloads` ✅

**Melhorias sugeridas:**
- Criar páginas individuais para produtores: `/produtores/nome-do-produtor`
- Páginas para eventos: `/eventos/nome-do-evento`

---

### **5. Performance (Core Web Vitals)** ⭐⭐⭐⭐⭐

#### **a) Otimizar Imagens**
```typescript
// Adicionar priority nas imagens above the fold
<Image 
  src="/hero.jpg" 
  priority // ⚠️ Importante!
  alt="Maricultura AMESP"
/>
```

#### **b) Lazy Loading**
Já está implementado! ✅

#### **c) Compressão de Imagens**
- Use WebP ao invés de JPG/PNG
- Ferramentas: https://squoosh.app ou TinyPNG

---

### **6. Content SEO** ⭐⭐⭐⭐⭐

#### **Criar Mais Conteúdo:**
1. **Blog/Notícias regulares** sobre:
   - Técnicas de cultivo
   - Sustentabilidade
   - Eventos da AMESP
   - Histórias de produtores
   - Receitas com ostras/mexilhões

2. **Páginas Informativas:**
   - "O que é maricultura?"
   - "Benefícios da maricultura sustentável"
   - "Como se tornar um maricultor"
   - "Perguntas Frequentes (FAQ)"

3. **Otimizar Textos Existentes:**
   - Usar palavras-chave naturalmente
   - Títulos descritivos (H1, H2, H3)
   - Parágrafos curtos e escaneáveis

---

### **7. Links Internos** ⭐⭐⭐⭐
**O Que Fazer:**
Criar mais links entre páginas:
- Notícias linkando para produtores
- Projetos linkando para galeria
- Sobre Nós linkando para eventos

**Por quê?**
Google valoriza sites bem interligados.

---

### **8. Mobile-First** ⭐⭐⭐⭐⭐
**Status:** ✅ Site já é responsivo!

**Melhorias:**
- Testar em https://search.google.com/test/mobile-friendly
- Garantir que tudo funcione no mobile (você já está testando!)

---

### **9. Velocidade do Site** ⭐⭐⭐⭐⭐

#### **Testar em:**
- https://pagespeed.web.dev
- https://gtmetrix.com

#### **Meta: Atingir:**
- ✅ Performance: 90+
- ✅ Accessibility: 90+
- ✅ Best Practices: 90+
- ✅ SEO: 90+

---

### **10. Local SEO** ⭐⭐⭐⭐⭐ **MUITO IMPORTANTE!**

#### **a) Google Business Profile**
Criar perfil para AMESP:
1. Acesse: https://business.google.com
2. Adicione: "AMESP - Ubatuba, SP"
3. Categoria: "Organização Sem Fins Lucrativos" ou "Associação"
4. Adicione fotos, horários, descrição

#### **b) Citações Locais**
Cadastrar AMESP em:
- Google Maps ✅
- Bing Places
- Diretórios locais de Ubatuba/SP

#### **c) Schema LocalBusiness**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "AMESP",
  "image": "https://amespmaricultura.org.br/amesp_logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ubatuba",
    "addressRegion": "SP",
    "postalCode": "11680-000",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -23.4336,
    "longitude": -45.0838
  }
}
```

---

### **11. Backlinks (Links Externos)** ⭐⭐⭐⭐⭐

#### **Estratégias:**
1. **Parcerias:** Pedir para sites parceiros linkarem para AMESP
2. **Imprensa:** Divulgar eventos e conquistas em jornais locais
3. **Instituições:** Universidades, SEBRAE, órgãos governamentais
4. **Diretórios:** Cadastrar em diretórios de associações e ONGs

**Exemplos de sites para buscar backlinks:**
- Prefeitura de Ubatuba
- Secretaria de Agricultura SP
- Universidades (USP, UNESP)
- Portais de notícias de Ubatuba

---

### **12. Título e Descrição de Páginas** ⭐⭐⭐⭐

Criar metadata específica para cada página:

#### **Página de Notícias:**
```typescript
// app/news/page.tsx
export const metadata = {
  title: "Notícias - AMESP",
  description: "Últimas notícias sobre maricultura sustentável, eventos e conquistas dos maricultores de São Paulo."
}
```

#### **Página de Downloads:**
```typescript
// app/downloads/page.tsx
export const metadata = {
  title: "Downloads - AMESP",
  description: "Baixe materiais, cartilhas e documentos sobre maricultura sustentável da AMESP."
}
```

---

### **13. Alt Text em Imagens** ⭐⭐⭐⭐
**Status:** ⚠️ Precisa melhorar

**Como fazer:**
```tsx
// ❌ Evitar
<Image src="/foto.jpg" alt="foto" />

// ✅ Bom
<Image src="/cultivo-ostras.jpg" alt="Cultivo sustentável de ostras em Ubatuba pela AMESP" />
```

---

### **14. Canonical URLs** ⭐⭐⭐
**O Que Fazer:**
Adicionar em páginas duplicadas:
```typescript
export const metadata = {
  alternates: {
    canonical: 'https://amespmaricultura.org.br/pagina'
  }
}
```

---

### **15. Analytics e Tracking** ⭐⭐⭐⭐⭐

#### **a) Google Analytics 4**
```typescript
// Adicionar no layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
```

#### **b) Já tem:**
- ✅ Vercel Analytics (já configurado!)

---

## 📊 Prioridades de Implementação

### **🔥 URGENTE (Fazer Agora):**
1. ✅ Meta tags melhoradas (já fiz!)
2. ✅ Sitemap.xml (já fiz!)
3. ✅ Robots.txt (já fiz!)
4. ⏳ Criar imagem Open Graph (`og-image.jpg`)
5. ⏳ Configurar Google Search Console

### **📅 CURTO PRAZO (Próxima Semana):**
6. Schema.org (LocalBusiness + Organization)
7. Google Business Profile
8. Alt text em todas as imagens
9. Google Analytics 4

### **📆 MÉDIO PRAZO (Próximo Mês):**
10. Criar mais conteúdo (blog regular)
11. Buscar backlinks
12. Otimizar velocidade (se necessário)

---

## 🎯 Palavras-Chave Principais para AMESP

### **Primárias:**
- maricultura São Paulo
- cultivo de ostras
- cultivo de mexilhões
- aquicultura sustentável
- AMESP
- maricultores Ubatuba

### **Secundárias:**
- ostreicultura
- mitilicultura
- pesca sustentável
- litoral norte SP
- associação de maricultores
- aquicultura marinha

### **Long-tail (específicas):**
- "como cultivar ostras sustentavelmente"
- "associação de maricultores em São Paulo"
- "onde comprar ostras frescas Ubatuba"
- "cursos de maricultura SP"

---

## 🔍 Como Monitorar Resultados

### **1. Google Search Console**
- Posições no Google
- Cliques e impressões
- Palavras-chave que trazem tráfego

### **2. Vercel Analytics**
- Já configurado! ✅
- Veja em: https://vercel.com/amesp-web/amesp-rebranding/analytics

### **3. Google Analytics 4**
- Tráfego em tempo real
- Páginas mais visitadas
- Origem do tráfego (Google, redes sociais, direto)

---

## 📈 Metas de SEO

### **3 meses:**
- Aparecer na primeira página do Google para "AMESP"
- Indexar todas as páginas do site
- 50+ visitas orgânicas/mês

### **6 meses:**
- Primeira página para "maricultura São Paulo"
- 100+ visitas orgânicas/mês
- 5+ backlinks de qualidade

### **12 meses:**
- Top 3 para "maricultura litoral norte SP"
- 500+ visitas orgânicas/mês
- Autoridade de domínio crescendo

---

## ✅ Checklist de SEO (Imediato)

- [x] Meta tags otimizadas
- [x] Sitemap.xml criado
- [x] Robots.txt configurado
- [ ] Criar imagem Open Graph (1200x630px)
- [ ] Configurar Google Search Console
- [ ] Adicionar Schema.org (Organization)
- [ ] Criar Google Business Profile
- [ ] Otimizar alt text das imagens
- [ ] Configurar Google Analytics 4
- [ ] Verificar velocidade no PageSpeed Insights

---

## 🎨 Como Criar a Imagem Open Graph

### **Opção 1: Canva (Fácil)**
1. Acesse: https://canva.com
2. Crie design personalizado: 1200 x 630 px
3. Use:
   - Fundo: Gradiente oceânico (azul → cyan → teal)
   - Logo AMESP centralizada
   - Texto: "Maricultura Sustentável desde 1998"
   - Subtítulo: "Litoral Norte de São Paulo"
4. Baixe como JPG
5. Salve em `public/og-image.jpg`

### **Opção 2: Figma (Profissional)**
Similar ao Canva, mas com mais controle.

---

## 💡 Dicas Extras

### **1. Conteúdo é Rei:**
- Publique notícias regularmente (1-2 por semana)
- Conteúdo original e útil
- Mínimo 300 palavras por artigo

### **2. Mobile First:**
- Google prioriza versão mobile
- Teste tudo no celular
- Velocidade é crucial

### **3. Experiência do Usuário:**
- Site rápido = melhor SEO
- Navegação fácil = menor bounce rate
- Conteúdo relevante = mais tempo no site

### **4. Redes Sociais:**
- Compartilhe cada notícia
- Use hashtags: #Maricultura #Sustentabilidade #AMESP
- Engajamento ajuda no SEO

---

## 🚀 Implementação Rápida (10 Passos)

1. ✅ Deploy das melhorias de meta tags (aguardando...)
2. ⏳ Criar `og-image.jpg` (1200x630px)
3. ⏳ Configurar Google Search Console
4. ⏳ Adicionar Schema.org na home
5. ⏳ Otimizar alt text das imagens
6. ⏳ Criar Google Business Profile
7. ⏳ Testar velocidade no PageSpeed
8. ⏳ Configurar Google Analytics 4
9. ⏳ Submeter sitemap ao Google
10. ⏳ Começar a publicar conteúdo regular

---

## 📞 Próximos Passos

Depois que o deploy completar:
1. Teste o site em produção
2. Acesse: https://pagespeed.web.dev
3. Digite: `https://amespmaricultura.org.br`
4. Veja a pontuação de SEO
5. Implemente as sugestões acima

---

✨ **Com essas melhorias, o site da AMESP terá excelente SEO e aparecerá bem no Google!**

---

## 🔄 Migração de Domínio: Vercel → amespmaricultura.org.br

### **Passo a Passo da Migração:**

#### **1. Configurar Domínio na Vercel**
1. Acesse: https://vercel.com/amesp-web/amesp-rebranding/settings/domains
2. Clique em "Add Domain"
3. Digite: `amespmaricultura.org.br`
4. A Vercel mostrará registros DNS para configurar

#### **2. Configurar DNS na Hostinger**
1. Acesse o painel da Hostinger
2. Vá em **Domínios** → **amespmaricultura.org.br** → **DNS**
3. Adicione os registros que a Vercel solicitou:
   - **Tipo A:** Apontando para os IPs da Vercel
   - **Tipo CNAME:** `www` apontando para `cname.vercel-dns.com`

#### **3. Aguardar Propagação**
- Tempo: 24-48 horas (geralmente 1-2 horas)
- Verificar em: https://dnschecker.org

#### **4. Atualizar Variáveis de Ambiente**

**Na Vercel**, atualizar:
```
NEXT_PUBLIC_SITE_URL=https://amespmaricultura.org.br
```

**E remover** (se tiver):
```
NEXT_PUBLIC_SITE_URL=https://amesp-rebranding.vercel.app
```

#### **5. Implementar SEO Completo**
Seguir **TODAS** as instruções deste guia com o domínio oficial.

#### **6. Configurar Redirects (Importante!)**

Se o site antigo em amespmaricultura.org.br tem páginas importantes, criar redirects:

Criar arquivo `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

#### **7. Google Search Console**
- Adicionar **DOIS** domínios:
  - `https://amespmaricultura.org.br`
  - `https://www.amespmaricultura.org.br`
- Submeter sitemap para ambos

---

## ⚠️ Checklist Pós-Migração

Após migrar para amespmaricultura.org.br:

- [ ] Testar TODAS as páginas no novo domínio
- [ ] Verificar se SSL está ativo (cadeado verde)
- [ ] Testar sistema de email (NEXT_PUBLIC_SITE_URL correto)
- [ ] Atualizar meta tags com novo domínio
- [ ] Criar e configurar robots.txt
- [ ] Criar e testar sitemap.xml
- [ ] Submeter sitemap no Google Search Console
- [ ] Criar imagem Open Graph
- [ ] Configurar Google Analytics 4
- [ ] Testar compartilhamento em redes sociais
- [ ] Verificar se site antigo tem redirects configurados

---

## 🎯 Timeline Sugerida

### **Semana 1: Migração Técnica**
- Configurar domínio na Vercel
- Configurar DNS na Hostinger
- Aguardar propagação
- Testar site no novo domínio

### **Semana 2: SEO Básico**
- Implementar meta tags
- Criar robots.txt e sitemap
- Configurar Google Search Console
- Criar imagem Open Graph

### **Semana 3: SEO Avançado**
- Schema.org (Organization)
- Google Business Profile
- Otimizar imagens
- Google Analytics

### **Mês 2: Conteúdo e Backlinks**
- Publicar conteúdo regular
- Buscar backlinks
- Monitorar resultados

---

✨ **Quando migrar para amespmaricultura.org.br, use este guia completo para implementar todo o SEO de uma vez só!**

