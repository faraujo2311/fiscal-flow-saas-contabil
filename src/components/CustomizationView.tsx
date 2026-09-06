import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Globe, 
  Building2, 
  Eye, 
  Save, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  AlertTriangle,
  UserCheck,
  Check
} from 'lucide-react';
import { SystemCustomization } from '../types';
import { getTheme, themeConfigs, ThemeColor } from '../utils/theme';

interface CustomizationViewProps {
  customization: SystemCustomization;
  onSaveCustomization: (newCustom: SystemCustomization) => void;
  onOpenLandingPage: () => void;
  onResetData?: () => void;
}

export const CustomizationView: React.FC<CustomizationViewProps> = ({
  customization,
  onSaveCustomization,
  onOpenLandingPage,
  onResetData,
}) => {
  const [formData, setFormData] = useState<SystemCustomization>(customization);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'branding' | 'landing'>('branding');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sincronizar com mudanças na prop customization
  useEffect(() => {
    setFormData(customization);
  }, [customization]);

  const activeTheme = getTheme(formData.primaryThemeColor);

  const handleFieldChange = <K extends keyof SystemCustomization>(field: K, value: SystemCustomization[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLandingChange = <K extends keyof SystemCustomization['landingPage']>(
    field: K, 
    value: SystemCustomization['landingPage'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      landingPage: {
        ...prev.landingPage,
        [field]: value
      }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCustomization(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const colorThemes: { id: ThemeColor; name: string; hex: string; bgClass: string; ringColor: string }[] = [
    { id: 'blue', name: 'Azul Executivo', hex: '#2563EB', bgClass: 'bg-blue-600', ringColor: 'ring-blue-500' },
    { id: 'emerald', name: 'Verde Esmeralda', hex: '#059669', bgClass: 'bg-emerald-600', ringColor: 'ring-emerald-500' },
    { id: 'indigo', name: 'Índigo Moderno', hex: '#4F46E5', bgClass: 'bg-indigo-600', ringColor: 'ring-indigo-500' },
    { id: 'slate', name: 'Slate Corporativo', hex: '#334155', bgClass: 'bg-slate-700', ringColor: 'ring-slate-500' },
    { id: 'violet', name: 'Violeta Premium', hex: '#7C3AED', bgClass: 'bg-violet-600', ringColor: 'ring-violet-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              White-Label & Identidade Visual
            </span>
            <span className="text-xs text-slate-500 font-medium">
              SaaS Multi-Tenant Contábil
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Palette className="w-6 h-6 text-indigo-600" />
            Personalização do Sistema & Landing Page
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure o nome do sistema, dados do seu escritório contábil, identidade visual e os textos de conversão da Landing Page pública.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenLandingPage}
            className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Visualizar Landing Page
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Personalização
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Personalização aplicada com sucesso! Os cabeçalhos, barra lateral e a Landing Page foram atualizados.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Branding & Dados do Escritório
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('landing')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'landing'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Conteúdo da Landing Page Profissional
        </button>
      </div>

      {/* Conteúdo */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Nome do Software e Identidade Institucional
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Substitua a marca padrão pelo nome do seu próprio escritório ou da sua solução contábil proprietária.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nome do Sistema (Exibido na barra lateral e topo)
                </label>
                <input
                  type="text"
                  value={formData.systemName}
                  onChange={e => handleFieldChange('systemName', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  placeholder="Ex: Lumen Contábil"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nome Curto / Sigla do Logo (1 a 5 caracteres)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={formData.shortName}
                  onChange={e => handleFieldChange('shortName', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  placeholder="Ex: L ou AUD"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Slogan Institucional / Tagline
                </label>
                <input
                  type="text"
                  value={formData.systemTagline}
                  onChange={e => handleFieldChange('systemTagline', e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  placeholder="Ex: Plataforma Integrada de Inteligência Fiscal, Contábil e SPED"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Razão Social / Nome do Escritório Contábil
                </label>
                <input
                  type="text"
                  value={formData.officeDisplayName}
                  onChange={e => handleFieldChange('officeDisplayName', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  placeholder="Ex: Audicon Contabilidade & Compliance Tributário S/S"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>Nome do Contador / Auditor Responsável</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Exibido no Cabeçalho</span>
                </label>
                <input
                  id="input-accountant-name"
                  type="text"
                  value={formData.accountantName || ''}
                  onChange={e => handleFieldChange('accountantName', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  placeholder="Ex: Carlos Eduardo Silva ou Fábio Araújo"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Exibido no menu superior ao lado do CRC com o selo de conformidade contábil.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span>CRC do Responsável Técnico</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Exibido no Cabeçalho</span>
                </label>
                <input
                  id="input-crc-responsavel"
                  type="text"
                  value={formData.crc}
                  onChange={e => handleFieldChange('crc', e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  placeholder="Ex: CRC/SP 1SP234567/O-8"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  CNPJ do Escritório
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={e => handleFieldChange('cnpj', e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  E-mail de Contato / Suporte
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={e => handleFieldChange('supportEmail', e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  placeholder="contato@escritorio.cnt.br"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Telefone / WhatsApp de Suporte
                </label>
                <input
                  type="text"
                  value={formData.supportPhone}
                  onChange={e => handleFieldChange('supportPhone', e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  placeholder="(11) 3456-7890"
                />
              </div>
            </div>

            {/* Seletor de Cores */}
            <div className="pt-5 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800">
                    Paleta de Cores Primária do Sistema
                  </label>
                  <p className="text-xs text-slate-500">
                    Define a cor dos botões de ação, cabeçalho de auditoria, navegação ativa e elementos da marca.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">Cor Ativa:</span>
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: activeTheme.hex }}
                  >
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    {activeTheme.name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                {colorThemes.map(c => {
                  const isSelected = formData.primaryThemeColor === c.id;
                  return (
                    <button
                      key={c.id}
                      id={`theme-select-${c.id}`}
                      type="button"
                      onClick={() => handleFieldChange('primaryThemeColor', c.id)}
                      className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-800/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${c.bgClass} shrink-0 shadow-xs flex items-center justify-center text-white`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.hex}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Prévia em Tempo Real dos Componentes com a Paleta Selecionada */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Prévia em Tempo Real com a Paleta "{activeTheme.name}"
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Atualiza imediatamente ao salvar
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Mock Cabeçalho */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                      style={{ backgroundColor: activeTheme.hex }}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {formData.officeDisplayName || 'Nome do Escritório'}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="font-mono">{formData.crc || 'CRC/UF 123456'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 truncate" style={{ color: activeTheme.hex }}>
                          <UserCheck className="w-3 h-3 shrink-0" />
                          {formData.accountantName || 'Nome do Auditor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Item de Navegação Ativo */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-xs flex items-center justify-between">
                    <div 
                      className="px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-2 border"
                      style={{ 
                        backgroundColor: activeTheme.hex + '20', 
                        color: activeTheme.hex,
                        borderColor: activeTheme.hex + '40'
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Menu Ativo</span>
                    </div>
                    <span 
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: activeTheme.hex }}
                    >
                      Ativo
                    </span>
                  </div>

                  {/* Mock Botões de Ação */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: activeTheme.hex }}
                    >
                      Ação Principal
                    </button>
                    <span 
                      className="px-2.5 py-1 rounded-md text-xs font-bold border"
                      style={{ 
                        backgroundColor: activeTheme.hex + '15', 
                        color: activeTheme.hex,
                        borderColor: activeTheme.hex + '30'
                      }}
                    >
                      Tag Destaque
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuração de Sessão e Segurança */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Segurança & Tempo Limite de Sessão
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Define o tempo em minutos para desconexão automática (logout) por inatividade dos usuários.
              </p>

              <div className="max-w-xs">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tempo Limite por Sessão (minutos)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={240}
                    value={formData.sessionTimeoutMinutes || 30}
                    onChange={e => handleFieldChange('sessionTimeoutMinutes', Math.max(5, parseInt(e.target.value) || 30))}
                    className="w-32 text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-semibold">minutos de inatividade</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Recomendado para conformidade LGPD e segurança contábil: entre 15 e 60 minutos.
                </p>
              </div>
            </div>

            {/* Restauração dos Dados de Demonstração (Demo) */}
            {onResetData && (
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Restauração de Dados de Demonstração (Demo)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Caso deseje retornar o ambiente para o estado inicial de fábrica da demonstração com todas as empresas e lançamentos de exemplo.
                </p>

                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  Restaurar Banco de Demonstração Original
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'landing' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900">
                Textos e Chamadas da Landing Page
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Personalize a apresentação comercial para clientes e prospects, destacando a conformidade, tecnologia em nuvem e velocidade de apuração.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Badge de Destaque Superior (Hero Badge)
                </label>
                <input
                  type="text"
                  value={formData.landingPage.heroBadge}
                  onChange={e => handleLandingChange('heroBadge', e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Título Principal de Impacto (Hero Title)
                </label>
                <input
                  type="text"
                  value={formData.landingPage.heroTitle}
                  onChange={e => handleLandingChange('heroTitle', e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Subtítulo / Descrição de Valor
                </label>
                <textarea
                  rows={2}
                  value={formData.landingPage.heroSubtitle}
                  onChange={e => handleLandingChange('heroSubtitle', e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Texto do Botão de Ação Primário
                  </label>
                  <input
                    type="text"
                    value={formData.landingPage.ctaPrimaryText}
                    onChange={e => handleLandingChange('ctaPrimaryText', e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    WhatsApp Comercial (somente números com DDD)
                  </label>
                  <input
                    type="text"
                    value={formData.landingPage.whatsappContact}
                    onChange={e => handleLandingChange('whatsappContact', e.target.value)}
                    className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500 text-slate-900"
                    placeholder="Ex: 11987654321"
                  />
                </div>
              </div>

              {/* 4 Métricas de Destaque */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-3">
                  4 Métricas de Credibilidade & Estatísticas
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Métrica 1</span>
                    <input
                      type="text"
                      value={formData.landingPage.stat1Number}
                      onChange={e => handleLandingChange('stat1Number', e.target.value)}
                      className="w-full text-sm font-bold text-indigo-600 bg-white border border-slate-300 rounded px-2 py-1 mt-1 mb-1"
                    />
                    <input
                      type="text"
                      value={formData.landingPage.stat1Label}
                      onChange={e => handleLandingChange('stat1Label', e.target.value)}
                      className="w-full text-[11px] text-slate-700 bg-white border border-slate-300 rounded px-2 py-1"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Métrica 2</span>
                    <input
                      type="text"
                      value={formData.landingPage.stat2Number}
                      onChange={e => handleLandingChange('stat2Number', e.target.value)}
                      className="w-full text-sm font-bold text-indigo-600 bg-white border border-slate-300 rounded px-2 py-1 mt-1 mb-1"
                    />
                    <input
                      type="text"
                      value={formData.landingPage.stat2Label}
                      onChange={e => handleLandingChange('stat2Label', e.target.value)}
                      className="w-full text-[11px] text-slate-700 bg-white border border-slate-300 rounded px-2 py-1"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Métrica 3</span>
                    <input
                      type="text"
                      value={formData.landingPage.stat3Number}
                      onChange={e => handleLandingChange('stat3Number', e.target.value)}
                      className="w-full text-sm font-bold text-indigo-600 bg-white border border-slate-300 rounded px-2 py-1 mt-1 mb-1"
                    />
                    <input
                      type="text"
                      value={formData.landingPage.stat3Label}
                      onChange={e => handleLandingChange('stat3Label', e.target.value)}
                      className="w-full text-[11px] text-slate-700 bg-white border border-slate-300 rounded px-2 py-1"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Métrica 4</span>
                    <input
                      type="text"
                      value={formData.landingPage.stat4Number}
                      onChange={e => handleLandingChange('stat4Number', e.target.value)}
                      className="w-full text-sm font-bold text-indigo-600 bg-white border border-slate-300 rounded px-2 py-1 mt-1 mb-1"
                    />
                    <input
                      type="text"
                      value={formData.landingPage.stat4Label}
                      onChange={e => handleLandingChange('stat4Label', e.target.value)}
                      className="w-full text-[11px] text-slate-700 bg-white border border-slate-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação para Restaurar Demo */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Restaurar Banco Demo</h3>
                <p className="text-xs text-slate-500">Atenção aos dados não sincronizados</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja realmente restaurar os dados de demonstração iniciais? Isso reiniciará as empresas, planos de contas e parâmetros para o modelo padrão da demonstração.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetData) {
                    onResetData();
                  }
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sim, Restaurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
