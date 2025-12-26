import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import { AlertTriangle, CheckCircle2, Clock, TrendingDown, ArrowRight, User, Mail, Phone } from 'lucide-react';

export function AIAnalysisResult() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { getLeadById } = useLeads();
  
  const lead = leadId ? getLeadById(leadId) : undefined;
  
  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-gray-900 mb-4">Lead not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Go back to form
          </button>
        </div>
      </div>
    );
  }
  
  const { aiAnalysis } = lead;
  
  const urgencyColors = {
    low: 'bg-green-50 text-green-700 border-green-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-red-50 text-red-700 border-red-200',
  };
  
  const decayColors = {
    LOW: 'bg-gray-100 text-gray-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-gray-900">AI Analysis Complete</h1>
              <p className="text-sm text-gray-600 mt-1">
                Lead #{lead.id.slice(-6)}
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Original Inquiry Context */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-4">
                Original Inquiry
              </h2>
              
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {lead.message}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h3 className="text-xs uppercase tracking-wide text-gray-500">
                  Contact Information
                </h3>
                {lead.name && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{lead.name}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                {!lead.name && !lead.email && !lead.phone && (
                  <p className="text-sm text-gray-500 italic">No contact info provided</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Submitted {new Date(lead.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN - AI Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Human Review Warning */}
            {aiAnalysis.humanReviewRequired && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900">
                    <strong>Human Review Required</strong>
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    This inquiry requires manual review before proceeding with the recommended action.
                  </p>
                </div>
              </div>
            )}

            {/* AI Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detected Intent */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                  Detected Intent
                </h3>
                <p className="text-base text-gray-900">{aiAnalysis.intent}</p>
              </div>

              {/* Urgency Level */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Urgency Level
                </h3>
                <span
                  className={`inline-block px-3 py-1.5 rounded-md border text-sm uppercase ${
                    urgencyColors[aiAnalysis.urgency]
                  }`}
                >
                  {aiAnalysis.urgency}
                </span>
              </div>

              {/* Primary Lead Friction */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" />
                  Primary Lead Friction
                </h3>
                <p className="text-sm text-gray-700">{aiAnalysis.primaryFriction}</p>
              </div>

              {/* Lead Decay Priority */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                  Lead Decay Priority
                </h3>
                <span
                  className={`inline-block px-3 py-1.5 rounded-md text-sm ${
                    decayColors[aiAnalysis.decayPriority]
                  }`}
                >
                  {aiAnalysis.decayPriority}
                </span>
              </div>
            </div>

            {/* AI Confidence Score */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase tracking-wide text-gray-500">
                  AI Confidence Score
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xl text-gray-900">
                    {aiAnalysis.confidenceScore}%
                  </span>
                  {aiAnalysis.confidenceScore >= 80 && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all"
                  style={{ width: `${aiAnalysis.confidenceScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {aiAnalysis.confidenceScore >= 80
                  ? 'High confidence - AI recommendation reliable'
                  : aiAnalysis.confidenceScore >= 60
                  ? 'Moderate confidence - review recommended'
                  : 'Low confidence - human review required'}
              </p>
            </div>

            {/* Recommended Next Action - Callout */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm text-blue-900 mb-3">
                Recommended Next Action
              </h3>
              <p className="text-base text-blue-800">
                {aiAnalysis.recommendedAction}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Submit Another Inquiry
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View All Leads
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
