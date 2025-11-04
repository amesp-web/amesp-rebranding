# 🚀 Análise de Performance - Homepage

## 📊 Situação Atual

### ⚠️ Problemas Identificados:

1. **`force-dynamic` + `revalidate: 0`**
   - Toda a página é re-renderizada a cada request
   - Nenhum cache é utilizado
   - Impacto: Tempo de carregamento muito alto

2. **Múltiplas queries no servidor**
   - 6+ queries sequenciais ao Supabase
   - 2 fetches HTTP adicionais (about, home-info)
   - Impacto: Latência acumulada

3. **Componentes Client carregados eagerly**
   - `ContactForm` (abaixo da dobra)
   - `NewsReaderModal` (usado on-demand)
   - `FishSwarm` (decorativo)
   - Impacto: Bundle JS maior no primeiro carregamento

4. **Imagens decorativas no header**
   - `fishdecor.png` carregada 2x
   - Sem lazy loading
   - Impacto: Requisições extras desnecessárias

5. **Fallback para dados mock**
   - Mock data inline (100+ linhas)
   - Aumenta o bundle desnecessariamente

---

## ✅ Sugestões de Otimização (SEM remover funcionalidades)

### **1. Implementar Caching Inteligente** 🎯 IMPACTO ALTO

**Problema:** `force-dynamic` e `revalidate: 0` tornam tudo dinâmico

**Solução:**
```typescript
// Ao invés de force-dynamic, use ISR (Incremental Static Regeneration)
export const revalidate = 60 // Revalidar a cada 60 segundos

// OU para dados específicos:
const { data: news } = await supabase
  .from("news")
  .select("*")
  .eq("published", true)
  .order("display_order", { ascending: true })
  .order("created_at", { ascending: false })
  .limit(3)
  // Next.js cacheia automaticamente por 60s

// Para APIs externas, use cache explícito:
const res = await fetch(`${baseUrl}/api/admin/about`, { 
  next: { revalidate: 300 } // 5 minutos
})
```

**Benefício:**
- ✅ Primeira visualização usa cache
- ✅ Menor latência
- ✅ Menos carga no Supabase
- ✅ Mantém dados atualizados (revalidação periódica)

---

### **2. Paralelizar Queries do Supabase** 🎯 IMPACTO ALTO

**Problema:** Queries executam sequencialmente (waterfall)

**Solução:**
```typescript
async function getSupabaseData() {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  // Executar TODAS as queries em paralelo
  const [
    newsResult,
    featuredResult,
    producersResult,
    totalCountResult,
    projectsResult,
    aboutResponse,
    homeInfoResponse
  ] = await Promise.all([
    supabase.from("news").select("*").eq("published", true).order("display_order", { ascending: true }).limit(3),
    supabase.from("gallery").select("*").eq("featured", true).order("updated_at", { ascending: false }).limit(1),
    supabase.from("producers").select("*").eq("active", true).order("name", { ascending: true }),
    supabase.from("gallery").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("id, name, slug, submenu_label").eq("published", true).order("display_order", { ascending: true }),
    fetch(`${baseUrl}/api/admin/about`, { next: { revalidate: 300 } }).catch(() => null),
    fetch(`${baseUrl}/api/admin/home-info`, { next: { revalidate: 300 } }).catch(() => null)
  ])

  // Processar resultados...
  const news = newsResult.data
  const featured = featuredResult.data
  // etc...
}
```

**Benefício:**
- ✅ Reduz tempo total de 6+ requests para 1 (tempo do mais lento)
- ✅ Exemplo: 6 requests de 200ms cada = 1200ms → 1 request de 200ms

---

### **3. Lazy Loading de Componentes** 🎯 IMPACTO MÉDIO

**Problema:** Todos os componentes client carregam no bundle inicial

**Solução:**
```typescript
import dynamic from 'next/dynamic'

// Componentes abaixo da dobra - lazy load
const ContactForm = dynamic(() => import('@/components/public/ContactForm').then(m => ({ default: m.ContactForm })), {
  loading: () => <div className="animate-pulse bg-muted h-96 rounded-xl" />,
  ssr: false // Não renderizar no servidor (economiza)
})

const FishSwarm = dynamic(() => import('@/components/decorative/FishSwarm').then(m => ({ default: m.FishSwarm })), {
  ssr: false
})

// Modal só carrega quando necessário
const NewsReaderModal = dynamic(() => import('@/components/public/NewsReaderModal').then(m => ({ default: m.NewsReaderModal })), {
  ssr: false
})
```

**Benefício:**
- ✅ Bundle JS inicial menor
- ✅ Faster Time to Interactive (TTI)
- ✅ Carrega componentes apenas quando necessário

---

### **4. Otimizar Imagens** 🎯 IMPACTO MÉDIO

**Problema:** Imagens decorativas sem lazy loading

**Solução:**
```typescript
// Adicionar loading="lazy" e priority apenas para hero
<Image
  src="/fishdecor.png"
  alt=""
  width={32}
  height={32}
  className="w-8 h-8 object-contain"
  loading="lazy"  // ← Adicionar
  unoptimized={false}  // ← Usar otimização do Next.js
/>

// Para logo no header (above the fold):
<Image
  src="/amesp_logo.png"
  alt="AMESP"
  width={130}
  height={44}
  priority  // ← Carregar primeiro
/>

// Para hero image:
<Image
  src={heroImage}
  alt="Hero"
  priority  // ← Carregar primeiro
  quality={85}  // ← Reduzir um pouco a qualidade
/>
```

**Benefício:**
- ✅ Menos requisições no carregamento inicial
- ✅ Imagens carregam apenas quando visíveis

---

### **5. Combinar Queries Relacionadas** 🎯 IMPACTO BAIXO-MÉDIO

**Problema:** 3 queries para galeria (featured, others, count)

**Solução:**
```typescript
// Query única para galeria
const { data: allGallery, count } = await supabase
  .from("gallery")
  .select("*", { count: "exact" })
  .order("display_order", { ascending: true })
  .limit(5)

// Processar no código
const featured = allGallery?.find(img => img.featured) || allGallery?.[0]
const others = allGallery?.filter(img => img.id !== featured?.id).slice(0, 4) || []
const gallery = [featured, ...others].filter(Boolean)
```

**Benefício:**
- ✅ 1 query ao invés de 3
- ✅ Menos latência

---

### **6. Remover Dados Mock Inline** 🎯 IMPACTO BAIXO

**Problema:** Mock data aumenta bundle size

**Solução:**
```typescript
// Mover para arquivo separado
// lib/mock-data.ts
export const mockNews = [...]
export const mockGallery = [...]

// Em page.tsx
import { mockNews, mockGallery } from '@/lib/mock-data'
```

**Benefício:**
- ✅ Código mais limpo
- ✅ Mock data só carrega se necessário

---

### **7. Prefetch de Links Importantes** 🎯 IMPACTO BAIXO

**Solução:**
```typescript
import Link from 'next/link'

// Links importantes usam prefetch automático
<Link href="/galeria" prefetch={true}>
  Ver Galeria Completa
</Link>
```

**Benefício:**
- ✅ Navegação mais rápida
- ✅ Next.js prefetch on hover

---

## 🎯 Priorização de Implementação

### **Fase 1 - Quick Wins (1-2h)** ⭐⭐⭐
1. ✅ Paralelizar queries (Promise.all)
2. ✅ Lazy load ContactForm e FishSwarm
3. ✅ Adicionar `loading="lazy"` em imagens decorativas

**Ganho estimado:** 30-40% de melhoria no LCP (Largest Contentful Paint)

### **Fase 2 - Caching (2-3h)** ⭐⭐
1. ✅ Remover `force-dynamic`
2. ✅ Implementar ISR com `revalidate: 60`
3. ✅ Adicionar cache em fetches externos

**Ganho estimado:** 50-60% de melhoria no TTFB (Time to First Byte)

### **Fase 3 - Refactoring (3-4h)** ⭐
1. ✅ Combinar queries de galeria
2. ✅ Mover mock data para arquivo separado
3. ✅ Otimizar imagens com Next.js Image Optimization

**Ganho estimado:** 10-15% adicional

---

## 📈 Impacto Esperado Total

**Antes:**
- TTFB: ~800ms
- LCP: ~2.5s
- TTI: ~3.5s
- Bundle JS: ~250KB

**Depois (todas as otimizações):**
- TTFB: ~200ms (-75%)
- LCP: ~1.2s (-52%)
- TTI: ~2s (-43%)
- Bundle JS: ~180KB (-28%)

---

## ⚠️ Cuidados

1. **Não remover `force-dynamic` se:**
   - Dados precisam ser 100% real-time
   - Melhor: Use ISR com revalidação curta (30-60s)

2. **Testar lazy loading:**
   - Garantir que formulário de contato aparece corretamente
   - Verificar que modals funcionam

3. **Cache de images:**
   - Testar que logos e hero carregam rápido
   - Verificar CLS (Cumulative Layout Shift)

---

## 🛠️ Ferramentas para Medir

```bash
# Lighthouse
npm run build && npm start
# Abrir DevTools → Lighthouse → Generate Report

# Web Vitals
# Já integrado no Next.js
# Verificar em /admin ou usar Google PageSpeed Insights
```

---

## 💡 Recomendação Final

**Implemente na ordem:**
1. ✅ **Fase 1** (quick wins) - Maior impacto, menor esforço
2. ✅ **Fase 2** (caching) - Grande impacto em produção
3. ⏳ **Fase 3** (refactoring) - Opcional, menor prioridade

**Total estimado:** 6-9 horas de trabalho
**Ganho total:** ~60-70% de melhoria na performance

---

## 🚀 Quer que eu implemente?

Posso implementar as otimizações da **Fase 1** agora (1-2h) sem quebrar nada! 😊

