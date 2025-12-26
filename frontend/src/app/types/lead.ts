export type UrgencyLevel = 'low' | 'medium' | 'high';
export type DecayPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AIAnalysis {
  intent: string;
  urgency: UrgencyLevel;
  primaryFriction: string;
  decayPriority: DecayPriority;
  confidenceScore: number;
  humanReviewRequired: boolean;
  recommendedAction: string;
}

export interface Lead {
  id: string;
  message: string;
  name?: string;
  phone?: string;
  email?: string;
  timestamp: Date;
  aiAnalysis: AIAnalysis;
  status: 'pending' | 'approved' | 'edited' | 'escalated';
}
