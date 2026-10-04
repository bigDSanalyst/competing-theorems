/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TheoremCard } from './components/TheoremCard';
import { ComparisonChart } from './components/ComparisonChart';
import { SimulationParams, calculateBounds, SimulationResult } from './types';
import { cn } from './lib/utils';
import { 
  Settings, 
  Binary, 
  Cpu, 
  Layers, 
  Activity, 
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Download,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [params, setParams] = useState<SimulationParams>({
    m: 100,
    epsilon: 0.15,
    delta: 0.05,
    lipschitz: 1.2
  });

  const [activeTheorem, setActiveTheorem] = useState<number>(0);
  const [showToast, setShowToast] = useState(false);
  const [focusedParam, setFocusedParam] = useState<string | null>(null);

  const results = useMemo(() => calculateBounds(params), [params]);

  const handleParamChange = (key: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metadata: {
        appName: "DGR Duel Explorer",
        version: "1.2.0-Alpha"
      },
      parameters: params,
      results: {
        convergenceSteps: Math.round(results.steps),
        proofComplexity: Math.round(results.proofSize),
        dagDepth: Number(results.depth.toFixed(4))
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dgr-metrics-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const SidebarParam = ({ 
    id, 
    label, 
    value, 
    min, 
    max, 
    step, 
    keyName, 
    description 
  }: { 
    id: string;
    label: string; 
    value: number; 
    min: number; 
    max: number; 
    step: number; 
    keyName: keyof SimulationParams; 
    description: string;
  }) => {
    const isFocused = focusedParam === keyName;
    
    return (
      <div className={cn(
        "space-y-3 p-3 -mx-3 transition-all duration-500 rounded-lg border",
        isFocused 
          ? "bg-white border-black shadow-[0_4px_20px_rgba(0,0,0,0.05)] scale-[1.02]" 
          : "border-transparent"
      )}>
        <label className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-gray-500">
          <span className={cn(isFocused && "text-black font-bold uppercase")}>{label}</span>
          <span className={cn("font-bold transition-colors", isFocused ? "text-blue-600" : "text-black")}>
            {value}
          </span>
        </label>
        <input 
          type="range" min={min} max={max} step={step}
          value={value}
          onChange={(e) => handleParamChange(keyName, e.target.value)}
          className="w-full accent-black cursor-pointer"
        />
        <p className="text-[10px] leading-relaxed text-gray-500 italic">
          {description}
        </p>
        {isFocused && (
          <motion.div 
            layoutId="focus-indicator"
            className="flex items-center gap-1.5 text-[8px] font-mono uppercase bg-blue-50 text-blue-700 px-2 py-0.5 mt-1 animate-pulse"
          >
            <Activity className="w-2 h-2" />
            <span>Active Variable</span>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-black selection:text-white">
      {/* Top Header Rail */}
      <header className="border-b border-black flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Binary className="w-6 h-6" />
          <h1 className="font-serif italic text-2xl tracking-tight">DGR Explorer</h1>
          <span className="font-mono text-[10px] bg-black text-white px-2 py-0.5 ml-2 uppercase">v1.2.0-Alpha</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest overflow-hidden h-6">
          <div className="flex items-center gap-2 opacity-60">
            <Cpu className="w-3 h-3" />
            <span>M- Bandit Optimization</span>
          </div>
          <div className="w-px h-full bg-gray-300" />
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Active Instance: SAT-04-A</span>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-65px)]">
        
        {/* Parameters Sidebar */}
        <aside className="lg:col-span-3 border-r border-black bg-[#EAE8E4] p-8">
          <div className="flex items-center gap-2 mb-8 group">
            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            <h2 className="font-serif italic text-xl">Simulation Control</h2>
          </div>

          <div className="space-y-6">
            <SidebarParam 
              id="m-param"
              label="Clause Count (m)"
              value={params.m}
              min={10} max={1000} step={10}
              keyName="m"
              description="Total number of CNF clauses in the resolution DAG."
            />
            <SidebarParam 
              id="epsilon-param"
              label="Distraction Tolerance (ε)"
              value={params.epsilon}
              min={0.01} max={0.5} step={0.01}
              keyName="epsilon"
              description="Tolerance constant for noisy resolution steps. Low ε requires more steps."
            />
            <SidebarParam 
              id="delta-param"
              label="Error Bound (δ)"
              value={params.delta}
              min={0.001} max={0.2} step={0.001}
              keyName="delta"
              description={`Probability of convergence failure. Confidence level: ${(100 - params.delta * 100).toFixed(1)}%.`}
            />
            <SidebarParam 
              id="lipschitz-param"
              label="Lipschitz Constant (L)"
              value={params.lipschitz}
              min={0.1} max={5} step={0.1}
              keyName="lipschitz"
              description="Scaling factor for distraction function smoothness."
            />
          </div>

          <div className="mt-12 p-4 border border-blue-200 bg-blue-50/50">
             <div className="flex gap-2 text-blue-800 mb-2">
               <Info className="w-4 h-4 flex-shrink-0" />
               <span className="font-mono text-[10px] uppercase font-bold">Optimization Hint</span>
             </div>
             <p className="text-xs leading-relaxed text-blue-900/80">
               {params.m > 500 
                ? "Th. 2 steps grow linearly with (m), but Th. 3 space stays under O(m log m). Recommended: Prioritize Space." 
                : "Small instance detected. Runtime bounds (Th. 2) are highly predictable. Prioritize Convergence."}
             </p>
          </div>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-9 p-8 space-y-12 overflow-y-auto">
          
          {/* Dashboard Summary Rail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <div className="border border-black bg-white p-4">
               <span className="block font-mono text-[10px] text-gray-500 uppercase mb-1">Convergence Steps</span>
               <span className="text-3xl font-serif italic">{Math.round(results.steps).toLocaleString()}</span>
               <div className="mt-2 text-xs font-mono text-gray-400">Total Iterations</div>
            </div>
            <div className="border border-black bg-white p-4">
               <span className="block font-mono text-[10px] text-gray-500 uppercase mb-1">Proof Complexity</span>
               <span className="text-3xl font-serif italic">{Math.round(results.proofSize).toLocaleString()}</span>
               <div className="mt-2 text-xs font-mono text-gray-400">Resolution Units</div>
            </div>
            <div className="border border-black bg-white p-4">
               <span className="block font-mono text-[10px] text-gray-500 uppercase mb-1">DAG Depth</span>
               <span className="text-3xl font-serif italic">{results.depth.toFixed(2)}</span>
               <div className="mt-2 text-xs font-mono text-gray-400">Path Length (log)</div>
            </div>
          </div>

          {/* Theorem Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif italic text-2xl">Mathematical Foundations</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTheorem(0)}
                  className={cn(
                    "font-mono text-[10px] uppercase px-3 py-1 border transition-colors",
                    activeTheorem === 0 ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:border-black"
                  )}
                >
                  View Both
                </button>
                <button 
                  onClick={() => setActiveTheorem(2)}
                  className={cn(
                    "font-mono text-[10px] uppercase px-3 py-1 border transition-colors",
                    activeTheorem === 2 ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:border-black"
                  )}
                >
                  Theorem 2
                </button>
                <button 
                   onClick={() => setActiveTheorem(3)}
                   className={cn(
                    "font-mono text-[10px] uppercase px-3 py-1 border transition-colors",
                    activeTheorem === 3 ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:border-black"
                  )}
                >
                   Theorem 3
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(activeTheorem === 0 || activeTheorem === 2) && (
                <TheoremCard 
                  id={2}
                  title="Convergence of Distraction-Guided Resolution"
                  focus="Runtime"
                  expression="O((m / ε²) log(1/δ))"
                  summary="Guarantees algorithmic convergence in uncertain or distracted resolution environments. It establishes a probabilistic upper bound on the number of steps required to reach a result."
                  proofBasis={["Multi-armed Bandit Theory (UCB)", "Hoeffding's Inequality", "Concentration Bounds"]}
                  isActive={activeTheorem === 2}
                />
              )}
              {(activeTheorem === 0 || activeTheorem === 3) && (
                <TheoremCard 
                  id={3}
                  title="Proof Size Bound for Distraction-Guided Resolution"
                  focus="Space"
                  expression="O(m log m)"
                  summary="Bounds the physical size of generated proof trees under Lipschitz continuity. Focuses on space efficiency, ensuring proof objects remain manageable as clause count increases."
                  proofBasis={["Grothendieck's Inequality", "Spectral Graph Theory", "Lipschitz-Continuous Functions"]}
                  isActive={activeTheorem === 3}
                />
              )}
            </div>
          </div>

          {/* Behavioral Analysis */}
          <div className="space-y-4">
             <div className="flex items-center gap-4">
               <div className="h-px flex-grow bg-black/10" />
               <span className="font-serif italic text-lg opacity-60">Comparative Visualization</span>
               <div className="h-px flex-grow bg-black/10" />
             </div>
             
             <ComparisonChart 
               params={params} 
               varyingParam="m" 
               title="Scalability vs Instance Size" 
               onMouseEnter={setFocusedParam}
               onMouseLeave={() => setFocusedParam(null)}
             />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ComparisonChart 
                  params={params} 
                  varyingParam="epsilon" 
                  title="Noise Sensitivity Analysis" 
                  onMouseEnter={setFocusedParam}
                  onMouseLeave={() => setFocusedParam(null)}
                />
                <div className="border border-black bg-white p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                    <ShieldAlert className="w-6 h-6" />
                    <h4 className="font-serif italic text-xl">Decision Synthesis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-6">
                    Theorem 2 and Theorem 3 provide a dual-guarantee framework. When applying DGR to a problem instance, evaluate your constraints:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-mono text-xs flex-shrink-0">A</div>
                      <p className="text-xs">
                        <strong className="block mb-1">Runtime Critical</strong>
                        If hardware resources are limited but memory is abundant, use Theorem 2 bounds to calibrate distraction tolerance (ε).
                      </p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-mono text-xs flex-shrink-0">B</div>
                      <p className="text-xs">
                        <strong className="block mb-1">Space Critical</strong>
                        If generating proofs for storage or transmission, Theorem 3 implies that Lipschitz-governed distractions keep the resolution tree logarithmic in growth relative to (m).
                      </p>
                    </li>
                  </ul>
                  <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-gray-400">Spectral Analysis: Online</span>
                    <button 
                      onClick={handleExport}
                      className="flex items-center gap-2 text-xs font-bold hover:gap-3 transition-all cursor-pointer group"
                    >
                      Export Proof Metrics 
                      <Download className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" /> 
                      <ArrowRight className="w-3 h-3 opacity-50" />
                    </button>
                  </div>
                </div>
             </div>
          </div>

          <footer className="pt-12 pb-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">
            <div>&copy; 2026 DGR Theoretical Research Institute</div>
            <div className="flex gap-8">
               <a href="#" className="hover:text-black">Documentation</a>
               <a href="#" className="hover:text-black">Algorithm Repo</a>
               <a href="#" className="hover:text-black">Privacy Protocol</a>
            </div>
          </footer>

        </section>
      </main>

      {/* Export Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-black text-white p-1 shadow-2xl border border-white/20 flex items-center md:min-w-[320px]">
              <div className="bg-green-500 p-4 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-black" />
              </div>
              <div className="px-6 py-2 flex-grow">
                <div className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">System Notification</div>
                <div className="font-serif italic text-lg leading-tight">Export Success</div>
                <div className="font-mono text-[9px] opacity-60">JSON dataset generated successfully</div>
              </div>
              <button 
                onClick={() => setShowToast(false)}
                className="p-4 hover:bg-white/10 transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

