import { AIAnalysis, UrgencyLevel, DecayPriority } from '../types/lead';

export function generateMockAIAnalysis(message: string): AIAnalysis {
  // Simple keyword-based mock analysis
  const lowerMessage = message.toLowerCase();
  
  // Detect urgency
  let urgency: UrgencyLevel = 'low';
  let decayPriority: DecayPriority = 'LOW';
  
  if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('immediately')) {
    urgency = 'high';
    decayPriority = 'CRITICAL';
  } else if (lowerMessage.includes('soon') || lowerMessage.includes('quick') || lowerMessage.includes('need')) {
    urgency = 'medium';
    decayPriority = 'HIGH';
  } else if (lowerMessage.includes('when possible') || lowerMessage.includes('eventually')) {
    urgency = 'low';
    decayPriority = 'MEDIUM';
  } else {
    // Default based on message length and question marks
    const hasQuestions = (lowerMessage.match(/\?/g) || []).length > 0;
    urgency = hasQuestions ? 'medium' : 'low';
    decayPriority = hasQuestions ? 'MEDIUM' : 'LOW';
  }
  
  // Detect intent
  let intent = 'General Inquiry';
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
    intent = 'Pricing Information Request';
  } else if (lowerMessage.includes('sample') || lowerMessage.includes('test')) {
    intent = 'Sample Request';
  } else if (lowerMessage.includes('order') || lowerMessage.includes('purchase') || lowerMessage.includes('buy')) {
    intent = 'Purchase Intent';
  } else if (lowerMessage.includes('specification') || lowerMessage.includes('technical') || lowerMessage.includes('datasheet')) {
    intent = 'Technical Specification Inquiry';
  } else if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping') || lowerMessage.includes('lead time')) {
    intent = 'Delivery Timeline Inquiry';
  }
  
  // Detect primary friction
  let primaryFriction = 'Lack of detailed contact information';
  if (!message.match(/[\w\.-]+@[\w\.-]+\.\w+/) && !message.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
    primaryFriction = 'Missing contact details';
  } else if (lowerMessage.includes('confused') || lowerMessage.includes('unclear')) {
    primaryFriction = 'Product clarity or communication issues';
  } else if (lowerMessage.includes('price') || lowerMessage.includes('expensive')) {
    primaryFriction = 'Price concern or budget constraints';
  } else if (message.length < 30) {
    primaryFriction = 'Vague inquiry with minimal context';
  } else {
    primaryFriction = 'Requires immediate attention to prevent delay';
  }
  
  // Confidence score (random but influenced by message quality)
  const hasContactInfo = message.match(/[\w\.-]+@[\w\.-]+\.\w+/) || message.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
  const messageLength = message.length;
  let confidence = 70 + Math.random() * 20; // Base 70-90%
  
  if (hasContactInfo) confidence += 5;
  if (messageLength > 50) confidence += 3;
  if (messageLength > 150) confidence += 2;
  
  confidence = Math.min(98, Math.round(confidence));
  
  // Human review required if confidence is low or critical priority
  const humanReviewRequired = confidence < 75 || decayPriority === 'CRITICAL';
  
  // Recommended action
  let recommendedAction = 'Send automated response with product information';
  if (urgency === 'high') {
    recommendedAction = 'Immediate call within 1 hour';
  } else if (intent === 'Purchase Intent') {
    recommendedAction = 'Priority call within 4 hours';
  } else if (intent === 'Pricing Information Request') {
    recommendedAction = 'Send detailed pricing quote via email';
  } else if (intent === 'Sample Request') {
    recommendedAction = 'Process sample order and follow up';
  }
  
  return {
    intent,
    urgency,
    primaryFriction,
    decayPriority,
    confidenceScore: confidence,
    humanReviewRequired,
    recommendedAction,
  };
}
