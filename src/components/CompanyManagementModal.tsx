import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Search, 
  X, 
  ShieldAlert, 
  FileText, 
  DollarSign, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { Company, TaxRegime } from '../types';

interface CompanyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  selectedCompanyId: string;
  onSelectCompany: (company: Company) => void;
  onAddCompany: (company: Omit<Company, 'id'>) => void;
  onUpdateCompany: (company: Company) => void;
  onDeleteCompany: (companyId: string) => void;
  onToggleCompanyStatus: (companyId: string) => void;
}

export const CompanyManagementModal: React.FC<CompanyManagementModalProps> = ({
  isOpen,
  onClose,
  companies,
  selectedCompanyId,
  onSelectCompany,
  onAddCompany,
  onUpdateCompany,
  onDeleteCompany,
  onToggleCompanyStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [ie, setIe] = useState('');
  const [uf, setUf] = useState('SP');
  const [cidade, setCidade] = useState('');
  const [regimeTributario, setRegimeTributario] = useState<TaxRegime>('SIMPLES_NACIONAL');
  const [anexoSimples, setAnexoSimples] = useState<'ANEXO_I' | 'ANEXO_II' | 'ANEXO_III' | 'ANEXO_IV' | 'ANEXO_V'>('ANEXO_I');
  const [cnae, setCnae] = useState('');
  const [atividadePrincipal, setAtividadePrincipal] = useState('');
  const [rbt12, setRbt12] = useState<number>(360000);
  const [sujeitoFatorR, setSujeitoFatorR] = useState<boolean>(false);
  const [folha12Meses, setFolha12Meses] = useState<number>(100000);

  if (!isOpen) return null;

  const resetForm = () => {
    setRazaoSocial('');
    setNomeFantasia('');
    setCnpj('');
    setIe('');
    setUf('SP');
    setCidade('');
    setRegimeTributario('SIMPLES_NACIONAL');
    setAnexoSimples('ANEXO_I');
    setCnae('');
    setAtividadePrincipal('');
    setRbt12(360000);
    setSujeitoFatorR(false);
    setFolha12Meses(100000);
    setEditingCompany(null);
    setIsAddingNew(false);
  };

  const startEdit = (comp: Company) => {
    setEditingCompany(comp);
    setRazaoSocial(comp.razaoSocial);
    setNomeFantasia(comp.nomeFantasia || '');
    setCnpj(comp.cnpj);
    setIe(comp.ie);
    setUf(comp.uf);
    setCidade(comp.cidade);
    setRegimeTributario(comp.regimeTributario);
    setAnexoSimples(comp.anexoSimples || 'ANEXO_I');
    setCnae(comp.cnae);
    setAtividadePrincipal(comp.atividadePrincipal);
    setRbt12(comp.rbt12);
    setSujeitoFatorR(!!comp.sujeitoFatorR);
    setFolha12Meses(comp.folha12Meses || 0);
    setIsAddingNew(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!razaoSocial.trim() || !cnpj.trim()) return;

    if (editingCompany) {
      // Atualizar existente
      onUpdateCompany({
        ...editingCompany,
        razaoSocial: razaoSocial.trim(),
        nomeFantasia: nomeFantasia.trim() || razaoSocial.trim(),
        cnpj: cnpj.trim(),
        ie: ie.trim(),
        uf: uf.trim().toUpperCase(),
        cidade: cidade.trim(),
        regimeTributario,
        anexoSimples: regimeTributario === 'SIMPLES_NACIONAL' ? anexoSimples : undefined,
        cnae: cnae.trim(),
        atividadePrincipal: atividadePrincipal.trim(),
        rbt12: Number(rbt12) || 0,
        sujeitoFatorR,
        folha12Meses: Number(folha12Meses) || 0,
      });
    } else {
      // Cadastrar nova empresa
      onAddCompany({
        tenantId: 'office-1',
        razaoSocial: razaoSocial.trim(),
        nomeFantasia: nomeFantasia.trim() || razaoSocial.trim(),
        cnpj: cnpj.trim(),
        ie: ie.trim(),
        uf: uf.trim().toUpperCase(),
        cidade: cidade.trim(),
        regimeTributario,
        anexoSimples: regimeTributario === 'SIMPLES_NACIONAL' ? anexoSimples : undefined,
        cnae: cnae.trim(),
        atividadePrincipal: atividadePrincipal.trim(),
        rbt12: Number(rbt12) || 0,
        sujeitoFatorR,
        folha12Meses: Number(folha12Meses) || 0,
        ativo: true,
      });
    }

    resetForm();
  };

  const filteredCompanies = companies.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.razaoSocial.toLowerCase().includes(q) ||
      (c.nomeFantasia && c.nomeFantasia.toLowerCase().includes(q)) ||
      c.cnpj.includes(q) ||
      c.cnae.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Gestão Central de Empresas Clientes</h2>
              <p className="text-xs text-slate-400">Cadastre, edite, bloqueie ou exclua empresas atendidas pelo escritório</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Formulário de Cadastro / Edição */}
          {isAddingNew ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">
                    {editingCompany ? 'Editar Dados da Empresa' : 'Cadastrar Nova Empresa Cliente'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Razão Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={razaoSocial}
                      onChange={e => setRazaoSocial(e.target.value)}
                      placeholder="ex: Comercial Alimentos Brasil Ltda"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      value={nomeFantasia}
                      onChange={e => setNomeFantasia(e.target.value)}
                      placeholder="ex: Alimentos Brasil"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      required
                      value={cnpj}
                      onChange={e => setCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Inscrição Estadual (IE)
                    </label>
                    <input
                      type="text"
                      value={ie}
                      onChange={e => setIe(e.target.value)}
                      placeholder="ex: 123.456.789.110 ou ISENTO"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Cidade e UF *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={cidade}
                        onChange={e => setCidade(e.target.value)}
                        placeholder="São Paulo"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        maxLength={2}
                        value={uf}
                        onChange={e => setUf(e.target.value.toUpperCase())}
                        placeholder="SP"
                        className="w-14 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-center font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Regime Tributário *
                    </label>
                    <select
                      value={regimeTributario}
                      onChange={e => setRegimeTributario(e.target.value as TaxRegime)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-slate-800"
                    >
                      <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                      <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                      <option value="LUCRO_REAL">Lucro Real</option>
                    </select>
                  </div>

                  {regimeTributario === 'SIMPLES_NACIONAL' && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Anexo do Simples Nacional
                      </label>
                      <select
                        value={anexoSimples}
                        onChange={e => setAnexoSimples(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="ANEXO_I">Anexo I - Comércio</option>
                        <option value="ANEXO_II">Anexo II - Indústria</option>
                        <option value="ANEXO_III">Anexo III - Serviços</option>
                        <option value="ANEXO_IV">Anexo IV - Serviços Específicos</option>
                        <option value="ANEXO_V">Anexo V - Serviços (Fator R)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      CNAE Principal
                    </label>
                    <input
                      type="text"
                      value={cnae}
                      onChange={e => setCnae(e.target.value)}
                      placeholder="ex: 4711-3/02"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Descrição da Atividade Principal
                    </label>
                    <input
                      type="text"
                      value={atividadePrincipal}
                      onChange={e => setAtividadePrincipal(e.target.value)}
                      placeholder="ex: Comércio varejista de mercadorias em geral"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Receita Bruta Acumulada (RBT12) - R$
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={rbt12}
                      onChange={e => setRbt12(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Folha Acumulada 12 Meses (FS12) - R$
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={folha12Meses}
                      onChange={e => setFolha12Meses(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                  >
                    {editingCompany ? 'Salvar Alterações' : 'Concluir Cadastro'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por Razão Social, CNPJ ou CNAE..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsAddingNew(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Nova Empresa
              </button>
            </div>
          )}

          {/* Tabela de Empresas */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">CNPJ & Local</th>
                  <th className="py-3 px-4">Regime Tributário</th>
                  <th className="py-3 px-4">RBT12</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCompanies.map(comp => {
                  const isCurrentActive = comp.id === selectedCompanyId;
                  return (
                    <tr 
                      key={comp.id} 
                      className={`hover:bg-slate-50 transition-colors ${
                        isCurrentActive ? 'bg-blue-50/50 font-medium' : ''
                      } ${!comp.ativo ? 'opacity-75 bg-slate-50/50' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrentActive 
                              ? 'bg-blue-600 text-white' 
                              : comp.ativo 
                              ? 'bg-slate-200 text-slate-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {comp.razaoSocial}
                              {isCurrentActive && (
                                <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                                  Ativa
                                </span>
                              )}
                            </div>
                            {comp.nomeFantasia && (
                              <div className="text-[10px] text-slate-500">{comp.nomeFantasia}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-slate-800">{comp.cnpj}</div>
                        <div className="text-[10px] text-slate-500">{comp.cidade}/{comp.uf}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          comp.regimeTributario === 'SIMPLES_NACIONAL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {comp.regimeTributario === 'SIMPLES_NACIONAL' ? 'Simples Nacional' : 'Lucro Presumido'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                        R$ {comp.rbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          comp.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {comp.ativo ? 'Ativa' : 'Bloqueada'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Selecionar como ativa */}
                          {!isCurrentActive && comp.ativo && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectCompany(comp);
                                onClose();
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                              title="Trabalhar nesta empresa agora"
                            >
                              Selecionar
                            </button>
                          )}

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => startEdit(comp)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Editar empresa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Bloquear / Desbloquear */}
                          <button
                            type="button"
                            onClick={() => onToggleCompanyStatus(comp.id)}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              comp.ativo
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-amber-600 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={comp.ativo ? 'Bloquear empresa' : 'Desbloquear empresa'}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(comp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Excluir empresa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-5 max-w-sm w-full space-y-3 shadow-xl border border-slate-200">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-slate-900 text-sm">Excluir Empresa Cliente?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Esta ação removerá a empresa do cadastro contábil. Deseja realmente prosseguir?
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteCompany(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-sm"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>{companies.length} empresas cadastradas no escritório</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
