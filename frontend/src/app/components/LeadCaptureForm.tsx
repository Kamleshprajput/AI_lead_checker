import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import { analyzeLead } from '../utils/api';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export function LeadCaptureForm() {
  const navigate = useNavigate();
  const { addLead } = useLeads();
  const [formData, setFormData] = useState({
    message: '',
    name: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Call backend API (with caching built-in)
      const aiAnalysis = await analyzeLead(
        formData.message,
        'web_form',
        formData.email || formData.phone || formData.name || undefined
      );
      
      const newLead = {
        id: `lead-${Date.now()}`,
        message: formData.message,
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        timestamp: new Date(),
        aiAnalysis,
        status: 'pending' as const,
      };
      
      addLead(newLead);
      navigate(`/analysis/${newLead.id}`);
    } catch (err) {
      console.error('Failed to analyze lead:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to analyze inquiry. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-2">Submit Product Inquiry</h1>
          <p className="text-gray-600">
            Our AI will analyze your request and provide instant insights
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-900 font-medium">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}
            {/* Main Inquiry Field */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm text-gray-700 mb-2">
                Inquiry Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={8}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                placeholder="Describe your material requirements, project timeline, specifications, or any questions..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Include as much detail as possible for better AI analysis
              </p>
            </div>

            {/* Optional Contact Fields - Collapsible */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showOptionalFields ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Contact Information (Optional)
              </button>

              {showOptionalFields && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <label htmlFor="name" className="block text-xs text-gray-600 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs text-gray-600 mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs text-gray-600 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.message.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing Inquiry...
                </span>
              ) : (
                'Analyze Inquiry'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              AI-powered analysis • Typical response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}