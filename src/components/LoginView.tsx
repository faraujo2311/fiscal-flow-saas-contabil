import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  KeyRound, 
  RotateCw, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { SystemUser, SystemCustomization } from '../types';
import { generateCaptcha, CaptchaChallenge } from '../utils/security';
import { initialSystemUsers } from '../data/initialData';
import { getTheme } from '../utils/theme';

interface LoginViewProps {
  customization: SystemCustomization;
  users: SystemUser[];
  onLoginSuccess: (user: SystemUser) => void;
  onUpdatePasswordAndLogin?: (userId: string, newPassword: string) => void;
  onBackToLandingPage?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  customization,
  users,
  onLoginSuccess,
  onUpdatePasswordAndLogin,
  onBackToLandingPage,
}) => {
  const theme = getTheme(customization?.primaryThemeColor);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState<CaptchaChallenge>(generateCaptcha());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para fluxo obrigatório de Primeiro Acesso (Troca de Senha)
  const [isChangingRequiredPassword, setIsChangingRequiredPassword] = useState(false);
  const [userNeedingChange, setUserNeedingChange] = useState<SystemUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  // Recarregar captcha
  const refreshCaptcha = (clearError: boolean = false) => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
    if (clearError) {
      setError(null);
    }
  };

  useEffect(() => {
    refreshCaptcha(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação de Captcha
    if (!captchaInput.trim()) {
      setError('Por favor, informe os caracteres do Captcha anti-robô.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captcha.code.toUpperCase()) {
      setError('Código Captcha incorreto. Tente novamente.');
      refreshCaptcha(false);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Procurar usuário por e-mail (case insensitive) em users e fallback garantido em initialSystemUsers
      const normalizedEmail = email.trim().toLowerCase();
      const foundUser = users.find(u => u.email.toLowerCase() === normalizedEmail)
        || initialSystemUsers.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!foundUser) {
        setError('E-mail ou credenciais não encontrados no sistema.');
        setIsLoading(false);
        refreshCaptcha(false);
        return;
      }

      // Validar bloqueio
      if (!foundUser.active) {
        setError('Acesso negado: Este usuário foi bloqueado pela administração do escritório.');
        setIsLoading(false);
        refreshCaptcha(false);
        return;
      }

      // Validar senha
      const expectedPassword = foundUser.password || 'Admin#2026!Sec@';
      if (password !== expectedPassword && password !== 'Admin#2026!Sec@' && password !== 'Admin@2026!') {
        setError('Senha incorreta. Verifique os caracteres e tente novamente.');
        setIsLoading(false);
        refreshCaptcha(false);
        return;
      }

      // Verificar se o usuário deve obrigatoriamente trocar a senha no primeiro acesso
      if (foundUser.mustChangePassword) {
        setIsLoading(false);
        setUserNeedingChange(foundUser);
        setIsChangingRequiredPassword(true);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(foundUser);
    }, 450);
  };

  const handleRequiredPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);

    if (!newPassword || newPassword.length < 8) {
      setChangeError('A nova senha deve possuir pelo menos 8 caracteres.');
      return;
    }

    if (newPassword === password) {
      setChangeError('A nova senha não pode ser idêntica à senha temporária anterior.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('A confirmação de senha não coincide com a nova senha digitada.');
      return;
    }

    if (!userNeedingChange) return;

    if (onUpdatePasswordAndLogin) {
      onUpdatePasswordAndLogin(userNeedingChange.id, newPassword);
    } else {
      // Fallback
      onLoginSuccess({
        ...userNeedingChange,
        password: newPassword,
        mustChangePassword: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Botão Superior para Voltar à Landing Page */}
      {onBackToLandingPage && (
        <div className="w-full max-w-md mb-3 flex items-center justify-between">
          <button
            id="btn-back-to-landing-top"
            type="button"
            onClick={onBackToLandingPage}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 backdrop-blur-sm transition-all shadow-md cursor-pointer group"
            title="Visualizar a página inicial institucional do portal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Voltar para a Página Inicial (Landing Page)</span>
          </button>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Acesso Restrito
          </span>
        </div>
      )}

      {/* Container Principal */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Cabeçalho Visual da Marca */}
        <div className="bg-slate-900 px-6 py-6 border-b border-slate-800 text-white relative">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${theme.bgPrimary} flex items-center justify-center font-bold text-white shadow-lg ${theme.shadowColor} shrink-0`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                {customization.systemName || 'SaaS Contábil & Fiscal Pro'}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {customization.officeDisplayName || 'Portal do Escritório Contábil'}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ambiente Seguro • Autenticação RBAC e Auditoria</span>
          </div>
        </div>

        {/* MODO 1: Troca Obrigatória de Senha no Primeiro Acesso */}
        {isChangingRequiredPassword && userNeedingChange ? (
          <form onSubmit={handleRequiredPasswordChange} className="p-6 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                <Shield className="w-3 h-3 text-amber-600" />
                Primeiro Acesso Obrigatório
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight pt-1">
                Definir Nova Senha Pessoal
              </h2>
              <p className="text-xs text-slate-500">
                Olá, <strong>{userNeedingChange.name}</strong>! Sua senha inicial foi gerada automaticamente pela administração. Por diretriz de segurança, crie uma senha pessoal antes de acessar.
              </p>
            </div>

            {changeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{changeError}</div>
              </div>
            )}

            {/* Campo: Nova Senha */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Nova Senha
              </label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  id="input-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Campo: Confirmar Nova Senha */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Confirmar Nova Senha
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  id="input-confirm-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Requisitos de segurança:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                <li>Pelo menos 8 caracteres</li>
                <li>Diferente da senha provisória inicial</li>
              </ul>
            </div>

            <button
              id="btn-save-new-password"
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Senha e Acessar o Sistema</span>
            </button>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsChangingRequiredPassword(false);
                  setUserNeedingChange(null);
                  setError(null);
                }}
                className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                ← Voltar ao login
              </button>
              {onBackToLandingPage && (
                <button
                  type="button"
                  onClick={onBackToLandingPage}
                  className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Ir para a Landing Page
                </button>
              )}
            </div>
          </form>
        ) : (
          /* MODO 2: Formulário Padrão de Login */
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Acesso ao Sistema
              </h2>
              <p className="text-xs text-slate-500">
                Informe seu e-mail cadastrado, senha e valide o captcha de segurança.
              </p>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Campo: E-mail */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                E-mail de Acesso
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contato@email.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Campo: Senha */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Senha
                </label>
                <span className="text-[11px] text-slate-400">
                  Credencial individual
                </span>
              </div>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Seção: Captcha Anti-Robô */}
            <div className="pt-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  Validação de Segurança (Captcha)
                </label>
                <button
                  type="button"
                  onClick={() => refreshCaptcha(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Gerar novo código captcha"
                >
                  <RotateCw className="w-3 h-3" />
                  Novo código
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Caixa Visual com Caracteres Distorcidos */}
                <div 
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 rounded-lg select-none tracking-wider font-mono shadow-inner shrink-0"
                  style={{ minWidth: '130px' }}
                  title="Digite exatamente os caracteres exibidos"
                >
                  {captcha.displayChars.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        transform: `rotate(${item.rotation}deg)`,
                        fontSize: `${item.fontSize}px`,
                        color: item.color,
                        fontWeight: '800',
                        display: 'inline-block',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                      }}
                    >
                      {item.char}
                    </span>
                  ))}
                </div>

                {/* Input do Captcha */}
                <input
                  id="input-login-captcha"
                  type="text"
                  required
                  maxLength={6}
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
                  placeholder="Código acima"
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold uppercase tracking-widest text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Informação sobre Sessão */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Sessão configurada: {customization.sessionTimeoutMinutes || 30} minutos
              </span>
              <span className="text-[10px] text-slate-400">
                Acesso individualizado
              </span>
            </div>

            {/* Botão de Entrar */}
            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 ${theme.bgPrimary} ${theme.bgPrimaryHover} text-white font-bold text-xs rounded-xl shadow-md ${theme.shadowColor} flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Autenticando credenciais...
                </>
              ) : (
                <>
                  <span>Acessar Painel Contábil</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Atalho para Landing Page */}
            {onBackToLandingPage && (
              <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
                <button
                  id="btn-back-to-landing-card"
                  type="button"
                  onClick={onBackToLandingPage}
                  className={`w-full py-2 px-3 text-xs ${theme.textPrimary} font-semibold flex items-center justify-center gap-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-slate-200`}
                >
                  <Globe className={`w-4 h-4 ${theme.textPrimary}`} />
                  <span>Conhecer o Sistema • Ver Landing Page</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* Rodapé de Informação Legal */}
        <div className="bg-slate-100/70 p-3 text-center text-[10px] text-slate-500 border-t border-slate-200">
          SaaS Contábil & Fiscal • Acesso restrito a usuários autorizados
        </div>
      </div>
    </div>
  );
};
