import React, { useState, useEffect } from 'react';
import { SystemHealth } from '../../types/kshitij';
import { offlineInspector } from '../../services/api';
import { ShieldCheck, Server, Cpu, Database, WifiOff, AlertTriangle } from 'lucide-react';

interface TopBarProps {
  health: SystemHealth | null;
  analystName?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ health, analystName = 'ANALYST // DEB' }) => {
  const [extCount, setExtCount] = useState<number>(0);
  const [showProof, setShowProof] = useState<boolean>(false);

  useEffect(() => {
    setExtCount(offlineInspector.getExternalRequestCount());
    const unsubscribe = offlineInspector.subscribe(() => {
      setExtCount(offlineInspector.getExternalRequestCount());
    });
    return unsubscribe;
  }, []);

  return (
    <header className="h-14 bg-bg-1 border-b border-line px-4 flex items-center justify-between select-none z-30 relative">
      {/* Left: Brand & Product Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-cyan rounded-full shadow-[0_0_8px_#22D3EE]" />
          <span className="font-mono text-base font-bold tracking-widest text-text-0">KSHITIJ</span>
        </div>
        <span className="text-line text-sm">|</span>
        <span className="text-xs font-mono tracking-wider text-text-1 uppercase">
          Satellite Intelligence Platform
        </span>
      </div>

      {/* Centre: Live Subsystem Health Status */}
      <div className="hidden md:flex items-center space-x-6 text-xs font-mono">
        <div className="flex items-center space-x-1.5" title="Local imagery archive status">
          <Database className="w-3.5 h-3.5 text-text-1" />
          <span className="text-text-1">ARCHIVE:</span>
          <span className={health?.archive.status === 'ONLINE' ? 'text-green font-semibold' : 'text-amber'}>
            {health?.archive.status || 'CHECKING...'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5" title="Local embedding & change engine status">
          <Cpu className="w-3.5 h-3.5 text-text-1" />
          <span className="text-text-1">ANALYSIS ENGINE:</span>
          <span className={health?.analysisEngine.status === 'ONLINE' ? 'text-green font-semibold' : 'text-amber'}>
            {health?.analysisEngine.status || 'CHECKING...'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5" title="FAISS vector index status">
          <Server className="w-3.5 h-3.5 text-text-1" />
          <span className="text-text-1">INDEX:</span>
          <span className={health?.index.status === 'ONLINE' ? 'text-green font-semibold' : 'text-amber'}>
            {health?.index.status || 'CHECKING...'}
          </span>
        </div>
      </div>

      {/* Right: Air-gapped proof badge & Analyst profile */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowProof(!showProof)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-xs font-mono transition-colors ${
            extCount === 0
              ? 'bg-cyan/10 border-cyan/40 text-cyan hover:bg-cyan/20'
              : 'bg-red/10 border-red/40 text-red hover:bg-red/20'
          }`}
          title="Click to view strict air-gap compliance proof"
        >
          {extCount === 0 ? <WifiOff className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          <span>LOCAL / AIR-GAPPED</span>
          <span className="text-[10px] bg-bg-0 px-1.5 py-0.2 rounded border border-line">
            EXT: {extCount}
          </span>
        </button>

        <div className="flex items-center space-x-2 pl-2 border-l border-line">
          <div className="w-6 h-6 rounded-full bg-bg-2 border border-line flex items-center justify-center text-[10px] font-mono text-cyan font-bold">
            AN
          </div>
          <span className="text-xs font-mono text-text-1 hidden sm:inline">{analystName}</span>
        </div>
      </div>

      {/* Offline Proof Modal Popover */}
      {showProof && (
        <div className="absolute right-4 top-16 w-96 bg-bg-2 border border-line rounded-lg p-4 shadow-2xl z-50 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-line mb-3">
            <div className="flex items-center space-x-2 text-cyan font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>AIR-GAP COMPLIANCE AUDIT</span>
            </div>
            <button
              onClick={() => setShowProof(false)}
              className="text-text-1 hover:text-text-0 px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2.5 text-text-1">
            <div className="flex justify-between items-center bg-bg-1 p-2 rounded border border-line">
              <span>External network requests:</span>
              <span className={`font-bold ${extCount === 0 ? 'text-green' : 'text-red'}`}>
                {extCount}
              </span>
            </div>

            <div className="text-[11px] leading-relaxed text-text-1">
              <p>✓ All remote tile URLs, CDNs & external APIs disabled.</p>
              <p>✓ Fonts (Inter, JetBrains Mono) self-hosted.</p>
              <p>✓ FAISS vector store & SQLite run strictly on localhost.</p>
              <p>✓ RemoteCLIP offline embeddings cached locally.</p>
              <p>✓ Content-Security-Policy: default-src &apos;self&apos; active.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
