# Importação de Maricultores via CSV

Script para importar maricultores do arquivo CSV para o banco de dados.

## 📋 Pré-requisitos

1. **Arquivo CSV** em `/Users/macbookair/Downloads/maricultor_profiles_rows (1).csv`
2. **Variáveis de ambiente** configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEOAPIFY_API_KEY` (opcional, para geocodificação de endereços)

## 🚀 Como usar

```bash
# No diretório raiz do projeto
node scripts/import-maricultores-from-csv.mjs
```

## 📊 O que o script faz

1. **Lê o CSV** linha por linha
2. **Normaliza dados:**
   - Telefone: formata para (XX) XXXXX-XXXX
   - CPF: remove formatação, valida 11 dígitos
   - Coordenadas: remove símbolo ° e converte para número
3. **Cria usuário para todas as linhas com nome** (carga completa; admin edita depois o que faltar):
   - **Com telefone:** login = telefone (55DDD...@maricultor.amesp) + senha = 6 primeiros do CPF (ou amesp01 se sem CPF)
   - **Sem telefone:** e-mail placeholder (ex.: nome.001@maricultor.amesp.temp) + senha amesp01 → admin preenche telefone na edição e o acesso passa a ser por telefone
   - O cliente pode completar CPF, email real e demais dados depois no admin (ou o maricultor via “esqueci a senha” / edição)
4. **Geocodifica endereços** (se não tiver lat/long):
   - Usa Geoapify API para buscar coordenadas
   - Requer `GEOAPIFY_API_KEY` configurada
5. **Insere/atualiza** em `maricultor_profiles`:
   - Se já existir (por CPF ou id), atualiza
   - Se não existir, cria novo registro

## 📝 Mapeamento de colunas

| CSV | Campo no banco | Observações |
|-----|----------------|-------------|
| `full_name` | `full_name` | Obrigatório |
| `cpf` | `cpf` | Normalizado (11 dígitos) |
| `contact_phone` | `contact_phone` | Formatado |
| `farm_name` ou `company` | `company` | Nome da fazenda/empresa |
| `production_type` ou `specialties` | `specialties` | Tipo de produção |
| `cidade` | `cidade` | |
| `estado` | `estado` | |
| `logradouro` ou `farm_address` | `logradouro` | |
| `cep` | `cep` | Normalizado (apenas dígitos) |
| `latitude` | `latitude` | Normalizado (remove °) |
| `longitude` | `longitude` | Normalizado (remove °) |
| `Mapa` | `show_on_map` | "sim" = true, outros = false |
| `is_active` | `is_active` | Default: true |

## ⚠️ Observações

- **Login por telefone:** Maricultores acessam com **telefone (com DDD)** e **senha = 6 primeiros dígitos do CPF**. Não usam e-mail para login.
- **Carga:** Linhas com telefone criam usuário com login = telefone. Sem telefone usa placeholder até o admin preencher.
- **Geocodificação:** Só funciona se `GEOAPIFY_API_KEY` estiver configurada.
- **Duplicatas:** O script verifica por CPF (ou id) antes de criar usuário novo.
- **Atualização:** Se já existir perfil (por id ou CPF), atualiza em vez de criar duplicado.

## 📈 Exemplo de saída

```
📊 Iniciando importação de maricultores do CSV...

📋 Total de linhas: 67 (excluindo header)

[1/67] Processando: Adriana Silva de Jesus
  👤 Criando usuário: adriana.silva.de.jesus.1728@maricultor.amesp.temp
  ✅ Usuário criado: abc123...
  ✅ Perfil salvo com sucesso!

[2/67] Processando: Angélica de Souza
  👤 Criando usuário: angelica.de.souza.002@maricultor.amesp.temp (sem CPF – senha padrão)
  ✅ Usuário criado: def456...
  ✅ Perfil salvo com sucesso!

...

============================================================
📊 RESUMO DA IMPORTAÇÃO
============================================================
✅ Sucesso: 67
⏭️  Pulados: 0
❌ Erros: 0

✨ Importação concluída!
```
