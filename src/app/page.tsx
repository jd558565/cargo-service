import WeighingDisplay from '@/components/WeighingDisplay';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-black tracking-tighter mb-2">
          <span className="text-primary" style={{ color: 'var(--primary)' }}>WEIGHT</span>ER
        </h1>
        <p className="text-dim text-sm tracking-widest uppercase opacity-70" style={{ color: 'var(--text-dim)' }}>
          산업용 정밀 통합 계량 시스템
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 items-start">
        {/* Real-time Indicator */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-dim px-2">정밀 계량 인디케이터</h3>
          <WeighingDisplay />
        </section>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed -bottom-24 -left-24 w-96 h-96 bg-primary opacity-10 blur-[120px] pointer-events-none" />
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-purple-600 opacity-10 blur-[120px] pointer-events-none" />
    </main>
  );
}
