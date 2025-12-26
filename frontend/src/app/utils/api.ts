// API service for backend communication
// Implements caching to minimize API calls

import { AIAnalysis } from '../types/lead';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface BackendResponse {
  analysis: {
    intent: string;
    urgency: 'low' | 'medium' | 'high';
    primary_friction: string;
    lead_half_life_minutes: number;
    confidence: number; // 0-1
  };
  friction_action: string;
  decay_priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  human_required: boolean;
}

// Cache key generator - uses message content as key
function getCacheKey(message: string): string {
  // Normalize message for cache key (trim, lowercase, remove extra spaces)
  const normalized = message.trim().toLowerCase().replace(/\s+/g, ' ');
  return `lead_analysis_${normalized}`;
}

// Cache TTL: 1 hour (3600000 ms)
const CACHE_TTL = 60 * 60 * 1000;

interface CacheEntry {
  data: AIAnalysis;
  timestamp: number;
}

// Get from cache
function getFromCache(message: string): AIAnalysis | null {
  try {
    const cacheKey = getCacheKey(message);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

// Save to cache
function saveToCache(message: string, data: AIAnalysis): void {
  try {
    const cacheKey = getCacheKey(message);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Cache write error:', error);
    // If storage is full, clear old entries
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCacheEntries();
    }
  }
}

// Clear old cache entries (keep last 50)
function clearOldCacheEntries(): void {
  try {
    const entries: Array<{ key: string; timestamp: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('lead_analysis_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            entries.push({ key, timestamp: entry.timestamp });
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    // Sort by timestamp (oldest first) and remove oldest entries
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = entries.slice(0, Math.max(0, entries.length - 50));
    
    toRemove.forEach(({ key }) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}

// Transform backend response to frontend format
function transformResponse(response: BackendResponse): AIAnalysis {
  // Map friction enum to readable string
  const frictionMap: Record<string, string> = {
    budget_uncertainty: 'Budget uncertainty or price concern',
    choice_overload: 'Too many options causing decision paralysis',
    trust_validation: 'Need for trust validation or credibility proof',
    timeline_pressure: 'Urgent timeline or deadline pressure',
    information_gap: 'Missing critical information or specifications',
    low_commitment: 'Low commitment or early-stage inquiry',
  };

  // Map friction action to recommended action
  const actionMap: Record<string, string> = {
    share_price_range: 'Send pricing information and budget-friendly options',
    ask_clarifying_question: 'Ask clarifying questions to narrow down requirements',
    send_case_study: 'Share case studies and customer testimonials',
    immediate_call: 'Schedule immediate call within 1 hour',
    nurture: 'Send automated follow-up with product information',
  };

  return {
    intent: response.analysis.intent,
    urgency: response.analysis.urgency,
    primaryFriction: frictionMap[response.analysis.primary_friction] || response.analysis.primary_friction,
    decayPriority: response.decay_priority,
    confidenceScore: Math.round(response.analysis.confidence * 100),
    humanReviewRequired: response.human_required,
    recommendedAction: actionMap[response.friction_action] || response.friction_action,
  };
}

export async function analyzeLead(
  message: string,
  source?: string,
  contact?: string
): Promise<AIAnalysis> {
  // Check cache first
  const cached = getFromCache(message);
  if (cached) {
    console.log('Using cached analysis result');
    return cached;
  }

  // Make API call
  try {
    const response = await fetch(`${API_BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        source,
        contact,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data: BackendResponse = await response.json();
    const transformed = transformResponse(data);

    // Save to cache
    saveToCache(message, transformed);

    return transformed;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Health check function
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

