import React from 'react';
import { 
  Building2, 
  FileText, 
  Calculator, 
  BookOpen, 
  Users, 
  DollarSign, 
  FileSpreadsheet, 
  Database, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  Mail, 
  Lock, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Award
} from 'lucide-react';
import { SystemCustomization } from '../types';

interface LandingPageViewProps {
  customization: SystemCustomization;
  onEnterSystem: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  customization,
  onEnterSystem,
}) => {
  const { landingPage } = customization;

  const modulesDelivered = [
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: 'Importador Inteligente de XMLs',
      subtitle: 'NF-e, NFS-e e CT-e em Lote',
      desc: 'Leitura ultrarrápida de arquivos magnéticos com extração completa de itens, NCM, CFOP, CSTs e retenções fiscais.',
      badge: 'Motor Fiscal Ativo',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      icon: <Calculator className="w-6 h-6 text-emerald-600" />,
      title: 'Apuração Fiscal & Fator R',
      subtitle: 'Simples Nacional & Lucro Presumido',
      desc: 'Cálculo automatizado do Fator R (28%), enquadramento inteligente entre Anexos III e V e segregação de receitas com redução de carga tributária.',
      badge: 'Economia Tributária',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
      title: 'Partidas Dobradas & Livros',
      subtitle: 'Diário, Razão, Balancete e DRE',
      desc: 'Integração contábil automática das notas fiscais e folha, garantindo o princípio contábil fundamental (Débito = Crédito).',
      badge: 'ITG 2000 Conforme',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: 'Folha de Pagamento & eSocial',
      subtitle: 'S-1200, S-1210 e DCTFWeb',
      desc: 'Tabelas progressivas oficiais 2026 de INSS e IRRF, emissão de holerites detalhados e geração de eventos para o eSocial.',
      badge: 'Conformidade Trabalhista',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      icon: <DollarSign className="w-6 h-6 text-amber-600" />,
      title: 'Sócios & Lucros Isentos',
      subtitle: 'QSA e Recibos Oficiais',
      desc: 'Distribuição formal de dividendos isentos amparada pela apuração contábil em dia, com geração de recibos formais de quitação.',
      badge: 'Isenção de IRPF',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-teal-600" />,
      title: 'SPED Fiscal & ECD Contábil',
      subtitle: 'EFD ICMS/IPI e ECD da RFB',
      desc: 'Validação e exportação dos arquivos no formato exato exigido pelos validadores oficiais (PVA) da Receita Federal.',
      badge: 'SPED Validado',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      icon: <Database className="w-6 h-6 text-emerald-500" />,
      title: 'Nuvem Relacional Supabase',
      subtitle: 'PostgreSQL Multi-dispositivo',
      desc: 'Persistência segura em 9 tabelas relacionais com integridade de chave estrangeira e restauração com 1 clique.',
      badge: 'Cloud Nativa',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-600" />,
      title: 'Governança, RBAC & ICP-Brasil',
      subtitle: 'Certificados A1 e Auditoria',
      desc: 'Controle de acesso para Administradores, Analistas e Operadores, gestão de certificados digitais e trilha de auditoria contínua.',
      badge: 'Segurança Máxima',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Banner de Contato & CRC */}
      <div className="bg-slate-900 text-slate-400 text-xs py-2 px-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            {customization.officeDisplayName} • {customization.crc}
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">CNPJ: {customization.cnpj}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-slate-400" />
            {customization.supportEmail}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-slate-400" />
            {customization.supportPhone}
          </span>
        </div>
      </div>

      {/* Navbar da Landing Page */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Nome */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md shadow-blue-500/20">
              {customization.shortName}
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight block">
                {customization.systemName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {customization.systemTagline}
              </span>
            </div>
          </div>

          {/* Links e Botão Entrar */}
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <a href="#modulos" className="hover:text-blue-600 transition-colors">Módulos Entregues</a>
              <a href="#fator-r" className="hover:text-blue-600 transition-colors">Motor Tributário</a>
              <a href="#supabase" className="hover:text-blue-600 transition-colors">Nuvem PostgreSQL</a>
              <a href="#seguranca" className="hover:text-blue-600 transition-colors">Governança</a>
            </nav>

            <button
              type="button"
              onClick={onEnterSystem}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{landingPage.ctaPrimaryText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{landingPage.heroBadge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            {landingPage.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            {landingPage.heroSubtitle}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onEnterSystem}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <span>{landingPage.ctaPrimaryText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/55${landingPage.whatsappContact}?text=Ol%C3%A1,%20gostaria%20de%20conhecer%20a%20plataforma%20cont%C3%A1bil`}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Falar via WhatsApp</span>
            </a>
          </div>

          {/* Mini-Painel de Prévia do Sistema */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-800 text-left text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-mono text-slate-400 ml-2">painel-contabil.audicon.cnt.br</span>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ● PostgreSQL Supabase: Sincronizado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Simples Nacional (Fator R)</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">32,8% • Anexo III</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Economia estimada: -42% no DAS</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Equilíbrio Contábil</span>
                  <div className="text-lg font-bold text-blue-400 mt-1">Débito = Crédito</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Balancete 100% balanceado</div>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Obrigações eSocial</span>
                  <div className="text-lg font-bold text-purple-400 mt-1">S-1200 / S-1210</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Recibo homologado na RFB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESTATÍSTICAS DE IMPACTO */}
      <section className="bg-white py-12 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">
                {landingPage.stat1Number}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {landingPage.stat1Label}
              </div>
            </div>

            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 tracking-tight">
                {landingPage.stat2Number}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {landingPage.stat2Label}
              </div>
            </div>

            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 tracking-tight">
                {landingPage.stat3Number}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {landingPage.stat3Label}
              </div>
            </div>

            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 tracking-tight">
                {landingPage.stat4Number}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                {landingPage.stat4Label}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: TODOS OS MÓDULOS ENTREGUES */}
      <section id="modulos" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Arquitetura Funcional Completa
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Todas as Entregas Integradas em um Único Ecossistema
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Do XML emitido pelo fornecedor à transmissão do SPED e fechamento do balanço patrimonial com persistência relacional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modulesDelivered.map((mod, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {mod.icon}
                </div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {mod.title}
                </h3>
                <h4 className="text-xs font-semibold text-slate-500 mb-2">
                  {mod.subtitle}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                <span>Pronto no Painel</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO: DESTAQUE MOTOR TRIBUTÁRIO & FATOR R */}
      <section id="fator-r" className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
              Inteligência Tributária
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Otimização Fiscal Automática com o Fator R
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Nosso motor calcula mês a mês a razão entre a folha de pagamento dos últimos 12 meses e a receita bruta acumulada (RBT12). Atividades sujeitas ao Fator R migram automaticamente do Anexo V (alíquotas a partir de 15,5%) para o Anexo III (alíquotas a partir de 6%), gerando economia lícita imediata para sua empresa.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Simulação do pró-labore ideal para atingir 28% de Fator R.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Geração do DAS com detalhamento de todos os 8 tributos federais e municipais.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Conexão direta com o plano de contas e contabilização instantânea da despesa tributária.</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={onEnterSystem}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Acessar Módulo de Apuração</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase">Cenário Comparativo Real</div>
            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Receita Bruta do Mês:</span>
                <span className="font-bold text-white font-mono">R$ 50.000,00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Folha de Pagamento + Encargos:</span>
                <span className="font-bold text-white font-mono">R$ 14.500,00 (29,0%)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                <span className="text-[10px] text-rose-300 font-bold uppercase block">Sem Fator R (Anexo V)</span>
                <span className="text-lg font-bold text-rose-400 font-mono">R$ 7.750,00</span>
                <span className="text-[10px] text-rose-300 block mt-1">Alíquota Efetiva: 15,5%</span>
              </div>

              <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
                <span className="text-[10px] text-emerald-300 font-bold uppercase block">Com Fator R (Anexo III)</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">R$ 3.000,00</span>
                <span className="text-[10px] text-emerald-300 block mt-1">Alíquota Efetiva: 6,0%</span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/50 border border-blue-800/40 rounded-xl text-center text-xs font-bold text-blue-300">
              Economia Líquida de R$ 4.750,00 neste mês (61,3% de redução no tributo)
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL DE CONVERSÃO */}
      <section className="py-20 px-6 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pronto para transformar a gestão contábil e fiscal do seu escritório?
          </h2>
          <p className="text-blue-100 text-base max-w-2xl mx-auto">
            Acesse agora o painel completo com todas as 9 tabelas do Supabase integradas, cálculo do Fator R e exportação oficial do SPED.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={onEnterSystem}
              className="px-8 py-4 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{landingPage.ctaPrimaryText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* RODAPÉ OFICIAL */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              {customization.shortName}
            </div>
            <div>
              <span className="font-bold text-white text-sm block">
                {customization.systemName}
              </span>
              <span className="text-[11px] text-slate-500">
                {customization.officeDisplayName} • {customization.crc}
              </span>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500 space-y-1">
            <div>© 2026 {customization.systemName} Solutions. Todos os direitos reservados.</div>
            <div>Conformidade ICP-Brasil • Normas Brasileiras de Contabilidade (NBC TG / ITG 2000)</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
