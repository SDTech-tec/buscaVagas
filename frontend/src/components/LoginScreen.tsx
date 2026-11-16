import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.login(password.trim());
      if (res.token) {
        onLoginSuccess(res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Senha incorreta. Acesso restrito a Pedro Paulo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 shadow-2xl relative z-10 text-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/40 text-white font-extrabold text-2xl">
            VC
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Vaga Certa</h1>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-400" /> Acesso Pessoal e Exclusivo
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Recrutador digital autônomo configurado para o perfil de <strong className="text-slate-200">Pedro Paulo dos Santos Dantas</strong>.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Chave de Acesso Pessoal (Senha Mestra)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha de acesso..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center space-x-2 ${
              loading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 active:scale-98 shadow-blue-900/40'
            }`}
          >
            <span>{loading ? 'Validando...' : 'Acessar Meu Recrutador'}</span>
            {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="pt-4 border-t border-slate-700/60 text-center text-[11px] text-slate-400 leading-relaxed">
          🔒 <strong className="text-slate-300">Privacidade Absoluta:</strong> Apenas você tem acesso às suas vagas, evidências oficiais e respostas personalizadas.
        </div>
      </div>
    </div>
  );
};

