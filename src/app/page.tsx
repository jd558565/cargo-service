import WeighingDisplay from '@/components/WeighingDisplay';
import MockController from '@/components/MockController';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-black tracking-tighter mb-2">
          CARGO<span className="text-primary" style={{ color: 'var(--primary)' }}>WEIGHT</span>
        </h1>
        <p className="text-dim text-sm tracking-widest uppercase opacity-70" style={{ color: 'var(--text-dim)' }}>
          Precision Integrated Weighing System
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 items-start">
        {/* Real-time Indicator */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-dim px-2">Live Indicator</h3>
          <WeighingDisplay />
        </section>

        {/* Development Tools */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-dim px-2">Hardware Emulator</h3>
          <MockController />
        </section>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-primary opacity-10 blur-[120px] pointer-events-none" />
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-purple-600 opacity-10 blur-[120px] pointer-events-none" />
    </main>
  );
}
