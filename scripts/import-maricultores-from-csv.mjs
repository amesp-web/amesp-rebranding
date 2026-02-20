#!/usr/bin/env node
/**
 * Script para importar maricultores do CSV para o banco
 * 
 * Uso: node scripts/import-maricultores-from-csv.mjs
 * 
 * Requisitos:
 * - Arquivo CSV em /Users/macbookair/Downloads/maricultor_profiles_rows (1).csv
 * - Variáveis de ambiente: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * - Opcional: GEOAPIFY_API_KEY para geocodificação
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const CSV_PATH = '/Users/macbookair/Downloads/maricultor_profiles_rows (1).csv';

// Funções de normalização
function normalizePhone(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '').trim();
  if (cleaned.length < 10) return null;
  // Formatar: (XX) XXXXX-XXXX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return cleaned;
}

function normalizeCPF(cpf) {
  if (!cpf) return null;
  const cleaned = String(cpf).replace(/\D/g, '').trim();
  return cleaned.length === 11 ? cleaned : null;
}

function normalizeCoordinates(lat, lon) {
  let latNum = null, lonNum = null;
  if (lat) {
    const latStr = String(lat).replace(/[°\s]/g, '').trim();
    latNum = parseFloat(latStr);
    if (isNaN(latNum)) latNum = null;
  }
  if (lon) {
    const lonStr = String(lon).replace(/[°\s]/g, '').trim();
    lonNum = parseFloat(lonStr);
    if (isNaN(lonNum)) lonNum = null;
  }
  return { lat: latNum, lon: lonNum };
}

// Login do maricultor = telefone + senha. Auth "email" = 5511999999999@maricultor.amesp
function phoneToAuthEmail(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '').trim();
  if (digits.length < 10) return null;
  const withCountry = digits.length >= 12 && digits.startsWith('55') ? digits : (digits.length === 11 || digits.length === 10 ? '55' + digits : digits);
  return withCountry.length >= 10 ? `${withCountry}@maricultor.amesp` : null;
}

// Fallback quando não tem telefone: placeholder para admin preencher depois.
function generateEmail(fullName, lineIndex) {
  if (!fullName) return null;
  const nameSlug = String(fullName)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .slice(0, 25);
  const suffix = String(lineIndex).padStart(3, '0');
  return `${nameSlug}.${suffix}@maricultor.amesp.temp`;
}

const DEFAULT_PASSWORD_WHEN_NO_CPF = 'amesp01';

async function geocodeAddress(logradouro, cidade, estado, cep) {
  const apiKey = process.env.GEOAPIFY_API_KEY || process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEOAPIFY_API_KEY não configurada. Pulando geocodificação.');
    return { lat: null, lon: null };
  }
  
  try {
    const parts = [logradouro, cidade, estado, 'Brasil'].filter(Boolean);
    const text = parts.join(', ');
    const cleanCep = cep ? String(cep).replace(/\D/g, '') : '';
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&limit=1&lang=pt&filter=countrycode:br${cleanCep ? `&postcode=${cleanCep}` : ''}&apiKey=${apiKey}`;
    
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    
    const p = data?.features?.[0]?.properties;
    const lat = p?.lat ?? data?.features?.[0]?.geometry?.coordinates?.[1] ?? null;
    const lon = p?.lon ?? data?.features?.[0]?.geometry?.coordinates?.[0] ?? null;
    
    return { lat, lon };
  } catch (err) {
    console.error('❌ Erro ao geocodificar:', err.message);
    return { lat: null, lon: null };
  }
}

async function main() {
  console.log('📊 Iniciando importação de maricultores do CSV...\n');
  
  // Ler CSV
  const csvContent = readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(';');
  
  console.log(`📋 Total de linhas: ${lines.length - 1} (excluindo header)`);
  console.log(`📋 Colunas: ${headers.join(', ')}\n`);
  
  // Configurar Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  // Processar linhas
  const results = { success: 0, skipped: 0, errors: [] };
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(';');
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() || '';
    });
    
    const fullName = row.full_name?.trim();
    if (!fullName) {
      console.log(`⏭️  Linha ${i + 1}: Sem nome, pulando...`);
      results.skipped++;
      continue;
    }
    
    console.log(`\n[${i}/${lines.length - 1}] Processando: ${fullName}`);
    
    try {
      // Normalizar dados
      const cpf = normalizeCPF(row.cpf);
      const phone = normalizePhone(row.contact_phone);
      const { lat: latFromCsv, lon: lonFromCsv } = normalizeCoordinates(row.latitude, row.longitude);
      
      const cidade = row.cidade?.trim() || null;
      const estado = row.estado?.trim() || null;
      const logradouro = row.logradouro?.trim() || row.farm_address?.trim() || null;
      const cep = row.cep?.replace(/\D/g, '').trim() || null;
      const company = row.company?.trim() || row.farm_name?.trim() || null;
      const specialties = row.specialties?.trim() || row.production_type?.trim() || null;
      const showOnMap = row['Mapa ']?.toLowerCase().trim() === 'sim';
      const isActive = row.is_active !== 'false';
      
      // Carga completa: com telefone = login por telefone; sem telefone = placeholder (admin edita depois)
      const authEmail = phone ? phoneToAuthEmail(phone) : generateEmail(fullName, i);
      
      // Geocodificar se não tiver coordenadas
      let lat = latFromCsv;
      let lon = lonFromCsv;
      if ((!lat || !lon) && (logradouro || cidade || estado || cep)) {
        console.log('  🗺️  Geocodificando endereço...');
        const geo = await geocodeAddress(logradouro, cidade, estado, cep);
        if (geo.lat && geo.lon) {
          lat = geo.lat;
          lon = geo.lon;
          console.log(`  ✅ Coordenadas: ${lat}, ${lon}`);
        } else {
          console.log('  ⚠️  Não foi possível geocodificar');
        }
      }
      
      // Verificar se já existe (por CPF ou id)
      let userId = row.id?.trim() || null;
      
      if (!userId && cpf) {
        const { data: existing } = await supabase
          .from('maricultor_profiles')
          .select('id')
          .eq('cpf', cpf)
          .maybeSingle();
        if (existing) {
          userId = existing.id;
          console.log(`  ℹ️  Encontrado por CPF, usando id existente: ${userId}`);
        }
      }
      
      // Criar usuário se não existir; se já existir (re-execução), buscar id e atualizar perfil
      if (!userId) {
        const password = cpf ? cpf.substring(0, 6) : DEFAULT_PASSWORD_WHEN_NO_CPF;
        console.log(`  👤 Criando usuário: ${phone ? 'telefone (login)' : 'placeholder'} ${!cpf ? '(sem CPF – senha padrão)' : ''}`);
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: authEmail,
          password,
          email_confirm: true,
          user_metadata: {
            name: fullName,
            phone: phone || null,
            company: company || null,
            specialties: specialties || null,
            user_type: 'maricultor',
            cpf: cpf || null,
          }
        });
        
        if (authError) {
          const isDuplicate = /already been registered|already exists|duplicate/i.test(authError.message);
          if (isDuplicate) {
            const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
            const existing = listData?.users?.find((u) => u.email === authEmail);
            if (existing) {
              userId = existing.id;
              console.log(`  ℹ️  Usuário já existe (re-execução), usando id: ${userId}`);
            } else {
              throw new Error(`Erro ao criar usuário: ${authError.message}`);
            }
          } else {
            throw new Error(`Erro ao criar usuário: ${authError.message}`);
          }
        } else {
          userId = authData.user.id;
          console.log(`  ✅ Usuário criado: ${userId}`);
        }
      }
      
      // Inserir/atualizar perfil (campos vazios = cliente preenche depois no admin)
      const profileData = {
        id: userId,
        full_name: fullName,
        cpf: cpf || null,
        contact_phone: phone || null,
        logradouro: logradouro || null,
        cidade: cidade || null,
        estado: estado || null,
        cep: cep || null,
        company: company || null,
        specialties: specialties || null,
        latitude: lat || null,
        longitude: lon || null,
        is_active: isActive,
        show_on_map: showOnMap !== false,
        updated_at: new Date().toISOString(),
      };
      
      const { error: profileError } = await supabase
        .from('maricultor_profiles')
        .upsert(profileData, { onConflict: 'id' });
      
      if (profileError) {
        throw new Error(`Erro ao salvar perfil: ${profileError.message}`);
      }
      
      console.log(`  ✅ Perfil salvo com sucesso!`);
      results.success++;
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`  ❌ Erro: ${err.message}`);
      results.errors.push({ line: i + 1, name: fullName, error: err.message });
    }
  }
  
  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA IMPORTAÇÃO');
  console.log('='.repeat(60));
  console.log(`✅ Sucesso: ${results.success}`);
  console.log(`⏭️  Pulados: ${results.skipped}`);
  console.log(`❌ Erros: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Erros detalhados:');
    results.errors.forEach(e => {
      console.log(`  Linha ${e.line} (${e.name}): ${e.error}`);
    });
  }
  
  console.log('\n✨ Importação concluída!');
}

main().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
