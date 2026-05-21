import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldAlert, ShieldCheck, MessageSquare, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import ConfidenceGauge from '../components/inspector/ConfidenceGauge';

export default function Inspector() {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAnalyze = async (textToAnalyze = prompt) => {
    if (!textToAnalyze.trim()) return;
    
    setIsAnalyzing(true);
    setPrompt(textToAnalyze);
    setResult(null);

    // Call the API (fallback to mock if backend is down)
    const data = await api.classify(textToAnalyze);
    
    let analysisResult = data;
    if (!analysisResult) {
      // Mock result if backend is missing
      const isAttack = textToAnalyze.toLowerCase().includes('ignore') || textToAnalyze.toLowerCase().includes('system') || textToAnalyze.toLowerCase().includes('dan');
      analysisResult = {
        verdict: isAttack ? 'blocked' : 'allowed',
        attackType: isAttack ? 'Prompt Injection' : 'None',
        confidence: isAttack ? 0.98 : 0.05,
        rules: isAttack ? [{ name: 'SYS_PROMPT_LEAK', desc: 'Attempted to extract or override system instructions', matchedText: isAttack ? textToAnalyze.split(' ')[0] : '' }] : [],
        explanation: isAttack 
          ? 'This prompt attempted to bypass system instructions by using common injection keywords.' 
          : 'This prompt appears to be a standard benign query and does not match any known attack signatures.',
        recommendation: isAttack ? 'BLOCK' : 'PASS'
      };
    }

    setResult(analysisResult);
    setHistory(prev => [{ prompt: textToAnalyze, result: analysisResult }, ...prev].slice(0, 5));
    setIsAnalyzing(false);
  };

  // Helper to render the prompt with red highlights on the triggered matchedText
  const renderHighlightedText = () => {
    if (!result || !result.rules || result.rules.length === 0 || !result.rules[0].matchedText) {
      return <div className="font-mono text-sm whitespace-pre-wrap text-text leading-relaxed p-4 bg-[#111118] border border-border rounded-xl h-full shadow-inner overflow-auto">{prompt}</div>;
    }
    
    const rule = result.rules[0];
    // Case insensitive split
    const regex = new RegExp(`(${rule.matchedText})`, 'gi');
    const parts = prompt.split(regex);
    
    return (
      <div className="font-mono text-sm whitespace-pre-wrap text-text leading-relaxed p-4 bg-[#111118] border border-border rounded-xl h-full shadow-inner overflow-auto relative">
        {parts.map((part, i) => {
          if (part.toLowerCase() === rule.matchedText.toLowerCase()) {
            return (
              <span key={i} className="bg-danger/20 text-danger px-1 rounded relative group cursor-help font-bold border border-danger/30">
                {part}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] whitespace-normal bg-cards border border-border p-2 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-white shadow-lg text-center">
                  Triggered: {rule.name}
                </span>
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="p-8 max-w-[1600px] mx-auto h-full flex flex-col gap-8"
    >
      <div className="shrink-0">
        <h1 className="text-3xl font-bold mb-2">Prompt Inspector</h1>
        <p className="text-gray-400">Deep analysis of any prompt to detect jailbreaks and injections.</p>
      </div>

      {/* Split Layout */}
      <div className="flex gap-8 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Input & History */}
        <div className="w-1/2 flex flex-col gap-6">
          <div className="flex-1 flex flex-col gap-4 bg-cards border border-border rounded-xl p-6 shadow-lg">
            
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Prompt Input</h2>
              <span className="text-xs text-gray-500 font-mono">{prompt.length} / 10,000</span>
            </div>

            {/* If analyzed, show the highlighted result. Otherwise, show the textarea */}
            <div className="flex-1 relative min-h-[300px]">
              {result ? (
                <div className="absolute inset-0">
                  {renderHighlightedText()}
                </div>
              ) : (
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Paste a prompt here to analyze it for security threats..."
                  className="absolute inset-0 w-full h-full bg-[#111118] border border-border rounded-xl p-4 text-sm text-text font-mono placeholder-gray-600 resize-none focus:outline-none focus:border-accent shadow-inner"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 shrink-0">
              {result && (
                <button 
                  onClick={() => { setPrompt(''); setResult(null); }}
                  className="px-6 py-3 bg-[#2A2A3A] hover:bg-[#3A3A4A] text-white rounded-xl font-bold transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => handleAnalyze(prompt)}
                disabled={!prompt.trim() || isAnalyzing}
                className="flex-1 bg-accent hover:bg-[#6A5BE2] text-white rounded-xl font-bold flex items-center justify-center gap-2 py-3 transition-colors disabled:opacity-50 shadow-lg"
              >
                {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : "Analyze Prompt"}
              </button>
            </div>
          </div>

          {/* HISTORY SECTION */}
          {history.length > 0 && (
            <div className="shrink-0">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Recent Analysis</h3>
              <div className="flex flex-col gap-2">
                {history.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleAnalyze(item.prompt)}
                    className="bg-cards border border-border rounded-lg p-3 text-sm text-gray-300 truncate cursor-pointer hover:border-accent/50 transition-colors flex items-center gap-3"
                  >
                    {item.result.verdict === 'blocked' 
                      ? <ShieldAlert size={16} className="text-danger shrink-0" /> 
                      : <ShieldCheck size={16} className="text-success shrink-0" />
                    }
                    <span className="truncate">{item.prompt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
          {!result && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-border rounded-xl p-12 text-center">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Enter a prompt on the left and click Analyze to see the deep security breakdown here.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-accent">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-medium animate-pulse">Running Deep Analysis...</p>
            </div>
          )}

          {result && !isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex flex-col gap-6"
            >
              {/* CARD 1: Verdict & Gauge */}
              <div className="bg-cards border border-border rounded-xl p-6 shadow-lg flex flex-col items-center text-center">
                {result.verdict === 'blocked' ? (
                  <h2 className="text-2xl font-bold text-danger flex items-center gap-2 mb-2">
                    <ShieldAlert size={28} />
                    ⊘ INJECTION DETECTED
                  </h2>
                ) : (
                  <h2 className="text-2xl font-bold text-success flex items-center gap-2 mb-2">
                    <ShieldCheck size={28} />
                    ✓ BENIGN PROMPT
                  </h2>
                )}
                
                <p className="text-gray-400 mb-8">
                  {result.verdict === 'blocked' ? `Attack Type: ${result.attackType}` : 'No threats detected in this prompt.'}
                </p>

                <ConfidenceGauge 
                  value={result.confidence} 
                  color={result.verdict === 'blocked' ? '#FF4D6A' : '#34D399'} 
                />
                <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest font-bold">Confidence Score</p>
              </div>

              {/* CARD 2: Rules Triggered (Only if blocked) */}
              {result.verdict === 'blocked' && result.rules && result.rules.length > 0 && (
                <div className="bg-cards border border-danger/30 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-warning" />
                    Rules Triggered
                  </h3>
                  <div className="space-y-4">
                    {result.rules.map((rule, idx) => (
                      <div key={idx} className="bg-[#111118] border border-border rounded-lg p-4">
                        <div className="font-bold text-text mb-1">{rule.name}</div>
                        <div className="text-sm text-gray-400 mb-3">{rule.desc}</div>
                        <div className="bg-[#FF4D6A]/10 border border-danger/20 text-danger font-mono text-xs p-2 rounded">
                          "{rule.matchedText}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CARD 3: Explanation */}
              <div className="bg-cards border border-border rounded-xl p-6 shadow-lg relative mt-4">
                {/* Speech bubble tail */}
                <div className="absolute -top-3 left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-cards z-10" />
                <div className="absolute -top-[13px] left-[23px] w-0 h-0 border-l-[9px] border-r-[9px] border-b-[9px] border-transparent border-b-border" />
                
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">AI Explanation</h3>
                <p className="text-text leading-relaxed">{result.explanation}</p>
              </div>

              {/* CARD 4: Recommendation */}
              <div className={`border rounded-xl p-6 shadow-lg flex justify-between items-center ${result.recommendation === 'BLOCK' ? 'bg-danger/10 border-danger/50' : 'bg-success/10 border-success/50'}`}>
                <div>
                  <h3 className="font-bold text-lg mb-1">Recommendation</h3>
                  <p className="text-sm opacity-80">{result.recommendation === 'BLOCK' ? 'Do not process this prompt.' : 'Safe to send to the LLM.'}</p>
                </div>
                <div className={`text-3xl font-black tracking-widest ${result.recommendation === 'BLOCK' ? 'text-danger' : 'text-success'}`}>
                  {result.recommendation}
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
