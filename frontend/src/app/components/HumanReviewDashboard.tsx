import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import { AlertTriangle, CheckCircle2, Edit, TrendingUp, X, User, Mail, Phone, Clock, ExternalLink } from 'lucide-react';

export function HumanReviewDashboard() {
  const navigate = useNavigate();
  const { leads, updateLeadStatus } = useLeads();
  const [filter, setFilter] = useState<'all' | 'review-required'>('all');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  
  const filteredLeads = filter === 'review-required'
    ? leads.filter(lead => lead.aiAnalysis.humanReviewRequired)
    : leads;
  
  const selectedLeadData = selectedLead ? leads.find(l => l.id === selectedLead) : null;
  
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
  
  const statusColors = {
    pending: 'bg-gray-100 text-gray-700',
    approved: 'bg-green-100 text-green-700',
    edited: 'bg-blue-100 text-blue-700',
    escalated: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-gray-900">Human Review Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Review and manage incoming product inquiries
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              New Inquiry
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Total Leads</p>
            <p className="text-2xl text-gray-900">{leads.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Review Required</p>
            <p className="text-2xl text-amber-600">
              {leads.filter(l => l.aiAnalysis.humanReviewRequired).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Critical Priority</p>
            <p className="text-2xl text-red-600">
              {leads.filter(l => l.aiAnalysis.decayPriority === 'CRITICAL').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Approved</p>
            <p className="text-2xl text-green-600">
              {leads.filter(l => l.status === 'approved').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Leads
            </button>
            <button
              onClick={() => setFilter('review-required')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === 'review-required'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Review Required
            </button>
          </div>
        </div>

        {/* Leads Table/List */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 mb-4">No leads to display</p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Submit a test inquiry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-gray-500">Lead</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-gray-500">Urgency</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-gray-500">Decay Priority</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-gray-500">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wide text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLead(lead.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        {lead.aiAnalysis.humanReviewRequired && (
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                        )}
                        <div>
                          <p className="text-sm text-gray-900">
                            {lead.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600 truncate max-w-md">
                            {lead.message.slice(0, 80)}...
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(lead.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs uppercase border ${
                          urgencyColors[lead.aiAnalysis.urgency]
                        }`}
                      >
                        {lead.aiAnalysis.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          decayColors[lead.aiAnalysis.decayPriority]
                        }`}
                      >
                        {lead.aiAnalysis.decayPriority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {lead.aiAnalysis.confidenceScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs capitalize ${
                          statusColors[lead.status]
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead.id);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side Panel for Lead Details */}
      {selectedLeadData && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-start justify-end z-50">
          <div className="bg-white h-full w-full max-w-2xl overflow-y-auto shadow-2xl">
            {/* Panel Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg text-gray-900">Lead Details</h2>
                <p className="text-sm text-gray-600">#{selectedLeadData.id.slice(-6)}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="p-6 space-y-6">
              {/* Original Inquiry */}
              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                  Original Inquiry
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedLeadData.message}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {selectedLeadData.name && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{selectedLeadData.name}</span>
                    </div>
                  )}
                  {selectedLeadData.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedLeadData.email}</span>
                    </div>
                  )}
                  {selectedLeadData.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedLeadData.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{new Date(selectedLeadData.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* AI Analysis Summary */}
              <div>
                <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                  AI Analysis Summary
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Intent</p>
                    <p className="text-sm text-gray-900">{selectedLeadData.aiAnalysis.intent}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Primary Friction</p>
                    <p className="text-sm text-gray-900">{selectedLeadData.aiAnalysis.primaryFriction}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Recommended Action</p>
                    <p className="text-sm text-gray-900">{selectedLeadData.aiAnalysis.recommendedAction}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedLeadData.aiAnalysis.humanReviewRequired && selectedLeadData.status === 'pending' && (
                <div>
                  <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                    Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        updateLeadStatus(selectedLeadData.id, 'approved');
                        setSelectedLead(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve AI Decision
                    </button>
                    <button
                      onClick={() => {
                        updateLeadStatus(selectedLeadData.id, 'edited');
                        setSelectedLead(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Recommendation
                    </button>
                    <button
                      onClick={() => {
                        updateLeadStatus(selectedLeadData.id, 'escalated');
                        setSelectedLead(null);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Escalate
                    </button>
                    <button
                      onClick={() => navigate(`/analysis/${selectedLeadData.id}`)}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Full Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
