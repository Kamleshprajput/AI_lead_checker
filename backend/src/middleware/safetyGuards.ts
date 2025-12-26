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

export function sanitizeInput(input: string): string {
  let sanitized = input.trim();
  
  sanitized = sanitized.replace(
    /(ignore|forget|disregard)\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?|directives?)/gi,
    ""
  );
  
  sanitized = sanitized.replace(
    /(you\s+are|act\s+as|pretend\s+to\s+be|roleplay)\s+/gi,
    ""
  );
  
  sanitized = sanitized.replace(/\[INST\]|\[\/INST\]|<\|.*?\|>/gi, "");
  
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000);
  }
  
  return sanitized;
}

