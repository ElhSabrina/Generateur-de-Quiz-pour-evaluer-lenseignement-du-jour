// services/ai.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
// Default model: fast and cheap
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite-001';

let genAI = null;

if (!apiKey) {
  console.warn(
    '[Gemini] GEMINI_API_KEY is missing. AI quiz generation will return an empty list.'
  );
} else {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Try to extract the JSON object from the model raw text.
 */
function extractJsonString(raw) {
  if (!raw) return '';
  const match = raw.match(/\{[\s\S]*\}/);
  return match ? match[0] : raw;
}

/**
 * Generate a quiz from course content.
 * rawText: plain text (can already include text + PDF text concatenated)
 * subjectName: subject title (e.g. "Physics")
 * quizTitle: quiz title (e.g. "Chapter 1 – Waves")
 * maxQuestions: how many MCQs
 */
async function generateQuizFromText(
  rawText,
  subjectName = '',
  quizTitle = '',
  maxQuestions = 5
) {
  if (!genAI) {
    console.warn('[Gemini] No client initialized, returning empty quiz.');
    return [];
  }

  const cleanText = (rawText || '').trim();
  if (!cleanText) {
    console.warn('[Gemini] Empty course text. Returning empty quiz.');
    return [];
  }

  const modelId = modelName || 'gemini-2.0-flash-lite-001';

  console.log('[Gemini] Generating quiz with:');
  console.log('  Subject:', subjectName || '(none)');
  console.log('  Title  :', quizTitle || '(no title)');
  console.log('  Text length:', cleanText.length);
  console.log('  Model :', modelId);

  const model = genAI.getGenerativeModel({ model: modelId });

  const instructions = `
You are a university teaching assistant.
Based on the course material, generate ${maxQuestions} multiple-choice questions (MCQs) in ENGLISH.

Each question MUST have:
- "text": the question text
- 4 options: "option_a", "option_b", "option_c", "option_d"
- "correct_option": one of "A", "B", "C", or "D"

Return ONLY valid JSON with this exact structure:

{
  "questions": [
    {
      "text": "Question text ...",
      "option_a": "Option A ...",
      "option_b": "Option B ...",
      "option_c": "Option C ...",
      "option_d": "Option D ...",
      "correct_option": "A"
    }
  ]
}

No explanation, no markdown, no comments.
`;

  const prompt =
    instructions +
    `\nContext:\n- Subject: ${subjectName || 'N/A'}\n- Quiz title: ${
      quizTitle || 'N/A'
    }\n\nCourse content:\n"""${cleanText.slice(0, 6000)}"""`;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    const fullText =
      result?.response?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('\n') || '';

    if (!fullText) {
      console.warn('[Gemini] Empty response text, returning empty quiz.');
      return [];
    }

    let parsed;
    try {
      const jsonString = extractJsonString(fullText);
      parsed = JSON.parse(jsonString);
    } catch (parseErr) {
      console.error(
        '[Gemini] Could not parse JSON from Gemini response:',
        parseErr.message
      );
      console.error('[Gemini] Raw content was:', fullText);
      return [];
    }

    const list = Array.isArray(parsed.questions) ? parsed.questions : [];

    return list
      .map((q) => ({
        text: q.text || '',
        option_a: q.option_a || '',
        option_b: q.option_b || '',
        option_c: q.option_c || '',
        option_d: q.option_d || '',
        correct_option: (q.correct_option || 'A').toUpperCase(),
        topic_tag: 'ai_generated'
      }))
      .filter(
        (q) =>
          q.text && q.option_a && q.option_b && q.option_c && q.option_d
      );
  } catch (err) {
    console.error('[Gemini] quiz generation failed:', err);
    return [];
  }
}

module.exports = { generateQuizFromText };
