import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Company, 
  FiscalDocument, 
  AccountingEntry, 
  AccountingAccount, 
  Employee, 
  PayrollPayslip, 
  Partner, 
  ProfitDistributionRecord, 
  TaxObligation,
  AccountingParameters,
  SystemCustomization,
  SystemUser,
  UserActivityBacklog
} from '../types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rtfwrzuacelrxxbfpxow.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZndyenVhY2Vscnh4YmZweG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTU3MjAsImV4cCI6MjEwNDIzMTcyMH0.-HUFliYkdckOtBvqF_HaApIW4JCuSDL3SwFV6x0ciRs';
export const SUPABASE_DB_URL = 'postgresql://postgres:5TUB6q3KtmKOA4dE@db.rtfwrzuacelrxxbfpxow.supabase.co:5432/postgres';
export const SUPABASE_PROJECT_ID = 'rtfwrzuacelrxxbfpxow';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseHealthStatus {
  connected: boolean;
  latencyMs: number;
  projectUrl: string;
  projectId: string;
  timestamp: string;
  error?: string;
}

export interface SyncProgressItem {
  table: string;
  label: string;
  count: number;
  status: 'pending' | 'syncing' | 'success' | 'skipped' | 'error';
  message?: string;
}

/**
 * Extrai a mensagem de erro exata retornada pelo Supabase (PostgREST ou Postgres)
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const obj = err as Record<string, any>;
    const parts: string[] = [];
    if (obj.message) parts.push(obj.message);
    if (obj.details && obj.details !== obj.message) parts.push(obj.details);
    if (obj.hint) parts.push(`Dica: ${obj.hint}`);
    if (obj.code) parts.push(`(Código: ${obj.code})`);
    if (parts.length > 0) return parts.join(' | ');
    if (obj.error_description) return obj.error_description;
    try {
      return JSON.stringify(err);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Testa conectividade com a API REST do Supabase e mede a latência
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthStatus> {
  const start = performance.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      return {
        connected: true,
        latencyMs,
        projectUrl: SUPABASE_URL,
        projectId: SUPABASE_PROJECT_ID,
        timestamp: new Date().toISOString(),
      };
    } else {
      return {
        connected: false,
        latencyMs,
        projectUrl: SUPABASE_URL,
        projectId: SUPABASE_PROJECT_ID,
        timestamp: new Date().toISOString(),
        error: `Resposta HTTP status ${res.status}: ${res.statusText}`,
      };
    }
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: false,
      latencyMs,
      projectUrl: SUPABASE_URL,
      projectId: SUPABASE_PROJECT_ID,
      timestamp: new Date().toISOString(),
      error: extractErrorMessage(err, 'Falha na comunicação com o Supabase'),
    };
  }
}

/**
 * Script de Migração Incremental SQL (Fase 3) para o Supabase.
 * Cria EXCLUSIVAMENTE as novas 4 tabelas da Fase 3 sem alterar ou apagar as tabelas existentes (1 a 9).
 * Instrução: Cole este script no SQL Editor do seu Dashboard Supabase e clique em RUN.
 */
export function generatePhase3MigrationSql(): string {
  return `-- ==============================================================================
-- MIGRAÇÃO FASE 3: PARÂMETROS DO ESPECIALISTA, WHITE-LABEL, RBAC & AUDITORIA
-- Projeto: ${SUPABASE_PROJECT_ID}
-- Data: ${new Date().toLocaleDateString('pt-BR')}
-- Instrução: Cole este script no SQL Editor do Supabase e clique em "RUN".
-- Este script é NÃO-DESTRUTIVO: preserva todas as empresas, notas, diário e folha.
-- ==============================================================================

-- 10. Parâmetros Contábeis & Fiscais do Especialista
CREATE TABLE IF NOT EXISTS public.accounting_parameters (
  id TEXT PRIMARY KEY DEFAULT 'params-global',
  company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL,
  -- Contas Padrão para Contabilização Automática
  conta_vendas_mercadorias TEXT DEFAULT '3.1.01.01.001',
  conta_prestacao_servicos TEXT DEFAULT '3.1.01.02.001',
  conta_clientes TEXT DEFAULT '1.1.02.01.001',
  conta_fornecedores TEXT DEFAULT '2.1.02.01.001',
  conta_estoque_mercadorias TEXT DEFAULT '1.1.03.01.001',
  conta_cmv TEXT DEFAULT '4.1.01.01.001',
  conta_salarios_a_pagar TEXT DEFAULT '2.1.03.01.001',
  conta_despesa_salarios TEXT DEFAULT '4.2.01.01.001',
  conta_inss_a_pagar TEXT DEFAULT '2.1.03.02.001',
  conta_fgts_a_pagar TEXT DEFAULT '2.1.03.03.001',
  conta_prolabore_a_pagar TEXT DEFAULT '2.1.03.04.001',
  conta_despesa_prolabore TEXT DEFAULT '4.2.01.02.001',
  conta_lucros_acumulados TEXT DEFAULT '2.3.02.01.001',
  conta_impostos_simples TEXT DEFAULT '2.1.04.01.001',
  conta_pis_a_pagar TEXT DEFAULT '2.1.04.02.001',
  conta_cofins_a_pagar TEXT DEFAULT '2.1.04.03.001',
  conta_irpj_a_pagar TEXT DEFAULT '2.1.04.04.001',
  conta_csll_a_pagar TEXT DEFAULT '2.1.04.05.001',
  -- Parâmetros Tributários & Presunção
  percentual_presuncao_comercio NUMERIC(6, 2) DEFAULT 8.00,
  percentual_presuncao_servico NUMERIC(6, 2) DEFAULT 32.00,
  aliquota_irpj_base NUMERIC(6, 2) DEFAULT 15.00,
  adicional_irpj_limite_mensal NUMERIC(15, 2) DEFAULT 20000.00,
  aliquota_adicional_irpj NUMERIC(6, 2) DEFAULT 10.00,
  aliquota_csll_base NUMERIC(6, 2) DEFAULT 9.00,
  aliquota_pis_cumulativo NUMERIC(6, 2) DEFAULT 0.65,
  aliquota_cofins_cumulativo NUMERIC(6, 2) DEFAULT 3.00,
  -- Simples Nacional & Fator R
  fator_r_limite_percent NUMERIC(6, 2) DEFAULT 28.00,
  -- Travas de Segurança Contábil
  bloquear_lancamentos_retroativos BOOLEAN DEFAULT false,
  exigir_partidas_dobradas_estritas BOOLEAN DEFAULT true,
  -- Parâmetros SPED / ECD & Signatário
  plano_referencial_rfb TEXT DEFAULT 'PJ_GERAL',
  versao_leiaute_ecd TEXT DEFAULT '9.00',
  versao_leiaute_efd TEXT DEFAULT '017',
  qualificacao_signatario TEXT DEFAULT '900 - Contador',
  crc_contador_responsavel TEXT DEFAULT 'SP-123456/O-0',
  nome_contador_responsavel TEXT DEFAULT 'Carlos Mendes & Associados Contabilidade',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Personalização Visual, Branding White-Label & Landing Page
CREATE TABLE IF NOT EXISTS public.system_customization (
  id TEXT PRIMARY KEY,
  system_name TEXT NOT NULL,
  system_tagline TEXT,
  short_name TEXT,
  office_display_name TEXT,
  cnpj TEXT,
  crc TEXT,
  primary_theme_color TEXT DEFAULT 'blue',
  support_email TEXT,
  support_phone TEXT,
  landing_page JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Gestão de Usuários & Perfis RBAC (Administrador, Analista, Operador)
CREATE TABLE IF NOT EXISTS public.system_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  department TEXT,
  active BOOLEAN DEFAULT true,
  avatar_color TEXT DEFAULT 'blue',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Backlog de Atividades & Trilha de Auditoria Contábil
CREATE TABLE IF NOT EXISTS public.user_activity_backlog (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip TEXT DEFAULT '127.0.0.1',
  status TEXT NOT NULL DEFAULT 'SUCESSO'
);

-- Permissões totais para anon, authenticated e service_role
GRANT ALL ON TABLE public.accounting_parameters TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.system_customization TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.system_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_activity_backlog TO anon, authenticated, service_role;

-- Habilitar Políticas RLS
ALTER TABLE public.accounting_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_backlog ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_parameters' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.accounting_parameters FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_customization' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.system_customization FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_users' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.system_users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_backlog' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.user_activity_backlog FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;
}

/**
 * Script DDL completo em SQL para criação e configuração do schema contábil no Supabase (Todas as 13 tabelas).
 * Inclui DROP CASCADE para garantir que colunas de versões anteriores sejam perfeitamente alinhadas,
 * bem como GRANTs explícitos para o papel 'anon' e 'authenticated'.
 */
export function generateSupabaseSqlDDL(): string {
  return `-- ==============================================================================
-- SCHEMA CONTÁBIL, FISCAL, FOLHA & FASE 3 COMPLETO - SUPABASE (POSTGRESQL)
-- Projeto: ${SUPABASE_PROJECT_ID}
-- Data de Geração: ${new Date().toLocaleDateString('pt-BR')}
-- Instrução: Cole este script no SQL Editor do seu Dashboard Supabase e clique em RUN.
-- Contém todas as 13 tabelas relacionais do sistema.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Limpeza prévia para garantir recriação idêntica do schema
DROP TABLE IF EXISTS public.user_activity_backlog CASCADE;
DROP TABLE IF EXISTS public.system_users CASCADE;
DROP TABLE IF EXISTS public.system_customization CASCADE;
DROP TABLE IF EXISTS public.accounting_parameters CASCADE;
DROP TABLE IF EXISTS public.tax_obligations CASCADE;
DROP TABLE IF EXISTS public.profit_distributions CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.payroll_payslips CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.accounting_entries CASCADE;
DROP TABLE IF EXISTS public.accounting_accounts CASCADE;
DROP TABLE IF EXISTS public.fiscal_documents CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- 1. Empresas Cadastradas (Multi-tenant)
CREATE TABLE public.companies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT NOT NULL UNIQUE,
  ie TEXT,
  uf TEXT NOT NULL,
  cidade TEXT NOT NULL,
  regime_tributario TEXT NOT NULL,
  cnae TEXT,
  atividade_principal TEXT,
  anexo_simples TEXT,
  rbt12 NUMERIC(15, 2) DEFAULT 0,
  sujeito_fator_r BOOLEAN DEFAULT false,
  folha12_meses NUMERIC(15, 2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Documentos Fiscais (NF-e, NFS-e, CT-e)
CREATE TABLE public.fiscal_documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  competencia TEXT NOT NULL,
  chave_acesso TEXT,
  tipo_doc TEXT NOT NULL,
  modelo TEXT NOT NULL,
  serie TEXT NOT NULL,
  numero TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  data_entrada_saida DATE,
  natureza_operacao TEXT NOT NULL,
  tipo_operacao TEXT NOT NULL,
  status TEXT NOT NULL,
  emitente_cnpj TEXT NOT NULL,
  emitente_razao TEXT NOT NULL,
  emitente_uf TEXT NOT NULL,
  destinatario_cnpj TEXT NOT NULL,
  destinatario_razao TEXT NOT NULL,
  destinatario_uf TEXT NOT NULL,
  valor_total_produtos NUMERIC(15, 2) DEFAULT 0,
  valor_frete NUMERIC(15, 2) DEFAULT 0,
  valor_seguro NUMERIC(15, 2) DEFAULT 0,
  valor_desconto NUMERIC(15, 2) DEFAULT 0,
  valor_outras_despesas NUMERIC(15, 2) DEFAULT 0,
  valor_total_nota NUMERIC(15, 2) NOT NULL DEFAULT 0,
  impostos JSONB NOT NULL,
  itens JSONB DEFAULT '[]'::jsonb,
  importado_em TIMESTAMPTZ DEFAULT NOW(),
  arquivo_original_nome TEXT,
  status_contabilizacao TEXT DEFAULT 'PENDENTE',
  xml_raw TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Plano de Contas Contábil
CREATE TABLE public.accounting_accounts (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  codigo_reduzido TEXT,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  natureza TEXT NOT NULL,
  categoria TEXT NOT NULL,
  conta_pai_codigo TEXT,
  nivel INTEGER NOT NULL,
  saldo_inicial NUMERIC(15, 2) DEFAULT 0,
  saldo_atual NUMERIC(15, 2) DEFAULT 0,
  codigo_referencial_ecd TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lançamentos Contábeis (Livro Diário Geral em Partidas Dobradas)
CREATE TABLE public.accounting_entries (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  competencia TEXT NOT NULL,
  numero INTEGER NOT NULL,
  data DATE NOT NULL,
  origem_tipo TEXT NOT NULL,
  origem_id TEXT,
  documento_ref TEXT,
  historico_padrao TEXT NOT NULL,
  linhas JSONB NOT NULL,
  total_debito NUMERIC(15, 2) NOT NULL,
  total_credito NUMERIC(15, 2) NOT NULL,
  balanceado BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_por TEXT DEFAULT 'Sistema',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Empregados (eSocial)
CREATE TABLE public.employees (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  pis TEXT,
  ctps TEXT,
  cargo TEXT NOT NULL,
  cbo TEXT,
  departamento TEXT,
  data_admissao DATE NOT NULL,
  salario_base NUMERIC(12, 2) NOT NULL,
  dependentes_irrf INTEGER DEFAULT 0,
  vale_transporte BOOLEAN DEFAULT false,
  desconto_vt_percent NUMERIC(5, 2) DEFAULT 6,
  status TEXT NOT NULL DEFAULT 'ATIVO',
  matricula_esocial TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Holerites & Folha de Pagamento
CREATE TABLE public.payroll_payslips (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_cpf TEXT NOT NULL,
  cargo TEXT NOT NULL,
  cbo TEXT,
  competencia TEXT NOT NULL,
  salario_base NUMERIC(12, 2) NOT NULL,
  eventos JSONB DEFAULT '[]'::jsonb,
  total_proventos NUMERIC(12, 2) NOT NULL,
  total_descontos NUMERIC(12, 2) NOT NULL,
  salario_liquido NUMERIC(12, 2) NOT NULL,
  base_inss NUMERIC(12, 2) NOT NULL,
  valor_inss NUMERIC(12, 2) NOT NULL,
  base_irrf NUMERIC(12, 2) NOT NULL,
  valor_irrf NUMERIC(12, 2) NOT NULL,
  base_fgts NUMERIC(12, 2) NOT NULL,
  valor_fgts NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sócios e Quadro Societário (QSA)
CREATE TABLE public.partners (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  qualificacao TEXT NOT NULL,
  participacao_capital_percent NUMERIC(5, 2) NOT NULL,
  valor_prolabore_mensal NUMERIC(12, 2) DEFAULT 0,
  dependentes_irrf INTEGER DEFAULT 0,
  inss_retido_prolabore NUMERIC(12, 2) DEFAULT 0,
  irrf_retido_prolabore NUMERIC(12, 2) DEFAULT 0,
  prolabore_liquido NUMERIC(12, 2) DEFAULT 0,
  chave_pix TEXT,
  banco_nome TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Distribuição de Lucros Isentos (Art. 10 Lei 9.249/95)
CREATE TABLE public.profit_distributions (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  competencia TEXT NOT NULL,
  data_distribuicao DATE NOT NULL,
  partner_id TEXT NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  partner_nome TEXT NOT NULL,
  partner_cpf TEXT NOT NULL,
  valor_distribuido NUMERIC(15, 2) NOT NULL,
  saldo_lucros_disponivel_antes NUMERIC(15, 2) NOT NULL,
  saldo_lucros_disponivel_depois NUMERIC(15, 2) NOT NULL,
  isencao_legal_artigo TEXT DEFAULT 'Art. 10 da Lei nº 9.249/1995',
  status_contabilizacao TEXT DEFAULT 'CONTABILIZADO',
  recibo_numero TEXT NOT NULL UNIQUE,
  documento_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Obrigações Fiscais e Prazos
CREATE TABLE public.tax_obligations (
  id TEXT PRIMARY KEY,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  orgao TEXT NOT NULL,
  esfera TEXT NOT NULL,
  periodicidade TEXT NOT NULL,
  dia_vencimento INTEGER NOT NULL,
  competencia TEXT NOT NULL,
  status TEXT NOT NULL,
  protocolo_recibo TEXT,
  protocolo TEXT,
  data_transmissao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Parâmetros Contábeis & Fiscais do Especialista
CREATE TABLE public.accounting_parameters (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
  conta_vendas_mercadorias TEXT NOT NULL,
  conta_prestacao_servicos TEXT NOT NULL,
  conta_clientes TEXT NOT NULL,
  conta_fornecedores TEXT NOT NULL,
  conta_estoque_mercadorias TEXT NOT NULL,
  conta_cmv TEXT NOT NULL,
  conta_salarios_a_pagar TEXT NOT NULL,
  conta_despesa_salarios TEXT NOT NULL,
  conta_inss_a_pagar TEXT NOT NULL,
  conta_fgts_a_pagar TEXT NOT NULL,
  conta_prolabore_a_pagar TEXT NOT NULL,
  conta_despesa_prolabore TEXT NOT NULL,
  conta_lucros_acumulados TEXT NOT NULL,
  conta_impostos_simples TEXT NOT NULL,
  conta_pis_a_pagar TEXT NOT NULL,
  conta_cofins_a_pagar TEXT NOT NULL,
  conta_irpj_a_pagar TEXT NOT NULL,
  conta_csll_a_pagar TEXT NOT NULL,
  percentual_presuncao_comercio NUMERIC(5, 2) DEFAULT 8.0,
  percentual_presuncao_servico NUMERIC(5, 2) DEFAULT 32.0,
  aliquota_irpj_base NUMERIC(5, 2) DEFAULT 15.0,
  adicional_irpj_limite_mensal NUMERIC(15, 2) DEFAULT 20000.0,
  aliquota_adicional_irpj NUMERIC(5, 2) DEFAULT 10.0,
  aliquota_csll_base NUMERIC(5, 2) DEFAULT 9.0,
  aliquota_pis_cumulativo NUMERIC(5, 2) DEFAULT 0.65,
  aliquota_cofins_cumulativo NUMERIC(5, 2) DEFAULT 3.00,
  fator_r_limite_percent NUMERIC(5, 2) DEFAULT 28.0,
  bloquear_lancamentos_retroativos BOOLEAN DEFAULT true,
  exigir_partidas_dobradas_estritas BOOLEAN DEFAULT true,
  plano_referencial_rfb TEXT DEFAULT 'PJ_GERAL',
  versao_leiaute_ecd TEXT DEFAULT '9.00',
  versao_leiaute_efd TEXT DEFAULT '017',
  qualificacao_signatario TEXT DEFAULT '900 - Contador',
  crc_contador_responsavel TEXT,
  nome_contador_responsavel TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Personalização Visual, Branding White-Label & Landing Page
CREATE TABLE public.system_customization (
  id TEXT PRIMARY KEY,
  system_name TEXT NOT NULL,
  system_tagline TEXT,
  short_name TEXT,
  office_display_name TEXT,
  cnpj TEXT,
  crc TEXT,
  primary_theme_color TEXT DEFAULT 'blue',
  support_email TEXT,
  support_phone TEXT,
  landing_page JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Gestão de Usuários & Perfis RBAC
CREATE TABLE public.system_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  department TEXT,
  active BOOLEAN DEFAULT true,
  avatar_color TEXT DEFAULT 'blue',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Backlog de Atividades & Trilha de Auditoria Contábil
CREATE TABLE public.user_activity_backlog (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  ip TEXT DEFAULT '127.0.0.1',
  status TEXT NOT NULL DEFAULT 'SUCESSO'
);

-- Conceder permissões totais para o perfil anon e authenticated
GRANT ALL ON TABLE public.companies TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.fiscal_documents TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.accounting_accounts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.accounting_entries TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.employees TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.payroll_payslips TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.partners TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profit_distributions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.tax_obligations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.accounting_parameters TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.system_customization TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.system_users TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_activity_backlog TO anon, authenticated, service_role;

-- Habilitar Políticas RLS Permissivas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_backlog ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.companies FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'fiscal_documents' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.fiscal_documents FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_accounts' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.accounting_accounts FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_entries' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.accounting_entries FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employees' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.employees FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payroll_payslips' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.payroll_payslips FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partners' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.partners FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profit_distributions' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.profit_distributions FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tax_obligations' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.tax_obligations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounting_parameters' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.accounting_parameters FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_customization' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.system_customization FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_users' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.system_users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_backlog' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON public.user_activity_backlog FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;
}

/**
 * Função de sincronização dos dados locais com o Supabase com tratamento rigoroso e logs detalhados
 */
export async function syncAllEntitiesToSupabase(
  companies: Company[],
  documents: FiscalDocument[],
  entries: AccountingEntry[],
  accounts: AccountingAccount[],
  employees: Employee[],
  payslips: PayrollPayslip[],
  partners: Partner[],
  distributions: ProfitDistributionRecord[],
  obligations: TaxObligation[],
  paramOrProgress?: AccountingParameters | ((progress: SyncProgressItem[]) => void),
  customization?: SystemCustomization,
  users?: SystemUser[],
  userBacklog?: UserActivityBacklog[],
  onProgressCb?: (progress: SyncProgressItem[]) => void
): Promise<{ success: boolean; progress: SyncProgressItem[]; errors: string[] }> {
  // Tratamento de retrocompatibilidade para assinaturas com 10 ou 14 argumentos
  let onProgress: ((progress: SyncProgressItem[]) => void) | undefined;
  let accountingParameters: AccountingParameters | undefined;

  if (typeof paramOrProgress === 'function') {
    onProgress = paramOrProgress;
    accountingParameters = undefined;
  } else {
    accountingParameters = paramOrProgress;
    onProgress = onProgressCb;
  }

  const progress: SyncProgressItem[] = [
    { table: 'companies', label: 'Empresas Cadastradas', count: companies.length, status: 'pending' },
    { table: 'fiscal_documents', label: 'Documentos Fiscais (NF-e/NFS-e)', count: documents.length, status: 'pending' },
    { table: 'accounting_accounts', label: 'Plano de Contas', count: accounts.length, status: 'pending' },
    { table: 'accounting_entries', label: 'Livro Diário (Partidas Dobradas)', count: entries.length, status: 'pending' },
    { table: 'employees', label: 'Empregados (eSocial)', count: employees.length, status: 'pending' },
    { table: 'payroll_payslips', label: 'Folha & Holerites', count: payslips.length, status: 'pending' },
    { table: 'partners', label: 'Quadro Societário & Sócios', count: partners.length, status: 'pending' },
    { table: 'profit_distributions', label: 'Distribuição de Lucros', count: distributions.length, status: 'pending' },
    { table: 'tax_obligations', label: 'Obrigações e Prazos', count: obligations.length, status: 'pending' },
    { table: 'accounting_parameters', label: 'Parâmetros Contábeis (Fase 3)', count: accountingParameters ? 1 : 0, status: 'pending' },
    { table: 'system_customization', label: 'Personalização & White-Label (Fase 3)', count: customization ? 1 : 0, status: 'pending' },
    { table: 'system_users', label: 'Gestão de Usuários RBAC (Fase 3)', count: users ? users.length : 0, status: 'pending' },
    { table: 'user_activity_backlog', label: 'Trilha de Auditoria & Backlog (Fase 3)', count: userBacklog ? userBacklog.length : 0, status: 'pending' },
  ];

  const updateStatus = (index: number, status: SyncProgressItem['status'], message?: string) => {
    progress[index].status = status;
    progress[index].message = message;
    if (onProgress) onProgress([...progress]);
  };

  const errors: string[] = [];

  // 1. Companies (base de todas as relações)
  updateStatus(0, 'syncing');
  try {
    if (companies.length > 0) {
      const formattedCompanies = companies.map(c => ({
        id: c.id,
        tenant_id: c.tenantId || 'tenant-default',
        razao_social: c.razaoSocial,
        nome_fantasia: c.nomeFantasia || '',
        cnpj: c.cnpj,
        ie: c.ie || '',
        uf: c.uf || 'SP',
        cidade: c.cidade || 'São Paulo',
        regime_tributario: c.regimeTributario,
        cnae: c.cnae || '',
        atividade_principal: c.atividadePrincipal || '',
        anexo_simples: c.anexoSimples || null,
        rbt12: c.rbt12 || 0,
        sujeito_fator_r: Boolean(c.sujeitoFatorR),
        folha12_meses: c.folha12Meses || 0,
        ativo: c.ativo ?? true,
      }));

      let { error } = await supabase.from('companies').upsert(formattedCompanies);
      
      // Auto-recuperação resiliente: se a coluna cnae na tabela do PostgreSQL no Supabase ainda estiver com VARCHAR(15) (código 22001)
      if (error && (
        error.code === '22001' || 
        String(error.message || '').includes('character varying(15)') ||
        String(error.details || '').includes('character varying(15)') ||
        String(error.message || '').includes('too long')
      )) {
        // Envia apenas o código do CNAE numérico (ex: "46.39-7-01") para caber em colunas VARCHAR(15) existentes
        const fallbackCompanies = formattedCompanies.map(c => ({
          ...c,
          cnae: (c.cnae || '').split(' - ')[0].trim().slice(0, 15),
        }));
        const retryResult = await supabase.from('companies').upsert(fallbackCompanies);
        if (!retryResult.error) {
          error = null;
        } else {
          error = retryResult.error;
        }
      }

      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar empresas');
        errors.push(`Empresas: ${msg}`);
        updateStatus(0, 'error', msg);
      } else {
        updateStatus(0, 'success', `${companies.length} sincronizadas`);
      }
    } else {
      updateStatus(0, 'success', '0 empresas para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar empresas');
    errors.push(`Empresas: ${msg}`);
    updateStatus(0, 'error', msg);
  }

  // 2. Fiscal Documents
  updateStatus(1, 'syncing');
  try {
    if (documents.length > 0) {
      const formattedDocs = documents.map(d => ({
        id: d.id,
        tenant_id: d.tenantId || 'tenant-default',
        company_id: d.companyId,
        competencia: d.competencia,
        chave_acesso: d.chaveAcesso ? d.chaveAcesso.trim() : null,
        tipo_doc: d.tipoDoc,
        modelo: d.modelo || '55',
        serie: d.serie,
        numero: d.numero,
        data_emissao: d.dataEmissao ? d.dataEmissao.split('T')[0] : new Date().toISOString().split('T')[0],
        data_entrada_saida: d.dataEntradaSaida ? d.dataEntradaSaida.split('T')[0] : null,
        natureza_operacao: d.naturezaOperacao,
        tipo_operacao: d.tipoOperacao,
        status: d.status,
        emitente_cnpj: d.emitenteCnpj,
        emitente_razao: d.emitenteRazao,
        emitente_uf: d.emitenteUf,
        destinatario_cnpj: d.destinatarioCnpj,
        destinatario_razao: d.destinatarioRazao,
        destinatario_uf: d.destinatarioUf,
        valor_total_produtos: d.valorTotalProdutos || 0,
        valor_frete: d.valorFrete || 0,
        valor_seguro: d.valorSeguro || 0,
        valor_desconto: d.valorDesconto || 0,
        valor_outras_despesas: d.valorOutrasDespesas || 0,
        valor_total_nota: d.valorTotalNota || 0,
        impostos: d.impostos,
        itens: d.itens || [],
        importado_em: d.importadoEm || new Date().toISOString(),
        arquivo_original_nome: d.arquivoOriginalNome || 'documento.xml',
        status_contabilizacao: d.statusContabilizacao || 'PENDENTE',
        xml_raw: d.xmlRaw || null,
      }));

      const { error } = await supabase.from('fiscal_documents').upsert(formattedDocs);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar documentos fiscais');
        errors.push(`Documentos: ${msg}`);
        updateStatus(1, 'error', msg);
      } else {
        updateStatus(1, 'success', `${documents.length} documentos sincronizados`);
      }
    } else {
      updateStatus(1, 'success', '0 documentos para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar documentos fiscais');
    errors.push(`Documentos: ${msg}`);
    updateStatus(1, 'error', msg);
  }

  // 3. Accounting Accounts
  updateStatus(2, 'syncing');
  try {
    if (accounts.length > 0) {
      const formattedAccounts = accounts.map(a => ({
        id: a.id,
        company_id: a.companyId,
        codigo: a.codigo,
        codigo_reduzido: a.codigoReduzido || '',
        nome: a.nome,
        tipo: a.tipo,
        natureza: a.natureza,
        categoria: a.categoria,
        conta_pai_codigo: a.contaPaiCodigo || null,
        nivel: a.nivel,
        saldo_inicial: a.saldoInicial || 0,
        saldo_atual: a.saldoAtual || 0,
        codigo_referencial_ecd: a.codigoReferencialECD || null,
      }));

      const { error } = await supabase.from('accounting_accounts').upsert(formattedAccounts);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar contas contábeis');
        errors.push(`Plano de Contas: ${msg}`);
        updateStatus(2, 'error', msg);
      } else {
        updateStatus(2, 'success', `${accounts.length} contas sincronizadas`);
      }
    } else {
      updateStatus(2, 'success', '0 contas para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar contas contábeis');
    errors.push(`Plano de Contas: ${msg}`);
    updateStatus(2, 'error', msg);
  }

  // 4. Accounting Entries
  updateStatus(3, 'syncing');
  try {
    if (entries.length > 0) {
      const formattedEntries = entries.map(e => ({
        id: e.id,
        company_id: e.companyId,
        competencia: e.competencia,
        numero: e.numero,
        data: e.data ? e.data.split('T')[0] : new Date().toISOString().split('T')[0],
        origem_tipo: e.origemTipo,
        origem_id: e.origemId || null,
        documento_ref: e.documentoRef || null,
        historico_padrao: e.historicoPadrao,
        linhas: e.linhas,
        total_debito: e.totalDebito || 0,
        total_credito: e.totalCredito || 0,
        balanceado: e.balanceado ?? true,
        criado_em: e.criadoEm || new Date().toISOString(),
        criado_por: e.criadoPor || 'Sistema',
      }));

      const { error } = await supabase.from('accounting_entries').upsert(formattedEntries);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar lançamentos contábeis');
        errors.push(`Lançamentos: ${msg}`);
        updateStatus(3, 'error', msg);
      } else {
        updateStatus(3, 'success', `${entries.length} lançamentos sincronizados`);
      }
    } else {
      updateStatus(3, 'success', '0 lançamentos para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar lançamentos contábeis');
    errors.push(`Lançamentos: ${msg}`);
    updateStatus(3, 'error', msg);
  }

  // 5. Employees
  updateStatus(4, 'syncing');
  try {
    if (employees.length > 0) {
      const formattedEmployees = employees.map(emp => ({
        id: emp.id,
        company_id: emp.companyId,
        nome: emp.nome,
        cpf: emp.cpf,
        pis: emp.pis || null,
        ctps: emp.ctps || null,
        cargo: emp.cargo,
        cbo: emp.cbo || null,
        departamento: emp.departamento || '',
        data_admissao: emp.dataAdmissao ? emp.dataAdmissao.split('T')[0] : new Date().toISOString().split('T')[0],
        salario_base: emp.salarioBase || 0,
        dependentes_irrf: emp.dependentesIrrf || 0,
        vale_transporte: Boolean(emp.valeTransporte),
        desconto_vt_percent: emp.descontoVtPercent || 6,
        status: emp.status || 'ATIVO',
        matricula_esocial: emp.matriculaESocial || null,
      }));

      const { error } = await supabase.from('employees').upsert(formattedEmployees);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar empregados');
        errors.push(`Empregados: ${msg}`);
        updateStatus(4, 'error', msg);
      } else {
        updateStatus(4, 'success', `${employees.length} empregados sincronizados`);
      }
    } else {
      updateStatus(4, 'success', '0 empregados para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar empregados');
    errors.push(`Empregados: ${msg}`);
    updateStatus(4, 'error', msg);
  }

  // 6. Payroll Payslips
  updateStatus(5, 'syncing');
  try {
    if (payslips.length > 0) {
      const formattedPayslips = payslips.map(p => ({
        id: p.id,
        employee_id: p.employeeId,
        employee_name: p.employeeName,
        employee_cpf: p.employeeCpf,
        cargo: p.cargo,
        cbo: p.cbo || null,
        competencia: p.competencia,
        salario_base: p.salarioBase || 0,
        eventos: p.eventos || [],
        total_proventos: p.totalProventos || 0,
        total_descontos: p.totalDescontos || 0,
        salario_liquido: p.salarioLiquido || 0,
        base_inss: p.baseInss || 0,
        valor_inss: p.valorInss || 0,
        base_irrf: p.baseIrrf || 0,
        valor_irrf: p.valorIrrf || 0,
        base_fgts: p.baseFgts || 0,
        valor_fgts: p.valorFgts || 0,
      }));

      const { error } = await supabase.from('payroll_payslips').upsert(formattedPayslips);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar holerites');
        errors.push(`Folha: ${msg}`);
        updateStatus(5, 'error', msg);
      } else {
        updateStatus(5, 'success', `${payslips.length} holerites sincronizados`);
      }
    } else {
      updateStatus(5, 'success', '0 holerites para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar holerites');
    errors.push(`Folha: ${msg}`);
    updateStatus(5, 'error', msg);
  }

  // 7. Partners
  updateStatus(6, 'syncing');
  try {
    if (partners.length > 0) {
      const formattedPartners = partners.map(p => ({
        id: p.id,
        company_id: p.companyId,
        nome: p.nome,
        cpf: p.cpf,
        qualificacao: p.qualificacao,
        participacao_capital_percent: p.participacaoCapitalPercent || 0,
        valor_prolabore_mensal: p.valorProlaboreMensal || 0,
        dependentes_irrf: p.dependentesIrrf || 0,
        inss_retido_prolabore: p.inssRetidoProlabore || 0,
        irrf_retido_prolabore: p.irrfRetidoProlabore || 0,
        prolabore_liquido: p.prolaboreLiquido || 0,
        chave_pix: p.chavePix || null,
        banco_nome: p.bancoNome || null,
      }));

      const { error } = await supabase.from('partners').upsert(formattedPartners);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar sócios');
        errors.push(`Sócios: ${msg}`);
        updateStatus(6, 'error', msg);
      } else {
        updateStatus(6, 'success', `${partners.length} sócios sincronizados`);
      }
    } else {
      updateStatus(6, 'success', '0 sócios para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar sócios');
    errors.push(`Sócios: ${msg}`);
    updateStatus(6, 'error', msg);
  }

  // 8. Profit Distributions
  updateStatus(7, 'syncing');
  try {
    if (distributions.length > 0) {
      const formattedDist = distributions.map(d => ({
        id: d.id,
        company_id: d.companyId,
        competencia: d.competencia,
        data_distribuicao: d.dataDistribuicao ? d.dataDistribuicao.split('T')[0] : new Date().toISOString().split('T')[0],
        partner_id: d.partnerId,
        partner_nome: d.partnerNome,
        partner_cpf: d.partnerCpf,
        valor_distribuido: d.valorDistribuido || 0,
        saldo_lucros_disponivel_antes: d.saldoLucrosDisponivelAntes || 0,
        saldo_lucros_disponivel_depois: d.saldoLucrosDisponivelDepois || 0,
        isencao_legal_artigo: d.isencaoLegalArtigo || 'Art. 10 da Lei nº 9.249/1995',
        status_contabilizacao: d.statusContabilizacao || 'CONTABILIZADO',
        recibo_numero: d.reciboNumero || `REC-${d.id}`,
        documento_ref: d.documentoRef || null,
      }));

      const { error } = await supabase.from('profit_distributions').upsert(formattedDist);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar distribuições de lucro');
        errors.push(`Distribuição de Lucro: ${msg}`);
        updateStatus(7, 'error', msg);
      } else {
        updateStatus(7, 'success', `${distributions.length} distribuições sincronizadas`);
      }
    } else {
      updateStatus(7, 'success', '0 distribuições para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar distribuições de lucro');
    errors.push(`Distribuição de Lucro: ${msg}`);
    updateStatus(7, 'error', msg);
  }

  // 9. Tax Obligations
  updateStatus(8, 'syncing');
  try {
    if (obligations.length > 0) {
      const formattedObligations = obligations.map(o => ({
        id: o.id,
        codigo: o.codigo,
        nome: o.nome,
        orgao: o.orgao,
        esfera: o.esfera,
        periodicidade: o.periodicidade,
        dia_vencimento: o.diaVencimento,
        competencia: o.competencia,
        status: o.status,
        protocolo_recibo: o.protocoloRecibo || null,
        protocolo: o.protocolo || null,
        data_transmissao: o.dataTransmissao || null,
      }));

      const { error } = await supabase.from('tax_obligations').upsert(formattedObligations);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar obrigações');
        errors.push(`Obrigações: ${msg}`);
        updateStatus(8, 'error', msg);
      } else {
        updateStatus(8, 'success', `${obligations.length} obrigações sincronizadas`);
      }
    } else {
      updateStatus(8, 'success', '0 obrigações para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar obrigações');
    errors.push(`Obrigações: ${msg}`);
    updateStatus(8, 'error', msg);
  }

  // 10. Accounting Parameters (Fase 3)
  updateStatus(9, 'syncing');
  try {
    if (accountingParameters) {
      const row = {
        id: 'params-global',
        company_id: companies[0]?.id || null,
        conta_vendas_mercadorias: accountingParameters.contaVendasMercadorias,
        conta_prestacao_servicos: accountingParameters.contaPrestacaoServicos,
        conta_clientes: accountingParameters.contaClientes,
        conta_fornecedores: accountingParameters.contaFornecedores,
        conta_estoque_mercadorias: accountingParameters.contaEstoqueMercadorias,
        conta_cmv: accountingParameters.contaCmv,
        conta_salarios_a_pagar: accountingParameters.contaSalariosAPagar,
        conta_despesa_salarios: accountingParameters.contaDespesaSalarios,
        conta_inss_a_pagar: accountingParameters.contaInssAPagar,
        conta_fgts_a_pagar: accountingParameters.contaFgtsAPagar,
        conta_prolabore_a_pagar: accountingParameters.contaProlaboreAPagar,
        conta_despesa_prolabore: accountingParameters.contaDespesaProlabore,
        conta_lucros_acumulados: accountingParameters.contaLucrosAcumulados,
        conta_impostos_simples: accountingParameters.contaImpostosSimples,
        conta_pis_a_pagar: accountingParameters.contaPisAPagar,
        conta_cofins_a_pagar: accountingParameters.contaCofinsAPagar,
        conta_irpj_a_pagar: accountingParameters.contaIrpjAPagar,
        conta_csll_a_pagar: accountingParameters.contaCsllAPagar,
        percentual_presuncao_comercio: accountingParameters.percentualPresuncaoComercio,
        percentual_presuncao_servico: accountingParameters.percentualPresuncaoServico,
        aliquota_irpj_base: accountingParameters.aliquotaIrpjBase,
        adicional_irpj_limite_mensal: accountingParameters.adicionalIrpjLimiteMensal,
        aliquota_adicional_irpj: accountingParameters.aliquotaAdicionalIrpj,
        aliquota_csll_base: accountingParameters.aliquotaCsllBase,
        aliquota_pis_cumulativo: accountingParameters.aliquotaPisCumulativo,
        aliquota_cofins_cumulativo: accountingParameters.aliquotaCofinsCumulativo,
        fator_r_limite_percent: accountingParameters.fatorRLimitePercent,
        bloquear_lancamentos_retroativos: accountingParameters.bloquearLancamentosRetroativos,
        exigir_partidas_dobradas_estritas: accountingParameters.exigirPartidasDobradasEstritas,
        plano_referencial_rfb: accountingParameters.planoReferencialRFB,
        versao_leiaute_ecd: accountingParameters.versaoLeiauteECD,
        versao_leiaute_efd: accountingParameters.versaoLeiauteEFD,
        qualificacao_signatario: accountingParameters.qualificacaoSignatario,
        crc_contador_responsavel: accountingParameters.crcContadorResponsavel,
        nome_contador_responsavel: accountingParameters.nomeContadorResponsavel,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('accounting_parameters').upsert(row);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar parâmetros contábeis');
        errors.push(`Parâmetros Contábeis: ${msg}`);
        updateStatus(9, 'error', msg);
      } else {
        updateStatus(9, 'success', 'Parâmetros contábeis sincronizados');
      }
    } else {
      updateStatus(9, 'success', 'Nenhum parâmetro contábil para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar parâmetros contábeis');
    errors.push(`Parâmetros Contábeis: ${msg}`);
    updateStatus(9, 'error', msg);
  }

  // 11. System Customization & White-Label (Fase 3)
  updateStatus(10, 'syncing');
  try {
    if (customization) {
      const row = {
        id: 'custom-global',
        system_name: customization.systemName,
        system_tagline: customization.systemTagline,
        short_name: customization.shortName,
        office_display_name: customization.officeDisplayName,
        cnpj: customization.cnpj,
        crc: customization.crc,
        primary_theme_color: customization.primaryThemeColor,
        support_email: customization.supportEmail,
        support_phone: customization.supportPhone,
        landing_page: customization.landingPage,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('system_customization').upsert(row);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar personalização');
        errors.push(`Personalização: ${msg}`);
        updateStatus(10, 'error', msg);
      } else {
        updateStatus(10, 'success', 'Personalização e White-Label sincronizados');
      }
    } else {
      updateStatus(10, 'success', 'Nenhuma personalização para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar personalização');
    errors.push(`Personalização: ${msg}`);
    updateStatus(10, 'error', msg);
  }

  // 12. System Users & RBAC (Fase 3)
  updateStatus(11, 'syncing');
  try {
    if (users && users.length > 0) {
      const formattedUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department || '',
        active: u.active ?? true,
        avatar_color: u.avatarColor || 'blue',
        last_login: u.lastLogin || new Date().toISOString(),
        created_at: u.createdAt || new Date().toISOString()
      }));

      const { error } = await supabase.from('system_users').upsert(formattedUsers);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar usuários do sistema');
        errors.push(`Usuários do Sistema: ${msg}`);
        updateStatus(11, 'error', msg);
      } else {
        updateStatus(11, 'success', `${users.length} usuários sincronizados`);
      }
    } else {
      updateStatus(11, 'success', '0 usuários para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar usuários do sistema');
    errors.push(`Usuários do Sistema: ${msg}`);
    updateStatus(11, 'error', msg);
  }

  // 13. User Activity Backlog & Audit Trail (Fase 3)
  updateStatus(12, 'syncing');
  try {
    if (userBacklog && userBacklog.length > 0) {
      const formattedBacklog = userBacklog.map(b => ({
        id: b.id,
        timestamp: b.timestamp || new Date().toISOString(),
        user_id: b.userId || null,
        user_name: b.userName,
        user_role: b.userRole,
        module: b.module,
        action: b.action,
        description: b.description,
        ip: b.ip || '127.0.0.1',
        status: b.status || 'SUCESSO'
      }));

      const { error } = await supabase.from('user_activity_backlog').upsert(formattedBacklog);
      if (error) {
        const msg = extractErrorMessage(error, 'Erro ao sincronizar backlog de auditoria');
        errors.push(`Auditoria & Backlog: ${msg}`);
        updateStatus(12, 'error', msg);
      } else {
        updateStatus(12, 'success', `${userBacklog.length} registros de auditoria sincronizados`);
      }
    } else {
      updateStatus(12, 'success', '0 registros de auditoria para sincronizar');
    }
  } catch (err: unknown) {
    const msg = extractErrorMessage(err, 'Erro inesperado ao sincronizar backlog de auditoria');
    errors.push(`Auditoria & Backlog: ${msg}`);
    updateStatus(12, 'error', msg);
  }

  const success = errors.length === 0;
  return { success, progress, errors };
}

/**
 * Puxa todos os dados do Supabase para restaurar o estado local
 */
export async function fetchAllEntitiesFromSupabase(): Promise<{
  success: boolean;
  data?: {
    companies?: Company[];
    documents?: FiscalDocument[];
    accounts?: AccountingAccount[];
    entries?: AccountingEntry[];
    employees?: Employee[];
    payslips?: PayrollPayslip[];
    partners?: Partner[];
    distributions?: ProfitDistributionRecord[];
    obligations?: TaxObligation[];
    accountingParameters?: AccountingParameters;
    customization?: SystemCustomization;
    users?: SystemUser[];
    userBacklog?: UserActivityBacklog[];
  };
  error?: string;
}> {
  try {
    const [
      compRes,
      docsRes,
      accsRes,
      entriesRes,
      empRes,
      payRes,
      partRes,
      distRes,
      oblRes,
      paramsRes,
      customRes,
      usersRes,
      backlogRes
    ] = await Promise.all([
      supabase.from('companies').select('*'),
      supabase.from('fiscal_documents').select('*'),
      supabase.from('accounting_accounts').select('*'),
      supabase.from('accounting_entries').select('*'),
      supabase.from('employees').select('*'),
      supabase.from('payroll_payslips').select('*'),
      supabase.from('partners').select('*'),
      supabase.from('profit_distributions').select('*'),
      supabase.from('tax_obligations').select('*'),
      supabase.from('accounting_parameters').select('*').limit(1).then(r => r, () => ({ data: null, error: null })),
      supabase.from('system_customization').select('*').limit(1).then(r => r, () => ({ data: null, error: null })),
      supabase.from('system_users').select('*').then(r => r, () => ({ data: null, error: null })),
      supabase.from('user_activity_backlog').select('*').order('timestamp', { ascending: false }).limit(200).then(r => r, () => ({ data: null, error: null })),
    ]);

    const companies: Company[] = (compRes.data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      razaoSocial: row.razao_social,
      nomeFantasia: row.nome_fantasia || '',
      cnpj: row.cnpj,
      ie: row.ie || '',
      uf: row.uf || 'SP',
      cidade: row.cidade || 'São Paulo',
      regimeTributario: row.regime_tributario,
      cnae: row.cnae || '',
      atividadePrincipal: row.atividade_principal || '',
      anexoSimples: row.anexo_simples,
      rbt12: Number(row.rbt12 || 0),
      sujeitoFatorR: Boolean(row.sujeito_fator_r),
      folha12Meses: Number(row.folha12_meses || 0),
      ativo: Boolean(row.ativo),
    }));

    const documents: FiscalDocument[] = (docsRes.data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      companyId: row.company_id,
      competencia: row.competencia,
      chaveAcesso: row.chave_acesso || '',
      tipoDoc: row.tipo_doc,
      modelo: row.modelo || '55',
      serie: row.serie,
      numero: row.numero,
      dataEmissao: row.data_emissao,
      dataEntradaSaida: row.data_entrada_saida || row.data_emissao,
      naturezaOperacao: row.natureza_operacao,
      tipoOperacao: row.tipo_operacao,
      status: row.status,
      emitenteCnpj: row.emitente_cnpj,
      emitenteRazao: row.emitente_razao,
      emitenteUf: row.emitente_uf,
      destinatarioCnpj: row.destinatario_cnpj,
      destinatarioRazao: row.destinatario_razao,
      destinatarioUf: row.destinatario_uf,
      valorTotalProdutos: Number(row.valor_total_produtos || 0),
      valorFrete: Number(row.valor_frete || 0),
      valorSeguro: Number(row.valor_seguro || 0),
      valorDesconto: Number(row.valor_desconto || 0),
      valorOutrasDespesas: Number(row.valor_outras_despesas || 0),
      valorTotalNota: Number(row.valor_total_nota || 0),
      impostos: row.impostos,
      itens: row.itens || [],
      importadoEm: row.importado_em || new Date().toISOString(),
      arquivoOriginalNome: row.arquivo_original_nome || 'documento.xml',
      statusContabilizacao: row.status_contabilizacao || 'PENDENTE',
      xmlRaw: row.xml_raw,
    }));

    const accounts: AccountingAccount[] = (accsRes.data || []).map((row: any) => ({
      id: row.id,
      companyId: row.company_id,
      codigo: row.codigo,
      codigoReduzido: row.codigo_reduzido || '',
      nome: row.nome,
      tipo: row.tipo,
      natureza: row.natureza,
      categoria: row.categoria,
      contaPaiCodigo: row.conta_pai_codigo,
      nivel: row.nivel,
      saldoInicial: Number(row.saldo_inicial || 0),
      saldoAtual: Number(row.saldo_atual || 0),
      codigoReferencialECD: row.codigo_referencial_ecd,
    }));

    const entries: AccountingEntry[] = (entriesRes.data || []).map((row: any) => ({
      id: row.id,
      companyId: row.company_id,
      competencia: row.competencia,
      numero: row.numero,
      data: row.data,
      origemTipo: row.origem_tipo,
      origemId: row.origem_id,
      documentoRef: row.documento_ref,
      historicoPadrao: row.historico_padrao,
      linhas: row.linhas || [],
      totalDebito: Number(row.total_debito),
      totalCredito: Number(row.total_credito),
      balanceado: Boolean(row.balanceado),
      criadoEm: row.criado_em,
      criadoPor: row.criado_por || 'Sistema',
    }));

    const employees: Employee[] = (empRes.data || []).map((row: any) => ({
      id: row.id,
      companyId: row.company_id,
      nome: row.nome,
      cpf: row.cpf,
      pis: row.pis || '',
      ctps: row.ctps || '',
      cargo: row.cargo,
      cbo: row.cbo || '',
      departamento: row.departamento || '',
      dataAdmissao: row.data_admissao,
      salarioBase: Number(row.salario_base),
      dependentesIrrf: Number(row.dependentes_irrf || 0),
      valeTransporte: Boolean(row.vale_transporte),
      descontoVtPercent: Number(row.desconto_vt_percent || 6),
      status: row.status || 'ATIVO',
      matriculaESocial: row.matricula_esocial,
    }));

    const payslips: PayrollPayslip[] = (payRes.data || []).map((row: any) => ({
      id: row.id,
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      employeeCpf: row.employee_cpf,
      cargo: row.cargo,
      cbo: row.cbo,
      competencia: row.competencia,
      salarioBase: Number(row.salario_base),
      eventos: row.eventos || [],
      totalProventos: Number(row.total_proventos),
      totalDescontos: Number(row.total_descontos),
      salarioLiquido: Number(row.salario_liquido),
      baseInss: Number(row.base_inss),
      valorInss: Number(row.valor_inss),
      baseIrrf: Number(row.base_irrf),
      valorIrrf: Number(row.valor_irrf),
      baseFgts: Number(row.base_fgts),
      valorFgts: Number(row.valor_fgts),
    }));

    const partners: Partner[] = (partRes.data || []).map((row: any) => ({
      id: row.id,
      companyId: row.company_id,
      nome: row.nome,
      cpf: row.cpf,
      qualificacao: row.qualificacao,
      participacaoCapitalPercent: Number(row.participacao_capital_percent),
      valorProlaboreMensal: Number(row.valor_prolabore_mensal || 0),
      dependentesIrrf: Number(row.dependentes_irrf || 0),
      inssRetidoProlabore: Number(row.inss_retido_prolabore || 0),
      irrfRetidoProlabore: Number(row.irrf_retido_prolabore || 0),
      prolaboreLiquido: Number(row.prolabore_liquido || 0),
      chavePix: row.chave_pix,
      bancoNome: row.banco_nome,
    }));

    const distributions: ProfitDistributionRecord[] = (distRes.data || []).map((row: any) => ({
      id: row.id,
      companyId: row.company_id,
      competencia: row.competencia,
      dataDistribuicao: row.data_distribuicao,
      partnerId: row.partner_id,
      partnerNome: row.partner_nome,
      partnerCpf: row.partner_cpf,
      valorDistribuido: Number(row.valor_distribuido),
      saldoLucrosDisponivelAntes: Number(row.saldo_lucros_disponivel_antes),
      saldoLucrosDisponivelDepois: Number(row.saldo_lucros_disponivel_depois),
      isencaoLegalArtigo: row.isencao_legal_artigo || 'Art. 10 da Lei nº 9.249/1995',
      statusContabilizacao: row.status_contabilizacao,
      reciboNumero: row.recibo_numero,
      documentoRef: row.documento_ref,
    }));

    const obligations: TaxObligation[] = (oblRes.data || []).map((row: any) => ({
      id: row.id,
      codigo: row.codigo,
      nome: row.nome,
      orgao: row.orgao,
      esfera: row.esfera,
      periodicidade: row.periodicidade,
      diaVencimento: Number(row.dia_vencimento),
      competencia: row.competencia,
      status: row.status,
      protocoloRecibo: row.protocolo_recibo,
      protocolo: row.protocolo,
      dataTransmissao: row.data_transmissao,
    }));

    // Parse de Parâmetros Contábeis (Fase 3)
    let accountingParameters: AccountingParameters | undefined;
    if (paramsRes && paramsRes.data && paramsRes.data.length > 0) {
      const p = paramsRes.data[0];
      accountingParameters = {
        contaVendasMercadorias: p.conta_vendas_mercadorias || '',
        contaPrestacaoServicos: p.conta_prestacao_servicos || '',
        contaClientes: p.conta_clientes || '',
        contaFornecedores: p.conta_fornecedores || '',
        contaEstoqueMercadorias: p.conta_estoque_mercadorias || '',
        contaCmv: p.conta_cmv || '',
        contaSalariosAPagar: p.conta_salarios_a_pagar || '',
        contaDespesaSalarios: p.conta_despesa_salarios || '',
        contaInssAPagar: p.conta_inss_a_pagar || '',
        contaFgtsAPagar: p.conta_fgts_a_pagar || '',
        contaProlaboreAPagar: p.conta_prolabore_a_pagar || '',
        contaDespesaProlabore: p.conta_despesa_prolabore || '',
        contaLucrosAcumulados: p.conta_lucros_acumulados || '',
        contaImpostosSimples: p.conta_impostos_simples || '',
        contaPisAPagar: p.conta_pis_a_pagar || '',
        contaCofinsAPagar: p.conta_cofins_a_pagar || '',
        contaIrpjAPagar: p.conta_irpj_a_pagar || '',
        contaCsllAPagar: p.conta_csll_a_pagar || '',
        percentualPresuncaoComercio: Number(p.percentual_presuncao_comercio ?? 8),
        percentualPresuncaoServico: Number(p.percentual_presuncao_servico ?? 32),
        aliquotaIrpjBase: Number(p.aliquota_irpj_base ?? 15),
        adicionalIrpjLimiteMensal: Number(p.adicional_irpj_limite_mensal ?? 20000),
        aliquotaAdicionalIrpj: Number(p.aliquota_adicional_irpj ?? 10),
        aliquotaCsllBase: Number(p.aliquota_csll_base ?? 9),
        aliquotaPisCumulativo: Number(p.aliquota_pis_cumulativo ?? 0.65),
        aliquotaCofinsCumulativo: Number(p.aliquota_cofins_cumulativo ?? 3.0),
        fatorRLimitePercent: Number(p.fator_r_limite_percent ?? 28),
        bloquearLancamentosRetroativos: Boolean(p.bloquear_lancamentos_retroativos),
        exigirPartidasDobradasEstritas: Boolean(p.exigir_partidas_dobradas_estritas),
        planoReferencialRFB: p.plano_referencial_rfb || 'PJ_GERAL',
        versaoLeiauteECD: p.versao_leiaute_ecd || '9.00',
        versaoLeiauteEFD: p.versao_leiaute_efd || '017',
        qualificacaoSignatario: p.qualificacao_signatario || '900 - Contador',
        crcContadorResponsavel: p.crc_contador_responsavel || '',
        nomeContadorResponsavel: p.nome_contador_responsavel || '',
      };
    }

    // Parse de Personalização e White-Label (Fase 3)
    let customization: SystemCustomization | undefined;
    if (customRes && customRes.data && customRes.data.length > 0) {
      const c = customRes.data[0];
      customization = {
        systemName: c.system_name || 'SaaS Contábil & Fiscal',
        systemTagline: c.system_tagline || '',
        shortName: c.short_name || 'SC',
        officeDisplayName: c.office_display_name || '',
        cnpj: c.cnpj || '',
        crc: c.crc || '',
        primaryThemeColor: c.primary_theme_color || 'blue',
        supportEmail: c.support_email || '',
        supportPhone: c.support_phone || '',
        landingPage: c.landing_page || {},
      };
    }

    // Parse de Usuários do Sistema RBAC (Fase 3)
    let users: SystemUser[] | undefined;
    if (usersRes && usersRes.data && usersRes.data.length > 0) {
      users = usersRes.data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        department: u.department || '',
        active: Boolean(u.active),
        avatarColor: u.avatar_color || 'blue',
        lastLogin: u.last_login || '',
        createdAt: u.created_at || '',
      }));
    }

    // Parse de Trilha de Auditoria & Backlog (Fase 3)
    let userBacklog: UserActivityBacklog[] | undefined;
    if (backlogRes && backlogRes.data && backlogRes.data.length > 0) {
      userBacklog = backlogRes.data.map((b: any) => ({
        id: b.id,
        timestamp: b.timestamp,
        userId: b.user_id,
        userName: b.user_name,
        userRole: b.user_role,
        module: b.module,
        action: b.action,
        description: b.description,
        ip: b.ip,
        status: b.status,
      }));
    }

    return {
      success: true,
      data: {
        companies,
        documents,
        accounts,
        entries,
        employees,
        payslips,
        partners,
        distributions,
        obligations,
        accountingParameters,
        customization,
        users,
        userBacklog,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: extractErrorMessage(err, 'Falha ao recuperar dados do Supabase'),
    };
  }
}
