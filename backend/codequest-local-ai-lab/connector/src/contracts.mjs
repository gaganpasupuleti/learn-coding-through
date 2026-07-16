export const TAILOR_RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'matched_keywords', 'missing_keywords', 'suggestions', 'warnings'],
  properties: {
    summary: { type: 'string' },
    matched_keywords: { type: 'array', items: { type: 'string' } },
    missing_keywords: { type: 'array', items: { type: 'string' } },
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'section',
          'original',
          'suggested',
          'reason',
          'evidence',
          'confidence',
        ],
        properties: {
          id: { type: 'string' },
          section: {
            type: 'string',
            enum: ['summary', 'experience', 'projects', 'skills'],
          },
          original: { type: 'string' },
          suggested: { type: 'string' },
          reason: { type: 'string' },
          evidence: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
        },
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
  },
};

export class InputError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'InputError';
    this.field = field;
  }
}

function requireText(value, field, minimum, maximum) {
  if (typeof value !== 'string') {
    throw new InputError(`${field} must be text`, field);
  }
  const trimmed = value.trim();
  if (trimmed.length < minimum) {
    throw new InputError(`${field} must contain at least ${minimum} characters`, field);
  }
  if (trimmed.length > maximum) {
    throw new InputError(`${field} must contain at most ${maximum} characters`, field);
  }
  return trimmed;
}

export function validateTailorRequest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new InputError('Request body must be a JSON object', 'body');
  }

  const model = requireText(value.model, 'model', 1, 200);
  if (!/^[a-zA-Z0-9_.:/-]+$/.test(model)) {
    throw new InputError('model contains unsupported characters', 'model');
  }

  return {
    model,
    resumeText: requireText(value.resume_text, 'resume_text', 20, 50000),
    jobDescription: requireText(value.job_description, 'job_description', 20, 30000),
  };
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function validateTailorResult(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('AI response is not a JSON object');
  }
  if (typeof value.summary !== 'string') {
    throw new Error('AI response summary is invalid');
  }
  if (!isStringArray(value.matched_keywords) || !isStringArray(value.missing_keywords)) {
    throw new Error('AI response keyword arrays are invalid');
  }
  if (!isStringArray(value.warnings) || !Array.isArray(value.suggestions)) {
    throw new Error('AI response suggestions or warnings are invalid');
  }

  const allowedSections = new Set(['summary', 'experience', 'projects', 'skills']);
  const suggestions = value.suggestions.map((suggestion, index) => {
    if (!suggestion || typeof suggestion !== 'object' || Array.isArray(suggestion)) {
      throw new Error(`AI suggestion ${index + 1} is invalid`);
    }
    const requiredStrings = ['id', 'section', 'original', 'suggested', 'reason'];
    for (const field of requiredStrings) {
      if (typeof suggestion[field] !== 'string') {
        throw new Error(`AI suggestion ${index + 1} has invalid ${field}`);
      }
    }
    if (!allowedSections.has(suggestion.section)) {
      throw new Error(`AI suggestion ${index + 1} has unsupported section`);
    }
    if (!isStringArray(suggestion.evidence)) {
      throw new Error(`AI suggestion ${index + 1} has invalid evidence`);
    }
    if (
      typeof suggestion.confidence !== 'number' ||
      suggestion.confidence < 0 ||
      suggestion.confidence > 1
    ) {
      throw new Error(`AI suggestion ${index + 1} has invalid confidence`);
    }
    return suggestion;
  });

  return {
    summary: value.summary,
    matched_keywords: value.matched_keywords,
    missing_keywords: value.missing_keywords,
    suggestions,
    warnings: value.warnings,
  };
}

function normalizeEvidence(value) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function addEvidenceFlags(result, resumeText) {
  const normalizedResume = normalizeEvidence(resumeText);
  return {
    ...result,
    suggestions: result.suggestions.map((suggestion) => ({
      ...suggestion,
      evidence_verified:
        suggestion.evidence.length > 0 &&
        suggestion.evidence.every((item) => normalizedResume.includes(normalizeEvidence(item))),
    })),
  };
}

