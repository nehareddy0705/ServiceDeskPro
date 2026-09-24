import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, RefreshCw, Check, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { ticketService } from '../../services/ticketService';
import { useToast } from '../../context/ToastContext';

export const AITicketCopilot = ({ ticket, onTicketUpdated }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [applyingCategory, setApplyingCategory] = useState(false);
  const [applyingPriority, setApplyingPriority] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const ai = ticket?.aiClassification || {};

  const handleRegenerate = async () => {
    setAnalyzing(true);
    try {
      const updatedTicket = await ticketService.aiAnalyze(ticket._id);
      toast.success('AI analysis regenerated.');
      if (onTicketUpdated) onTicketUpdated(updatedTicket);
    } catch (err) {
      toast.error(err.message || 'Failed to regenerate analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyCategory = async () => {
    if (!ai.predictedCategory) return;
    setApplyingCategory(true);
    try {
      const categoryId = typeof ai.predictedCategory === 'object' ? ai.predictedCategory._id : ai.predictedCategory;
      const updated = await ticketService.updateTicket(ticket._id, { category: categoryId });
      toast.success('Applied suggested category.');
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err) {
      toast.error(err.message || 'Failed to apply category.');
    } finally {
      setApplyingCategory(false);
    }
  };

  const handleApplyPriority = async () => {
    if (!ai.predictedPriority) return;
    setApplyingPriority(true);
    try {
      const updated = await ticketService.updateTicket(ticket._id, { priority: ai.predictedPriority });
      toast.success('Applied suggested priority.');
      if (onTicketUpdated) onTicketUpdated(updated);
    } catch (err) {
      toast.error(err.message || 'Failed to apply priority.');
    } finally {
      setApplyingPriority(false);
    }
  };

  const predictedCategoryName =
    ai.predictedCategory?.name ||
    (typeof ai.predictedCategory === 'string' ? ai.predictedCategory : null);

  const troubleshootingSteps = Array.isArray(ai.suggestedTroubleshooting)
    ? ai.suggestedTroubleshooting
    : [];

  const confidencePercent = ai.confidence != null ? Math.round(ai.confidence * 100) : null;

  return (
    <div className="bg-slate-50/70 border border-slate-300 rounded p-4 text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center">
            <Cpu className="w-3 h-3 text-slate-200" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 text-xs block">AI Assistance</span>
            <span className="text-[10px] text-slate-500">Automated diagnostic classification</span>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleRegenerate}
          loading={analyzing}
          icon={RefreshCw}
          className="text-xs h-7 px-2"
        >
          Regenerate
        </Button>
      </div>

      {/* Analysis Grid */}
      <div className="space-y-3">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Ticket Analysis
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Category */}
          <div className="bg-white p-2.5 rounded border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Suggested Category</span>
              <div className="font-semibold text-slate-900 text-xs mt-0.5 truncate">
                {predictedCategoryName || <span className="text-slate-400 font-normal italic">Pending analysis</span>}
              </div>
            </div>
            {ai.predictedCategory && (
              <button
                type="button"
                onClick={handleApplyCategory}
                disabled={applyingCategory}
                className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 text-left font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Apply category
              </button>
            )}
          </div>

          {/* Priority */}
          <div className="bg-white p-2.5 rounded border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Suggested Priority</span>
              <div className="font-semibold text-slate-900 text-xs mt-0.5 capitalize">
                {ai.predictedPriority || <span className="text-slate-400 font-normal italic">Pending analysis</span>}
              </div>
            </div>
            {ai.predictedPriority && (
              <button
                type="button"
                onClick={handleApplyPriority}
                disabled={applyingPriority}
                className="mt-2 text-[11px] text-blue-600 hover:text-blue-800 text-left font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Apply priority
              </button>
            )}
          </div>
        </div>

        {/* Probable Issue & Confidence */}
        <div className="bg-white p-3 rounded border border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Probable Root Cause</span>
            <span className="font-medium text-slate-700">
              {confidencePercent != null ? `Confidence: ${confidencePercent}%` : 'Confidence: N/A'}
            </span>
          </div>
          <div className="font-medium text-slate-900 text-xs leading-relaxed">
            {ai.probableIssue || <span className="text-slate-400 font-normal italic">No diagnostic root cause identified yet.</span>}
          </div>
        </div>
      </div>

      {/* Suggested Troubleshooting */}
      <div className="pt-2 border-t border-slate-200">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Suggested Troubleshooting
        </div>
        {troubleshootingSteps.length > 0 ? (
          <ol className="space-y-1.5 list-decimal list-inside text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-200">
            {troubleshootingSteps.map((step, idx) => (
              <li key={idx} className="text-xs">
                <span className="text-slate-900">{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-xs text-slate-400 italic bg-white p-3 rounded border border-slate-200">
            No automated troubleshooting steps recorded. Click &apos;Regenerate&apos; to run diagnostic analysis.
          </div>
        )}
      </div>

      {/* Relevant Knowledge */}
      {ai.suggestedArticles && ai.suggestedArticles.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Relevant Knowledge
          </div>
          <div className="space-y-1.5">
            {ai.suggestedArticles.map((art) => (
              <div
                key={art._id || art}
                className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-900 truncate">
                    {art.title || 'Troubleshooting Article'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/knowledge/${art._id || art}`)}
                  className="text-blue-600 hover:text-blue-800 shrink-0 font-medium flex items-center gap-1 text-[11px]"
                >
                  <span>Open Article</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
