/**
 * Safety guards and environment validation
 */

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  const required = ["OPENAI_API_KEY"];
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Sanitize input to prevent prompt injection
 */
export function sanitizeInput(input: string): string {
  // Remove common prompt injection patterns
  let sanitized = input.trim();
  
  // Remove system instruction attempts
  sanitized = sanitized.replace(
    /(ignore|forget|disregard)\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?|directives?)/gi,
    ""
  );
  
  // Remove role-playing attempts
  sanitized = sanitized.replace(
    /(you\s+are|act\s+as|pretend\s+to\s+be|roleplay)\s+/gi,
    ""
  );
  
  // Remove template markers
  sanitized = sanitized.replace(/\[INST\]|\[\/INST\]|<\|.*?\|>/gi, "");
  
  // Limit length
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000);
  }
  
  return sanitized;
}

