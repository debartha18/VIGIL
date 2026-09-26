import React from 'react';
import { Sparkles, Network, Layers } from 'lucide-react';

export const DiscoverView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D16] p-4 lg:p-6 pb-28 font-sans text-white overflow-y-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#182A40] pb-4">
        <div>
          <h2 className="text-[26px] font-semibold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-[#00E5FF]" />
            <span>Discovery & embedding clusters</span>
          </h2>
          <p className="text-sm font-normal text-[#94A3B8] mt-1">
            2D projection of RemoteCLIP tile embeddings. Linked bidirectionally to the interactive map.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#182A40] mb-3">
            <span className="text-xs font-semibold text-white flex items-center space-x-2">
              <Network className="w-4 h-4 text-[#00E5FF]" />
              <span>UMAP / HDBSCAN embeddings projection</span>
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">2,480 embeddings</span>
          </div>
          <div className="flex-1 bg-[#070D16] rounded-lg border border-[#182A40]/50 relative flex items-center justify-center">
            <div className="text-center text-[#94A3B8] text-xs space-y-2">
              <div className="w-3 h-3 bg-[#00E5FF] rounded-full animate-ping mx-auto" />
              <p className="font-medium text-white">Clustering engine ready</p>
              <p className="text-[11px] text-[#64748B]">Select clusters to highlight geographic footprints on the map</p>
            </div>
          </div>
        </div>

        <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#182A40] mb-3">
            <span className="text-xs font-semibold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#10B981]" />
              <span>Similar site exemplar discovery</span>
            </span>
          </div>
          <div className="flex-1 bg-[#070D16] rounded-lg border border-[#182A40]/50 p-6 text-[#94A3B8] text-xs space-y-3 flex flex-col justify-center">
            <p>Upload an exemplar tile or click any scene patch to find visually & semantically similar ground features across the multi-temporal archive.</p>
            <div className="border-2 border-dashed border-[#182A40] rounded-lg p-6 text-center hover:border-[#00E5FF]/50 cursor-pointer transition">
              <span className="text-[#00E5FF] text-xs font-medium">Drag & drop GeoTIFF tile exemplar here</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
