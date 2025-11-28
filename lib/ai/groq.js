import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate AI completion using Groq
 * @param {string} systemPrompt - Instructions for the AI
 * @param {string} userMessage - User's input
 * @param {number} maxTokens - Max response length
 * @returns {Promise<string>} - AI response
 */
export async function generateCompletion(systemPrompt, userMessage, maxTokens = 500) {
  try {
    console.log('🤖 Calling Groq API...');
    console.log('System:', systemPrompt.substring(0, 100) + '...');
    console.log('User:', userMessage.substring(0, 100) + '...');

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      model: 'llama-3.3-70b-versatile', // Fast and free
      temperature: 0.7,
      max_tokens: maxTokens,
      top_p: 1,
      stream: false,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    console.log('✅ Groq response:', response.substring(0, 100) + '...');

    return response;
  } catch (error) {
    console.error('❌ Groq API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

/**
 * Summarize text content
 */
export async function summarizeText(text) {
  const systemPrompt = `You are a helpful assistant that creates concise, clear summaries.
Keep summaries under 100 words. Focus on key points and actionable insights.`;

  const userMessage = `Please summarize this text:\n\n${text}`;

  return await generateCompletion(systemPrompt, userMessage, 200);
}

/**
 * Suggest tasks based on existing tasks
 */
export async function suggestTasks(existingTasks) {
  const systemPrompt = `You are a productivity assistant that suggests relevant next tasks.
Be specific and actionable. Return 3-5 task suggestions as a simple numbered list.`;

  const taskList = existingTasks.map(t => `- ${t.text}`).join('\n');
  const userMessage = `Based on these current tasks:\n${taskList}\n\nSuggest 3-5 related tasks that would be helpful to add.`;

  return await generateCompletion(systemPrompt, userMessage, 300);
}

/**
 * Analyze chart data and provide insights
 */
export async function analyzeChartData(data, chartType) {
  const systemPrompt = `You are a data analyst providing brief, actionable insights from chart data.
Keep insights under 80 words. Focus on trends, anomalies, and recommendations.`;

  const dataPoints = data.map(d => `${d.name}: ${d.value}`).join(', ');
  const userMessage = `Analyze this ${chartType} chart data and provide key insights:\n${dataPoints}`;

  return await generateCompletion(systemPrompt, userMessage, 200);
}

/**
 * Generate response for chat messages
 */
export async function generateChatResponse(messages) {
  const systemPrompt = `You are a helpful team assistant in a collaborative workspace.
Be friendly, concise, and helpful. Keep responses under 100 words.`;

  const chatHistory = messages.slice(-5).map(m => `${m.user_name}: ${m.message}`).join('\n');
  const userMessage = `Recent chat:\n${chatHistory}\n\nProvide a helpful response or suggestion.`;

  return await generateCompletion(systemPrompt, userMessage, 200);
}
