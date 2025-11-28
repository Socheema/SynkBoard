import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { summarizeText, suggestTasks, analyzeChartData, generateChatResponse } from '@/lib/ai/groq';

// Cache for rate limiting (simple in-memory cache)
const requestCache = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = requestCache.get(userId) || [];

  // Remove old requests outside the window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  recentRequests.push(now);
  requestCache.set(userId, recentRequests);
  return true;
}

export async function POST(request) {
  try {
    // Check authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    // Parse request
    const body = await request.json();
    const { action, data } = body;

    console.log(`🤖 AI Request - Action: ${action}, User: ${userId}`);

    let result;

    switch (action) {
      case 'summarize':
        if (!data.text) {
          return NextResponse.json(
            { error: 'Text is required for summarization' },
            { status: 400 }
          );
        }
        result = await summarizeText(data.text);
        break;

      case 'suggest-tasks':
        if (!data.tasks || !Array.isArray(data.tasks)) {
          return NextResponse.json(
            { error: 'Tasks array is required' },
            { status: 400 }
          );
        }
        result = await suggestTasks(data.tasks);
        break;

      case 'analyze-chart':
        if (!data.chartData || !Array.isArray(data.chartData)) {
          return NextResponse.json(
            { error: 'Chart data array is required' },
            { status: 400 }
          );
        }
        result = await analyzeChartData(data.chartData, data.chartType || 'line');
        break;

      case 'chat-assist':
        if (!data.messages || !Array.isArray(data.messages)) {
          return NextResponse.json(
            { error: 'Messages array is required' },
            { status: 400 }
          );
        }
        result = await generateChatResponse(data.messages);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });

  } catch (error) {
    console.error('❌ AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
