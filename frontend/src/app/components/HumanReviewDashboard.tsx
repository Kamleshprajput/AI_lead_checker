import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import {
  AlertTriangle,
  CheckCircle2,
  Edit,
  TrendingUp,
  X,
  User,
  Mail,
  Phone,
  Clock,
  ExternalLink
} from 'lucide-react';

export function HumanReviewDashboard() {
  const navigate = useNavigate();
  const { leads, updateLeadStatus } = useLeads();
  const [filter, setFilter] = useState<'all' | 'review-required'>('all');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  /**
   * ✅ FIX:
   * Show ONLY pending leads in the table.
   * Approved / edited / escalated leads are archived implicitly.
   */
  const filteredLeads = leads.filter(lead => {
    if (lead.status !== 'pending') return false;

    if (filter === 'review-required') {
      return lead.aiAnalysis.humanReviewRequired;
    }

    return true;
  });

  const selectedLeadData = selectedLead
    ? leads.find(l => l.id === selectedLead)
    : null;

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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <div>
            <h1 className="text-xl text-gray-900">Human Review Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and manage incoming product inquiries
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            New Inquiry
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            All Pending
          </button>
          <button
            onClick={() => setFilter('review-required')}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === 'review-required'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Review Required
          </button>
        </div>

        {/* Leads Table */}
        {filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-600">No pending leads</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map(lead => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedLead(lead.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        {lead.aiAnalysis.humanReviewRequired && (
                          <AlertTriangle className="w-4 h-4 text-amber-600 mt-1" />
                        )}
                        <div>
                          <p className="text-sm text-gray-900">
                            {lead.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-gray-600 truncate max-w-md">
                            {lead.message.slice(0, 80)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs border ${
                          urgencyColors[lead.aiAnalysis.urgency]
                        }`}
                      >
                        {lead.aiAnalysis.urgency}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          decayColors[lead.aiAnalysis.decayPriority]
                        }`}
                      >
                        {lead.aiAnalysis.decayPriority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          statusColors[lead.status]
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {selectedLeadData && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
            <div className="p-6 border-b flex justify-between">
              <h2 className="text-lg">Lead Details</h2>
              <button onClick={() => setSelectedLead(null)}>
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {selectedLeadData.message}
              </p>

              {selectedLeadData.status === 'pending' && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      updateLeadStatus(selectedLeadData.id, 'approved');
                      setSelectedLead(null);
                    }}
                    className="w-full bg-green-600 text-white py-2 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => {
                      updateLeadStatus(selectedLeadData.id, 'edited');
                      setSelectedLead(null);
                    }}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      updateLeadStatus(selectedLeadData.id, 'escalated');
                      setSelectedLead(null);
                    }}
                    className="w-full bg-red-600 text-white py-2 rounded"
                  >
                    Escalate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
