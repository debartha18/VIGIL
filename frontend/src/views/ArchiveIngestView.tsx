import React from 'react';
import { Archive, UploadCloud, CheckCircle2 } from 'lucide-react';
import { Scene } from '../types/kshitij';

interface ArchiveIngestViewProps {
  scenes: Scene[];
}

export const ArchiveIngestView: React.FC<ArchiveIngestViewProps> = ({ scenes }) => {
  return (
    <div className="w-full min-h-full flex flex-col bg-[#070D16] p-4 lg:p-6 pb-28 font-sans text-white space-y-6">
      <div className="flex items-center justify-between border-b border-[#182A40] pb-4">
        <div>
          <h2 className="text-[26px] font-semibold text-white flex items-center space-x-2">
            <Archive className="w-6 h-6 text-[#00E5FF]" />
            <span>Archive explorer & incremental ingestion</span>
          </h2>
          <p className="text-sm font-normal text-[#94A3B8] mt-1">
            Ingest new Sentinel-2 / Landsat COGs live without rebuilding the FAISS index.
          </p>
        </div>
      </div>

      {/* Ingest Dropzone */}
      <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-6">
        <div className="border-2 border-dashed border-[#182A40] hover:border-[#00E5FF]/50 rounded-lg p-8 text-center transition cursor-pointer">
          <UploadCloud className="w-8 h-8 text-[#00E5FF] mx-auto mb-2" />
          <div className="text-white text-sm font-medium">Drop COG / GeoTIFF scene here to ingest</div>
          <div className="text-[#94A3B8] text-xs mt-1">
            Automatic SCL quality masking → chip tiling → embedding → FAISS incremental indexing
          </div>
          <div className="inline-block mt-3 px-2.5 py-1 rounded bg-[#063327] text-[#10B981] border border-[#10B981]/30 text-xs font-medium">
            No vector index rebuild required
          </div>
        </div>
      </div>

      {/* Ingested Scenes Table */}
      <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#182A40] mb-3">
          <span className="text-sm font-medium text-white">Ingested archive scenes ({scenes.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#182A40] text-[11px] font-sans uppercase tracking-[0.05em] text-[#64748B]">
                <th className="py-2.5">SCENE ID</th>
                <th>SENSOR</th>
                <th>ACQUIRED AT</th>
                <th>CLOUD %</th>
                <th>RESOLUTION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182A40]/40 text-[#94A3B8]">
              {scenes.map((s) => (
                <tr key={s.id} className="hover:bg-[#0E1F33] transition">
                  <td className="py-3 font-mono font-medium text-[#00E5FF]">{s.id}</td>
                  <td className="font-mono text-white">{s.sensor}</td>
                  <td className="font-mono text-white">{s.acquiredAt}</td>
                  <td className="font-mono text-white">{s.cloudPct.toFixed(1)}%</td>
                  <td className="font-mono text-white">{s.resolutionM}m</td>
                  <td>
                    <span className="inline-flex items-center space-x-1 text-[#10B981] text-xs font-medium font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{s.processingStatus}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
