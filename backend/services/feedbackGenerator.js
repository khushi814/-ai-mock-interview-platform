// services/feedbackGenerator.js
// Ye file poori interview transcript leke Claude API ko bhejti hai
// aur ek structured feedback report wapas leti hai

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function generateFeedback(transcript, interviewType) {
  const systemPrompt = `You are an expert interview coach analyzing a completed mock ${interviewType} interview.
Read the full conversation transcript between the AI interviewer and the candidate.
Produce a detailed feedback report in JSON format ONLY (no preamble, no markdown fences).

The JSON must have this exact structure:
{
  "overall_score": <number 1-10>,
  "summary": "<2-3 sentence overall impression>",
  "strengths": ["<point 1>", "<point 2>", ...],
  "areas_to_improve": ["<point 1>", "<point 2>", ...],
  "question_by_question": [
    { "question": "<what was asked>", "answer_quality": "<strong/adequate/weak>", "feedback": "<specific comment>" }
  ],
  "communication_notes": "<comment on clarity, structure e.g. STAR method, confidence>"
}`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is the full interview transcript:\n\n${JSON.stringify(transcript, null, 2)}`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Claude API error:', data);
    throw new Error('Feedback generate karne me error aaya: ' + JSON.stringify(data));
  }

  const rawText = data.content[0].text;

  const cleaned = rawText.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse feedback JSON:', rawText);
    // Agar parse fail ho, raw text hi wapas de do taaki data loss na ho
    return { raw_feedback: rawText, parse_error: true };
  }
}
