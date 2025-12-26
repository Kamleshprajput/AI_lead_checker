import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LeadProvider } from './context/LeadContext';
import { LeadCaptureForm } from './components/LeadCaptureForm';
import { AIAnalysisResult } from './components/AIAnalysisResult';
import { HumanReviewDashboard } from './components/HumanReviewDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <LeadProvider>
        <Routes>
          <Route path="/" element={<LeadCaptureForm />} />
          <Route path="/analysis/:leadId" element={<AIAnalysisResult />} />
          <Route path="/dashboard" element={<HumanReviewDashboard />} />
        </Routes>
      </LeadProvider>
    </BrowserRouter>
  );
}
