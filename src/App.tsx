import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Database, 
  ExternalLink, 
  Copy, 
  Check, 
  BookOpen, 
  Settings, 
  RefreshCw, 
  Layers, 
  Play, 
  Flame,
  FileText,
  UserCheck,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

// Define the tabs we want
type Tab = 'overview' | 'bugs' | 'dockerfiles' | 'database';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Interactive Checklist Persisted in localStorage
  const [checklist, setChecklist] = useState({
    dockerfileFrontend: false,
    dockerfileBackend: false,
    piniaAuthBug: false,
    apiEnvVarUrl: false,
    easypanelVolume: false,
    prismaMigrationSeed: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('gestao_faltas_checklist');
    if (saved) {
      try {
        setChecklist(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const toggleCheck = (key: keyof typeof checklist) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    localStorage.setItem('gestao_faltas_checklist', JSON.stringify(updated));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const totalSteps = Object.keys(checklist).length;
  const completedSteps = Object.values(checklist).filter(Boolean).length;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  // Content Snippets for copying
  const frontendStoreBefore = `// Em frontend/src/stores/auth.ts
// ...
  async function logoutRemote() {
    try {
      await (await import('../services/api')).logoutRequest();
    } catch (e) {
      // ignore
    }
    logout();
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // erro aqui! logoutRemote não está sendo retornado!
  return { token, user, isLoggedIn, setAuth, logout };
});`;

  const frontendStoreAfter = `// Em frontend/src/stores/auth.ts (CORRIGIDO)
// ...
  async function logoutRemote() {
    try {
      await (await import('../services/api')).logoutRequest();
    } catch (e) {
      // ignore
    }
    logout();
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // RETORNOU logoutRemote para o TypeScript enxergar!
  return { token, user, isLoggedIn, setAuth, logout, logoutRemote };
});`;

  const dockerfileFrontendProduction = `# Estágio 1: Compilação das dependências e build do Vue
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Estágio 2: Nginx de alta performance para servir SPA
FROM nginx:alpine

# Copiar arquivos de build do SPA Vue
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Configuração customizada do Nginx para suportar roteamento Vue Router SPA (opcional mas ideal)
RUN echo 'server { \\
    listen 80; \\
    location / { \\
        root /usr/share/nginx/html; \\
        index index.html index.htm; \\
        try_files $uri $uri/ /index.html; \\
    } \\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`;

  const dockerfileBackendProduction = `FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Caso utilize o Prisma, gera o client do Prisma no build
RUN npx prisma generate

# Executa o build da aplicação NestJS
RUN npm run build

EXPOSE 3000

# Executa migrações do SQLite e inicia o servidor NestJS em modo de produção
CMD npx prisma db push && npm run start:prod`;

  const dockerComposeProduction = `version: '3.8'

services:
  # Se você quiser o SQLite, pode remover o serviço do MySQL clássico para economizar RAM no Easypanel
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - database_sqlite:/usr/src/app/prisma
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=file:./dev.db
      - JWT_SECRET=sua_chave_secreta_super_forte_aqui # Adicione isso para validação do token!

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:80"
    environment:
      # MUITO IMPORTANTE: Substitua pela URL gerada para o seu backend no Easypanel!
      - VITE_API_URL=https://automacao-gestao-faltas-backend.omkluj.easypanel.host
    depends_on:
      - backend

volumes:
  database_sqlite:`;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Dynamic BG Aura decoration (No Margin Clutter, clean interior glow) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20">
              <Layers className="h-6 w-6 text-slate-950 animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Gestão de Faltas
                <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  ASSISTENTE DE DEPLOY & CORREÇÃO
                </span>
              </h1>
              <p className="text-xs text-slate-400">Guia operacional interativo para hospedagem e solução no Easypanel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-400 block font-mono">USUÁRIO GITHUB CONECTADO</span>
              <span className="text-sm font-medium text-slate-200">mvassuncao1</span>
            </div>
            <a 
              href="https://github.com/mvassuncao1/gestao-faltas" 
              target="_blank" 
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 transition rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 text-slate-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver Repositório
            </a>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner de Progresso Geral */}
        <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-emerald-400 font-mono text-xs font-semibold tracking-wider uppercase block">PRODUÇÃO PRONTA</span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Status Geral do Projeto: {!progressPercent ? 'Iniciado' : progressPercent === 100 ? '100% Pronto!' : 'Em Resolução'}</h2>
              <p className="text-sm text-slate-400 max-w-xl">
                O analisador concluiu as causas raízes dos erros no Easypanel (Erros de compilador TypeScript no Pinia + Falhas de requisições de API). Siga o roteiro operacional abaixo para colocar tudo online de forma segura e com persistência de dados.
              </p>
            </div>
            
            {/* Medidor de progresso circular simulado */}
            <div className="flex items-center gap-4 min-w-[200px] bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 w-full md:w-auto">
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Progresso</span>
                  <span className="text-emerald-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">{completedSteps} de {totalSteps} etapas salvas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector & Workspace Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar Drawer */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-3 border border-slate-850 space-y-1">
              <span className="text-[9px] font-mono text-slate-500 tracking-wider block px-3 py-1 uppercase">MENU DE TRABALHO</span>
              
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition ${activeTab === 'overview' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <BookOpen className="h-4 w-4" />
                Diagnóstico & Guias
              </button>

              <button 
                onClick={() => setActiveTab('bugs')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition ${activeTab === 'bugs' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <AlertTriangle className="h-4 w-4" />
                Resolução de Bugs
              </button>

              <button 
                onClick={() => setActiveTab('dockerfiles')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition ${activeTab === 'dockerfiles' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <Terminal className="h-4 w-4" />
                Configurar Dockerfiles
              </button>

              <button 
                onClick={() => setActiveTab('database')}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition ${activeTab === 'database' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
              >
                <Database className="h-4 w-4" />
                Banco & Persistência
              </button>
            </div>

            {/* Checklist Lateral Rápido */}
            <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-850 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 tracking-wider block uppercase">Etapas Operacionais</span>
                <span className="text-xs text-slate-400 font-mono">Interativo</span>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={checklist.piniaAuthBug}
                    onChange={() => toggleCheck('piniaAuthBug')}
                    className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-800"
                  />
                  <span className={`${checklist.piniaAuthBug ? 'line-through text-slate-500' : 'group-hover:text-white transition'}`}>
                    Corrigir export no Pinia (authStore)
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={checklist.apiEnvVarUrl}
                    onChange={() => toggleCheck('apiEnvVarUrl')}
                    className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-800"
                  />
                  <span className={`${checklist.apiEnvVarUrl ? 'line-through text-slate-500' : 'group-hover:text-white transition'}`}>
                    Alimentar VITE_API_URL no Docker
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={checklist.dockerfileFrontend}
                    onChange={() => toggleCheck('dockerfileFrontend')}
                    className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-800"
                  />
                  <span className={`${checklist.dockerfileFrontend ? 'line-through text-slate-500' : 'group-hover:text-white transition'}`}>
                    Atualizar Frontend Dockerfile (Nginx)
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={checklist.dockerfileBackend}
                    onChange={() => toggleCheck('dockerfileBackend')}
                    className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-800"
                  />
                  <span className={`${checklist.dockerfileBackend ? 'line-through text-slate-500' : 'group-hover:text-white transition'}`}>
                    Atualizar Backend Dockerfile (NestJS)
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={checklist.easypanelVolume}
                    onChange={() => toggleCheck('easypanelVolume')}
                    className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-800"
                  />
                  <span className={`${checklist.easypanelVolume ? 'line-through text-slate-500' : 'group-hover:text-white transition'}`}>
                    Criar volume SQLite no Easypanel
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={checklist.prismaMigrationSeed}
                    onChange={() => toggleCheck('prismaMigrationSeed')}
                    className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-800"
                  />
                  <span className={`${checklist.prismaMigrationSeed ? 'line-through text-slate-500' : 'group-hover:text-white transition'}`}>
                    Testar Login Admin (Seed padrão)
                  </span>
                </label>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-850 text-xs text-slate-400 space-y-2">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold uppercase text-[10px]">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                Guia Rápido Easypanel
              </span>
              <p>
                Utilize o painel do seu banco sqlite mapeando o diretório de dados em volumes permanentes para garantir persistência após reinicializações.
              </p>
            </div>
          </div>

          {/* Dynamic Tab Panes Content */}
          <div className="lg:col-span-3">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Intro Card */}
                <div className="bg-slate-900/60 border border-slate-805 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-400" />
                    Diagnóstico Operacional do Projeto
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Identificamos duas causas para o travamento de subida no Easypanel após corrigir o Dockerfile multi-estágios. O pipeline de compilação bloqueava por erro de TypeScript no arquivo <code className="text-emerald-400 px-1 py-0.5 bg-slate-950 font-mono text-xs rounded border border-slate-800">frontend/src/views/DashboardView.vue</code>, devido ao método <code className="text-emerald-400 px-1 py-0.5 bg-slate-950 font-mono text-xs rounded">logoutRemote</code> estar ausente no retorno público da store Pinia.
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Com a store Pinia devidamente corrigida no lado do frontend, o build compilará 100% com Nginx no Easypanel, resolvendo o status amarelo originado por timeouts de carregamento de tipo.
                  </p>
                </div>

                {/* Arquitetura Diagnóstico */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Bug 1 */}
                  <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 uppercase font-semibold">
                        Gargalo 1: Compilação TSC
                      </span>
                      <AlertTriangle className="h-4  w-4 text-amber-400" />
                    </div>
                    <h4 className="text-md font-semibold text-white">Assinatura no Pinia (Auth Store)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      O Vue-Router e DashboardView usam o método <code className="text-emerald-300">logoutRemote</code>, mas a declaração interna do Pinia não incluía esse método em sua chave de retorno <code className="text-emerald-300">return {}</code>. Gerando falhas de conformidade TypeScript em produção.
                    </p>
                    <button 
                      onClick={() => setActiveTab('bugs')}
                      className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1.5"
                    >
                      Ver correção de código →
                    </button>
                  </div>

                  {/* Card Bug 2 */}
                  <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20 uppercase font-semibold">
                        Gargalo 2: Rotas de Rede
                      </span>
                      <ExternalLink className="h-4 w-4 text-cyan-400" />
                    </div>
                    <h4 className="text-md font-semibold text-white">Falha no Fetch (Localhost na Nuvem)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Seu frontend na web tenta ler registros chamando <code className="text-emerald-300">localhost:3000</code>. É necessário informar ao Easypanel no arquivo docker-compose a URL pública de ingress para as requisições AJAX transitarem corretamente.
                    </p>
                    <button 
                      onClick={() => setActiveTab('bugs')}
                      className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1.5"
                    >
                      Ajustar variáveis de rede →
                    </button>
                  </div>
                </div>

                {/* Fluxo Ideal NestJS no Easypanel */}
                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-850 space-y-4">
                  <h3 className="text-sm font-semibold tracking-wider text-slate-300/80 uppercase">Fluxograma de Inicialização Recomendado</h3>
                  
                  <div className="relative pl-6 border-l-2 border-emerald-500/20 space-y-6">
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950" />
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Ajuste local e commit/push no GitHub</h4>
                      <p className="text-xs text-slate-400 mt-1">Aplique o patch no Pinia e publique na branch main</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950" />
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Build no Easypanel (Nginx + NestJS)</h4>
                      <p className="text-xs text-slate-400 mt-1">Easypanel baixa o código e gera contêineres otimizados e leves</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 bg-teal-500 rounded-full border-4 border-slate-950 animate-pulse" />
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Configuração de Persistência SQLite</h4>
                      <p className="text-xs text-slate-400 mt-1">Crie um volume no Easypanel conectando no diretório da pasta Prisma para que o banco local não apague</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. BUGS & RESOLUTIONS TAB */}
            {activeTab === 'bugs' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Bug 1 Card Panel */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bug 1: logoutRemote Signature Mismatch (Compilador)</h3>
                    </div>
                    <span className="text-xs text-amber-400 font-mono font-medium">Resolvido via Pinia</span>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      O arquivo <code className="text-emerald-400 px-1.5 py-0.5 bg-slate-950 font-mono text-xs rounded border border-slate-800">frontend/src/stores/auth.ts</code> declara e define o método <code className="text-emerald-400 font-mono">logoutRemote()</code>, porém ele não foi inserido na lista de chaves expostas no corpo de encerramento do hook do Pinia.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Antes */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block font-bold">Antes (Incorreto):</span>
                        <div className="relative bg-slate-950 rounded-lg p-3 text-xs font-mono text-rose-300 border border-rose-500/10 overflow-x-auto">
                          <pre>{frontendStoreBefore}</pre>
                        </div>
                      </div>

                      {/* Depois */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Depois (Correto!):</span>
                          <button 
                            onClick={() => handleCopy(frontendStoreAfter, 'frontendStore')}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                          >
                            {copiedText === 'frontendStore' ? <Check className="h-3 w-3 text-emerald-450" /> : <Copy className="h-3 w-3" />}
                            {copiedText === 'frontendStore' ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                        <div className="relative bg-slate-950 rounded-lg p-3 text-xs font-mono text-emerald-300 border border-emerald-500/10 overflow-x-auto">
                          <pre>{frontendStoreAfter}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bug 2 Card Panel */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 animate-ping" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Bug 2: Failed to Fetch (Erro de Origin/CORS)</h3>
                    </div>
                    <span className="text-xs text-cyan-400 font-mono font-medium">Chamadas Ajax seguras</span>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sua aplicação web faz chamadas dinâmicas REST do navegador em runtime. Quando rodado em produção, se a API_URL for <code className="text-emerald-400 px-1 py-0.5 bg-slate-950 font-mono  rounded">http://localhost:3000</code>, o navegador busca o back-end na própria máquina local de cada cliente acessando o site!
                    </p>

                    <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-1.5">
                        <Settings className="h-3.5 w-3.5 text-cyan-400" />
                        Ajuste de Variável de Ambiente no Easypanel
                      </h4>
                      <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
                        <li>Vá no seu Easypanel, procure pelas configurações do contêiner <strong>Frontend</strong>.</li>
                        <li>Na aba <strong>Environment Variables</strong> (Variáveis de Ambiente), configure o campo:
                          <div className="my-2 bg-slate-900 p-2 rounded border border-slate-800 font-mono text-emerald-400 flex items-center justify-between text-xs">
                            <span>VITE_API_URL = sua_url_publica_do_backend</span>
                            <button 
                              onClick={() => handleCopy('VITE_API_URL', 'varmem')}
                              className="text-slate-400 hover:text-white"
                            >
                              {copiedText === 'varmem' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          *(Exemplo: <code className="text-cyan-300 font-mono text-[11px]">https://automacao-gestao-faltas-backend.omkluj.easypanel.host</code>)*
                        </li>
                        <li>Certifique-se de não deixar barras inclinadas no final da URL no arquivo global da API do frontend.</li>
                      </ol>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 3. DOCKER/DOCKERFILES GENERATOR */}
            {activeTab === 'dockerfiles' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Introduction docker config */}
                <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-850 space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-emerald-400" />
                    Dockerfiles e Docker-Compose Otimizados
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Copie as configurações finais de infraestrutura preparadas para o seu projeto. Elas geram compilados leves e seguros, servidos nativamente com Nginx e com o runtime do NestJS totalmente configurado.
                  </p>
                </div>

                {/* Dockerfile Frontend */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      frontend/Dockerfile (Produção SPA)
                    </span>
                    <button 
                      onClick={() => handleCopy(dockerfileFrontendProduction, 'dockerFront')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiedText === 'dockerFront' ? <Check className="h-3 w-3 text-emerald-450" /> : <Copy className="h-3 w-3" />}
                      {copiedText === 'dockerFront' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 overflow-x-auto text-xs font-mono text-emerald-300">
                    <pre>{dockerfileFrontendProduction}</pre>
                  </div>
                </div>

                {/* Dockerfile Backend */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      backend/Dockerfile (NestJS + Prisma Run)
                    </span>
                    <button 
                      onClick={() => handleCopy(dockerfileBackendProduction, 'dockerBack')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiedText === 'dockerBack' ? <Check className="h-3 w-3 text-emerald-450" /> : <Copy className="h-3 w-3" />}
                      {copiedText === 'dockerBack' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 overflow-x-auto text-xs font-mono text-emerald-300">
                    <pre>{dockerfileBackendProduction}</pre>
                  </div>
                </div>

                {/* Docker Compose */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden shadow-lg">
                  <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                      <Layers className="h-4 w-4 text-teal-400" />
                      docker-compose.yml (Completo)
                    </span>
                    <button 
                      onClick={() => handleCopy(dockerComposeProduction, 'dockerCompose')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiedText === 'dockerCompose' ? <Check className="h-3 w-3 text-emerald-450" /> : <Copy className="h-3 w-3" />}
                      {copiedText === 'dockerCompose' ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-4 overflow-x-auto text-xs font-mono text-emerald-300">
                    <pre>{dockerComposeProduction}</pre>
                  </div>
                </div>

              </div>
            )}

            {/* 4. DATABASE & PERSISTENCE TAB */}
            {activeTab === 'database' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Intro sqlite panel */}
                <div className="bg-slate-900/60 border border-slate-855 rounded-xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-400" />
                    Persistência de Dados do SQLite no Easypanel
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sua aplicação utiliza o <strong>Prisma ORM com o banco SQLite</strong> (<code className="text-teal-450 font-mono">dev.db</code>). Por padrão no Docker, qualquer arquivo local é apagado quando o contêiner reinicia ou é atualizado por um novo deploy. Para manter seus usuários cadastrados e registros de presenças salvos, é <strong>crucial mapear um volume permanente</strong>.
                  </p>
                </div>

                {/* How to setup in easypanel */}
                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-850 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest">Passo a Passo de Persistência</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
                    <div className="p-4 bg-slate-950 rounded-lg space-y-2 border border-slate-800">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">1</span>
                      <h5 className="font-bold text-white">Criar o Volume</h5>
                      <p className="text-slate-405 leading-relaxed">
                        No menu de serviços do Easypanel do seu <strong>Backend</strong>, navegue até a aba <strong>Volumes</strong>.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-lg space-y-2 border border-slate-800">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">2</span>
                      <h5 className="font-bold text-white">Configurar Path</h5>
                      <p className="text-slate-405 leading-relaxed">
                        Crie um novo volume com as seguintes configurações:
                        <br />• <strong>App Path:</strong> <code className="text-emerald-300">/usr/src/app/prisma</code>
                        <br />• <strong>Name:</strong> <code className="text-emerald-300">database_sqlite</code>
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-lg space-y-2 border border-slate-800">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono">3</span>
                      <h5 className="font-bold text-white">Salvar & Deploy</h5>
                      <p className="text-slate-405 leading-relaxed">
                        Dispare o deploy do contêiner backend. Agora seu banco SQLite ficará salvo na partição raiz persistente do servidor de forma segura.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seed Login details */}
                <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-850 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <UserCheck className="h-4  w-4 text-emerald-400" />
                    Acesso Administrador Seeding
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Durante a primeira migração do banco SQLite na inicialização do servidor, seu back-end NestJS executa um fluxo de <strong>Seeding Automático</strong> (conforme configurado em <code className="text-teal-400">backend/src/main.ts</code>). Você pode utilizar as chaves abaixo para o primeiro login de teste:
                  </p>
                  
                  <div className="relative bg-slate-950 rounded-lg p-4 font-mono text-xs border border-slate-800 flex justify-between items-center text-slate-300">
                    <div className="space-y-1">
                      <span className="block"><strong className="text-white">Email:</strong> admin@loja.com</span>
                      <span className="block"><strong className="text-white">Senha:</strong> Admin123</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-2.5 py-1 rounded font-bold">
                      PERFIL DE ADMIN
                    </span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer info (No Margin Clutter, clean metadata presentation) */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500 space-y-2">
        <p className="max-w-md mx-auto">
          Assistente de deploy para automação de gerenciamento de frequência escolar / corporativa de faltas.
        </p>
        <p className="font-mono text-[10px]">
          Google AI Studio Build &bull; v2026.05
        </p>
      </footer>
    </div>
  );
}
