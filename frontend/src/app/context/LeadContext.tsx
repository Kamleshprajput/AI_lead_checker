import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Lead } from '../types/lead';

interface LeadContextType {
  leads: Lead[];
  addLead: (lead: Lead) => void;
  updateLeadStatus: (leadId: string, status: Lead['status']) => void;
  getLeadById: (leadId: string) => Lead | undefined;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const addLead = (lead: Lead) => {
    setLeads((prev) => [lead, ...prev]);
  };
  
  const updateLeadStatus = (leadId: string, status: Lead['status']) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status } : lead
      )
    );
  };
  
  const getLeadById = (leadId: string) => {
    return leads.find((lead) => lead.id === leadId);
  };
  
  return (
    <LeadContext.Provider value={{ leads, addLead, updateLeadStatus, getLeadById }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
