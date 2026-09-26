import React from 'react';
import { Candidate } from '../types/kshitij';
import { Crosshair } from 'lucide-react';

interface CandidateDetailViewProps {
  candidate: Candidate | null;
  onBackToCommand: () => void;
}

export const CandidateDetailView: React.FC<CandidateDetailViewProps> = ({
  candidate,
  onBackToCommand,
}) => {
  if (!candidate) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-bg-0 text-text-1 font-mono text-xs space-y-3">
        <Crosshair className="w-8 h-8 text-cyan/50" />
        <p>No candidate selected. Select a candidate from the Command View or Review Queue.</p>
        <button
          onClick={onBackToCommand}
          className="px-3 py-1.5 bg-bg-2 border border-line hover:border-cyan text-text-0 rounded"
        >
          Return to Command View
        </button>
      </div>
    );
  }

  const { confidence } = candidate;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D16] overflow-y-auto p-4 lg:p-6 pb-28 font-sans space-y-6 text-white">
      <div className="flex items-center justify-between border-b border-[#182A40] pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xl font-semibold text-white">{candidate.changeType}</span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-medium">
              {candidate.classifiedBy} classifier
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-medium">
              Verdict: {candidate.verdict}
            </span>
          </div>
          <div className="text-xs text-[#94A3B8] mt-1.5">
            Candidate ID: <span className="text-white font-mono">{candidate.id}</span> · Earliest evidence:{' '}
            <span className="text-white font-mono">{candidate.firstEvidenceAt}</span> (Scene: <span className="font-mono text-white">{candidate.firstEvidenceSceneId}</span>)
          </div>
        </div>

        <button
          onClick={onBackToCommand}
          className="px-3.5 py-1.5 bg-[#0E1A2B] border border-[#182A40] hover:border-[#00E5FF]/50 text-white rounded-lg text-xs font-medium transition cursor-pointer"
        >
          Close detail
        </button>
      </div>

      {/* Confidence Breakdown Bars */}
      <div className="bg-[#0B1523] border border-[#182A40] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">
            Confidence breakdown (Weighted geometric mean)
          </span>
          <span className="text-[#10B981] font-mono font-bold text-sm">
            {(confidence.overall * 100).toFixed(1)}% overall confidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <div className="flex justify-between text-text-1 mb-1">
              <span>Semantic Relevance</span>
              <span className="text-text-0">{(confidence.semanticRelevance * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-bg-0 rounded-full h-2">
              <div
                className="bg-cyan h-2 rounded-full"
                style={{ width: `${confidence.semanticRelevance * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-text-1 mb-1">
              <span>Temporal Persistence</span>
              <span className="text-text-0">{(confidence.temporalPersistence * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-bg-0 rounded-full h-2">
              <div
                className="bg-green h-2 rounded-full"
                style={{ width: `${confidence.temporalPersistence * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-text-1 mb-1">
              <span>Registration Quality</span>
              <span className="text-text-0">{(confidence.registrationQuality * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-bg-0 rounded-full h-2">
              <div
                className="bg-cyan h-2 rounded-full"
                style={{ width: `${confidence.registrationQuality * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-text-1 mb-1">
              <span>Observation Cleanliness</span>
              <span className="text-text-0">{(confidence.observationCleanliness * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-bg-0 rounded-full h-2">
              <div
                className="bg-green h-2 rounded-full"
                style={{ width: `${confidence.observationCleanliness * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
