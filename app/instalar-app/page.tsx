import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Monitor, Smartphone, Share } from "lucide-react"

export const metadata = {
  title: "Instalar o app AMESP",
  description: "Como instalar o site AMESP no celular ou no computador como aplicativo.",
}

export default function InstalarAppPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Button variant="ghost" asChild className="mb-8 -ml-2">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">Instalar o app AMESP</h1>
        <p className="text-muted-foreground mb-6">
          O botão de instalar <strong>não fica dentro do site</strong>. Ele fica no seu navegador. No iPhone não &quot;baixa&quot; nada: um ícone do AMESP é adicionado na tela inicial e, ao tocar, o site abre como app.
        </p>

        <div className="space-y-10">
          {/* iPhone em destaque */}
          <section className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Smartphone className="h-5 w-5" />
              No iPhone (Chrome ou Safari)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Se você está no <strong>Chrome</strong>: toque nos <strong>três pontinhos (⋮)</strong> (canto inferior direito) → procure <strong>&quot;Adicionar à tela inicial&quot;</strong> ou <strong>&quot;Adicionar à Tela de Início&quot;</strong>. Se não aparecer, use o Safari (passo abaixo).
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              No <strong>Safari</strong> (recomendado no iPhone):
            </p>
            <ul className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima), na barra do navegador.</li>
              <li>Role para baixo e toque em <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</li>
              <li>Toque em &quot;Adicionar&quot; no canto superior direito.</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Dica: copie o endereço desta página, abra o <strong>Safari</strong>, cole o endereço e depois use Compartilhar → Adicionar à Tela de Início.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Monitor className="h-5 w-5" />
              No computador (Chrome ou Edge)
            </h2>
            <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Olhe no <strong>canto direito da barra de endereço</strong> (onde fica o cadeado). Quando o site for instalável, aparece um ícone de instalação (quadrado com seta). Clique nele e depois em &quot;Instalar&quot;.</li>
              <li>Ou clique nos <strong>três pontinhos (⋮)</strong> no canto superior direito → &quot;Instalar AMESP...&quot; ou &quot;Adicionar ao Chrome&quot;.</li>
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
              <Smartphone className="h-5 w-5" />
              No celular Android (Chrome)
            </h2>
            <ul className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Toque nos <strong>três pontinhos (⋮)</strong> no navegador.</li>
              <li>Toque em <strong>&quot;Adicionar à tela inicial&quot;</strong> ou <strong>&quot;Instalar app&quot;</strong>.</li>
            </ul>
          </section>

          <section className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold mb-2">Testar no celular</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Com o site rodando no seu computador, use no terminal: <code className="bg-muted px-1 rounded">npm run dev:mobile</code>. Veja o IP do seu computador (ex.: 192.168.0.10) e no celular (mesmo Wi‑Fi) acesse: <code className="bg-muted px-1 rounded">http://SEU_IP:3002</code>.
            </p>
            <p className="text-sm text-muted-foreground">
              Recarregue a página se a opção de instalar não aparecer. O navegador só mostra quando o site está em HTTPS (produção) ou acessível na rede (dev:mobile).
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Button asChild>
            <Link href="/">Ir para o site AMESP</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
