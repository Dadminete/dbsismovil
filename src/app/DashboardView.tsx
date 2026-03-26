'use client';

import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { TrendingUp, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';

const LOCALE = 'es-DO';

const formatNumber = (value: number) => value.toLocaleString(LOCALE);
const formatCurrency = (value: number) => `$${formatNumber(value)}`;
const formatDate = (value: string | number | Date) => new Date(value).toLocaleDateString(LOCALE);

export default function DashboardView({ stats }: { stats: any }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); // Haptic feedback
    }
    setIsRefreshing(true);
    router.refresh(); // Tells Next.js to re-fetch Server Components
    // Simulate a minimum visual delay so the user sees the spinner
    await new Promise(res => setTimeout(res, 800));
    setIsRefreshing(false);
  };
  const income = stats.monthlyIncome || 0;
  const expenses = stats.monthlyExpenses || 0;
  const total = income + expenses;
  const incomeWidth = total > 0 ? (income / total) * 100 : 50;
  const expensesWidth = total > 0 ? (expenses / total) * 100 : 50;

  return (
    <div className="relative overflow-hidden w-full h-full pb-10" ref={scrollContainerRef}>
      {/* Pull to refresh indicator */}
      <div className="absolute top-0 left-0 w-full flex justify-center -mt-10 z-0">
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0, opacity: isRefreshing ? 1 : 0 }}
          transition={{ repeat: isRefreshing ? Infinity : 0, duration: 1, ease: "linear" }}
          className="bg-gold/20 text-gold p-2 rounded-full backdrop-blur-md"
        >
          <RefreshCw size={20} />
        </motion.div>
      </div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.2, bottom: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 80 && !isRefreshing) {
            handleRefresh();
          }
        }}
        className="flex flex-col gap-8 relative z-10 bg-[#000]"
      >
        <header className="flex flex-col items-center gap-4 pt-2">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]">
          <Image
            src="/logo.jpg"
            alt="Logo"
            fill
            priority
            sizes="96px"
            className="object-cover"
          />
        </div>
        <div className="text-center px-4">
          <h1 className="text-2xl font-black gold-text-gradient uppercase tracking-tighter">DBSISMOVIL</h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Empresa Tecnológica del Este</p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4">
        <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Resumen General</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Papelería Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-5 rounded-[30px] flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500/5 blur-xl rounded-full"></div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-tight italic">Ingreso Papelería</p>
              <h3 className="text-lg font-black">{formatCurrency(stats.papeleria.todayIncome)}</h3>
              <p className="text-[8px] text-blue-400 font-black italic mt-1 uppercase">Monto Actual: {formatCurrency(stats.papeleria.balance)}</p>
            </div>
          </motion.div>

          {/* Caja Principal Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-5 rounded-[30px] flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500/5 blur-xl rounded-full"></div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <RefreshCw size={20} />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-tight italic">Ingreso Principal</p>
              <h3 className="text-lg font-black">{formatCurrency(stats.principal.todayIncome)}</h3>
              <p className="text-[8px] text-emerald-400 font-black italic mt-1 uppercase">Monto Actual: {formatCurrency(stats.principal.balance)}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass p-5 rounded-[30px] flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gold/5 blur-xl rounded-full"></div>
            <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-tight">Clientes Activos</p>
              <h3 className="text-2xl font-black">{stats.activeClients}</h3>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-5 rounded-[30px] flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-500/5 blur-xl rounded-full"></div>
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-tight">Facturas Pendientes</p>
              <h3 className="text-2xl font-black">{formatCurrency(stats.pendingInvoices.total)}</h3>
              <p className="text-[8px] text-red-400 font-black italic mt-1">Cantidad: {stats.pendingInvoices.count}</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-[35px] flex flex-col gap-4 border-l-4 border-l-gold relative overflow-hidden"
        >
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Estado del Mes</p>
              <h3 className="text-lg font-black italic gold-text-gradient uppercase tracking-tighter">I/G del Mes En Curso</h3>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-green-400 uppercase tracking-tighter italic">Ingresos: {formatCurrency(income)}</p>
              <p className="text-[9px] font-black text-red-400 uppercase tracking-tighter italic">Gastos: {formatCurrency(expenses)}</p>
            </div>
          </div>

          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${incomeWidth}%` }}
              className="bg-gold h-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${expensesWidth}%` }}
              className="bg-red-500 h-full opacity-50"
            />
          </div>
          <div className="flex justify-between px-1">
            <span className="text-[8px] font-black text-gold/60 uppercase">Ingresos ({Math.round(incomeWidth)}%)</span>
            <span className="text-[8px] font-black text-red-400/60 uppercase">Gastos ({Math.round(expensesWidth)}%)</span>
          </div>
        </motion.div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Actividad Reciente</h2>
          <button className="text-[10px] font-black text-gold uppercase tracking-widest italic underline pr-1">Ver Todo</button>
        </div>

        <div className="glass rounded-[35px] p-2 flex flex-col divide-y divide-white/5 overflow-hidden">
          {stats.recentActivity.length === 0 ? (
            <div className="p-10 text-center opacity-30 text-[10px] font-black uppercase italic">No hay pagos recientes</div>
          ) : (
            stats.recentActivity.map((activity: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-black text-gold text-xs italic">
                    {activity.nombre[0]}
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-tight">{activity.nombre} {activity.apellidos}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase italic flex items-center gap-1">
                      <TrendingUp size={10} className="text-green-500" /> Pago confirm. • {activity.metodo_pago}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gold italic">{formatCurrency(parseFloat(activity.monto))}</p>
                  <p className="text-[8px] text-gray-600 font-bold uppercase">{formatDate(activity.created_at)}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
      </motion.div>
    </div>
  );
}
