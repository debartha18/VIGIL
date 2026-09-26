import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import { Candidate } from '../types/kshitij';

interface ReportExportViewProps {
  candidates: Candidate[];
}

export const ReportExportView: React.FC<ReportExportViewProps> = ({ candidates }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportGeoJSON = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: candidates.map((c) => ({
        type: 'Feature',
        geometry: c.geometry,
        properties: {
          id: c.id,
          changeType: c.changeType,
          confidence: c.confidence.overall,
          areaM2: c.areaM2,
          firstEvidenceAt: c.firstEvidenceAt,
          firstEvidenceSceneId: c.firstEvidenceSceneId,
          verdict: c.verdict,
          provenance: c.processingLog,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kshitij_intelligence_report_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D16] p-4 lg:p-6 pb-28 font-sans text-white overflow-y-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#182A40] pb-4">
        <div>
          <h2 className="text-[26px] font-semibold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-[#00E5FF]" />
            <span>Report & evidence export</span>
          </h2>
          <p className="text-sm font-normal text-[#94A3B8] mt-1">
            Generate formal intelligence dossiers with full chain of custody, before/after evidence, and provenance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportGeoJSON}
            className="px-3.5 py-1.5 bg-[#0E1A2B] hover:bg-[#15273F] text-white border border-[#182A40] rounded-lg text-xs font-medium flex items-center space-x-2 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Export GeoJSON (Provenance)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 rounded-lg text-xs font-medium flex items-center space-x-2 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print dossier (PDF)</span>
          </button>
        </div>
      </div>

      <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-6 max-w-4xl mx-auto space-y-4 text-xs">
        <div className="border-b border-[#182A40] pb-4 flex justify-between items-start">
          <div>
            <div className="text-sm font-semibold text-[#00E5FF]">
              Kshitij // Formal satellite intelligence dossier
            </div>
            <div className="text-[#94A3B8] text-[11px] mt-0.5">
              Classification: Official-use only // Air-gapped evaluation protocol
            </div>
          </div>
          <div className="text-right text-[#94A3B8] text-[11px] space-y-0.5">
            <div>Date: <span className="font-mono text-white">{new Date().toISOString().split('T')[0]}</span></div>
            <div>Station: Local workstation</div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="text-white font-semibold text-xs">Executive summary:</div>
          <p className="text-[#94A3B8] leading-relaxed text-xs">
            Multi-temporal change analysis across the designated 50×50 km AOI identified <span className="font-mono text-white">{candidates.length}</span> candidate changes. High-confidence detections include land clearance near primary river corridors and new infrastructure development. False alarms (cloud shadow, seasonal vegetation change) were suppressed via SCL quality masking and multi-temporal persistence validation.
          </p>
        </div>
      </div>
    </div>
  );
};
