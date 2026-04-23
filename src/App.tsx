import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Medicines from './pages/Medicines';
import AddOrder from './pages/AddOrder';
import DailyEntry from './pages/DailyEntry';
import Reports from './pages/Reports';
import AllOrders from './pages/AllOrders';
import DoctorDetails from './pages/DoctorDetails';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import type { Page, NavParams } from './lib/types';
import { AlertCircle, ExternalLink, Settings } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [pageParams, setPageParams] = useState<NavParams>({});

  useEffect(() => {
    console.log('App: Initializing Supabase Auth...');
    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      console.log('App: Session loaded', s ? 'Yes' : 'No', error || '');
      setSession(s);
      setAuthLoading(false);
    }).catch(err => {
      console.error('App: getSession error', err);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      console.log('App: Auth state change', _event, s ? 'Yes' : 'No');
      setSession(s);
    });

    return () => subscription.unsubscribe();
  }, []);

  function navigate(page: Page, params: NavParams = {}) {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setCurrentPage('dashboard');
    setPageParams({});
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 p-10 text-center border border-slate-100 animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-8 shadow-inner">
            <Settings size={40} className="animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Setup Required</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Please configure your <span className="text-blue-600 font-bold">Supabase credentials</span> in the <code className="bg-slate-100 px-2 py-1 rounded text-rose-600 text-xs">.env</code> file to start using Meditrack MR.
          </p>
          
          <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Variables:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <code className="text-xs font-bold text-slate-700">VITE_SUPABASE_URL</code>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <code className="text-xs font-bold text-slate-700">VITE_SUPABASE_ANON_KEY</code>
              </div>
            </div>
          </div>

          <a 
            href="https://supabase.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          
          <p className="text-[10px] text-slate-400 font-bold mt-8 uppercase tracking-widest">
            Restart dev server after updating .env
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={() => {}} />;
  }

  const displayName = (session.user.user_metadata?.display_name as string) ?? session.user.email ?? 'User';
  const userId = session.user.id;

  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} userId={userId} />;
      case 'doctors':
        return <Doctors onNavigate={navigate} userId={userId} />;
      case 'medicines':
        return <Medicines userId={userId} />;
      case 'add-order':
        return <AddOrder onNavigate={navigate} prefillDoctorId={pageParams.doctorId} userId={userId} />;
      case 'all-orders':
        return <AllOrders onNavigate={navigate} userId={userId} />;
      case 'daily-entry':
        return <DailyEntry onNavigate={navigate} userId={userId} />;
      case 'reports':
        return <Reports onNavigate={navigate} userId={userId} />;
      case 'doctor-details':
        return pageParams.doctorId
          ? <DoctorDetails doctorId={pageParams.doctorId} onNavigate={navigate} userId={userId} />
          : <Doctors onNavigate={navigate} userId={userId} />;
      default:
        return <Dashboard onNavigate={navigate} userId={userId} />;
    }
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={page => navigate(page)}
      displayName={displayName}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}
