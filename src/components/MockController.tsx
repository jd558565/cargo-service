'use client';

import { useState } from 'react';

export default function MockController() {
    const [weight, setWeight] = useState(0);

    const updateWeight = async (w: number, status: string = 'UNSTABLE') => {
        setWeight(w);
        await fetch('/api/weighing/mock-control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: w, status }),
        });
    };

    return (
        <div className="glass-card flex flex-col gap-6" style={{ width: '400px' }}>
            <h3 className="text-lg font-bold gradient-text">Simulation Control</h3>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-dim uppercase">Live Weight Control: {weight}kg</label>
                <input
                    type="range"
                    min="0"
                    max="1000"
                    step="0.5"
                    value={weight}
                    onChange={(e) => updateWeight(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                    style={{ accentColor: 'var(--primary)' }}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                {[0, 150, 500, 800].map(val => (
                    <button
                        key={val}
                        onClick={() => updateWeight(val)}
                        className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-semibold"
                    >
                        Set {val}kg
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => updateWeight(weight, 'ERROR')}
                    className="flex-1 py-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold hover:bg-error/20 transition-all"
                >
                    SIMULATE ERROR
                </button>
                <button
                    onClick={() => updateWeight(weight, 'OVERLOAD')}
                    className="flex-1 py-3 rounded-xl bg-unstable/10 border border-unstable/30 text-unstable text-xs font-bold hover:bg-unstable/20 transition-all"
                >
                    OVERLOAD
                </button>
            </div>
        </div>
    );
}
