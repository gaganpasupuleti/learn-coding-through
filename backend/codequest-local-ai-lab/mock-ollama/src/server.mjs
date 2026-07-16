import http from 'node:http';

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function extractTag(content, tagName) {
  const match = content.match(new RegExp(`<${tagName}>\\n([\\s\\S]*?)\\n</${tagName}>`));
  return match?.[1]?.trim() || '';
}

function createMockTailorResult(content) {
  const resume = extractTag(content, 'resume');
  const jobDescription = extractTag(content, 'job_description');
  const keywords = ['SQL', 'Python', 'Power BI', 'FastAPI', 'React', 'AWS'];
  const matched = keywords.filter(
    (keyword) =>
      jobDescription.toLowerCase().includes(keyword.toLowerCase()) &&
      resume.toLowerCase().includes(keyword.toLowerCase()),
  );
  const missing = keywords.filter(
    (keyword) =>
      jobDescription.toLowerCase().includes(keyword.toLowerCase()) &&
      !resume.toLowerCase().includes(keyword.toLowerCase()),
  );
  const evidence =
    resume
      .split('\n')
      .map((line) => line.trim().replace(/^[-*]\s*/, ''))
      .find((line) => line.length >= 20) || resume.slice(0, 120);

  return {
    summary: 'Local mock analysis completed. Review every suggestion before saving it.',
    matched_keywords: matched,
    missing_keywords: missing,
    suggestions: [
      {
        id: 'suggestion-1',
        section: 'experience',
        original: evidence,
        suggested: `${evidence} Emphasize the tools already demonstrated when applying for this role.`,
        reason: 'Makes existing evidence easier to scan without adding a new claim.',
        evidence: [evidence],
        confidence: 0.91,
      },
    ],
    warnings: missing.length > 0 ? ['Missing keywords were not added because the resume has no evidence.'] : [],
  };
}

export function createMockOllamaServer() {
  return http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);

    if (request.method === 'GET' && requestUrl.pathname === '/api/tags') {
      sendJson(response, 200, {
        models: [
          {
            name: 'codequest-mock:latest',
            model: 'codequest-mock:latest',
            modified_at: '2026-07-16T00:00:00Z',
            size: 1048576,
            details: {
              parameter_size: 'LAB',
              quantization_level: 'MOCK',
            },
          },
        ],
      });
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/chat') {
      const body = await readJson(request);
      if (body.model !== 'codequest-mock:latest') {
        sendJson(response, 404, { error: 'model not found' });
        return;
      }
      const userContent = body.messages?.find((message) => message.role === 'user')?.content || '';
      const content = userContent.includes('[MALFORMED]')
        ? 'not-json'
        : JSON.stringify(createMockTailorResult(userContent));
      sendJson(response, 200, {
        model: body.model,
        message: { role: 'assistant', content },
        done: true,
        prompt_eval_count: 240,
        eval_count: 110,
      });
      return;
    }

    sendJson(response, 404, { error: 'not found' });
  });
}

