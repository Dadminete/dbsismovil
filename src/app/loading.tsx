export default function Loading() {
  return (
    <div className="flex flex-col gap-8 pb-10 animate-pulse">
      <header className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-gold/30"></div>
        <div className="w-48 h-6 bg-white/10 rounded-md"></div>
        <div className="w-32 h-3 bg-white/5 rounded-md"></div>
      </header>

      <section className="grid grid-cols-1 gap-4">
        <div className="w-32 h-3 bg-white/5 rounded-md px-1 mt-2"></div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-[30px] flex flex-col gap-3 h-32">
            <div className="w-10 h-10 rounded-2xl bg-white/5"></div>
            <div className="w-24 h-3 bg-white/5 rounded-md mt-auto"></div>
            <div className="w-16 h-8 bg-white/10 rounded-md"></div>
          </div>
          
          <div className="glass p-5 rounded-[30px] flex flex-col gap-3 h-32">
            <div className="w-10 h-10 rounded-2xl bg-white/5"></div>
            <div className="w-24 h-3 bg-white/5 rounded-md mt-auto"></div>
            <div className="w-20 h-8 bg-white/10 rounded-md"></div>
          </div>
        </div>

        <div className="glass p-6 rounded-[35px] flex flex-col gap-4 border-l-4 border-l-gold/30 h-32">
           <div className="flex justify-between items-end">
              <div className="flex flex-col gap-2">
                 <div className="w-20 h-3 bg-white/5 rounded-md"></div>
                 <div className="w-32 h-5 bg-white/10 rounded-md"></div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                 <div className="w-16 h-3 bg-white/5 rounded-md"></div>
                 <div className="w-16 h-3 bg-white/5 rounded-md"></div>
              </div>
           </div>
           <div className="w-full h-3 bg-white/5 rounded-full mt-2"></div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center px-1">
          <div className="w-32 h-3 bg-white/5 rounded-md"></div>
        </div>
        
        <div className="glass rounded-[35px] p-2 flex flex-col divide-y divide-white/5">
           {[1, 2].map(i => (
             <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-white/10"></div>
                   <div className="flex flex-col gap-2">
                     <div className="w-24 h-4 bg-white/10 rounded-md"></div>
                     <div className="w-32 h-3 bg-white/5 rounded-md"></div>
                   </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                   <div className="w-16 h-5 bg-white/10 rounded-md"></div>
                   <div className="w-12 h-2 bg-white/5 rounded-md"></div>
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
}
