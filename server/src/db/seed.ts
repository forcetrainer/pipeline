import { db, sqlite } from './connection.js';
import { users, useCases, prompts } from './schema.js';
import bcryptjs from 'bcryptjs';
import { sql } from 'drizzle-orm';

const BCRYPT_COST = 12;

export async function seedDatabase() {
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      password TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS use_cases (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      what_was_built TEXT NOT NULL,
      key_learnings TEXT NOT NULL,
      metrics TEXT NOT NULL,
      category TEXT NOT NULL,
      ai_tool TEXT NOT NULL,
      department TEXT NOT NULL,
      impact TEXT NOT NULL,
      effort TEXT NOT NULL,
      status TEXT NOT NULL,
      tags TEXT NOT NULL,
      submitted_by TEXT NOT NULL,
      submitter_team TEXT NOT NULL,
      submitted_by_id TEXT NOT NULL REFERENCES users(id),
      approval_status TEXT NOT NULL,
      reviewed_by TEXT,
      review_notes TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prompts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      description TEXT NOT NULL,
      problem_being_solved TEXT NOT NULL,
      effectiveness_rating INTEGER NOT NULL,
      tips TEXT NOT NULL,
      category TEXT NOT NULL,
      ai_tool TEXT NOT NULL,
      use_case_id TEXT REFERENCES use_cases(id),
      tags TEXT NOT NULL,
      submitted_by TEXT NOT NULL,
      submitted_by_id TEXT NOT NULL REFERENCES users(id),
      approval_status TEXT NOT NULL,
      reviewed_by TEXT,
      review_notes TEXT,
      reviewed_at TEXT,
      rating REAL NOT NULL DEFAULT 0,
      rating_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Only seed if tables are empty
  const userCount = db.select({ count: sql<number>`count(*)` }).from(users).get();
  if (userCount && userCount.count > 0) {
    console.log('Database already seeded, skipping.');
    return;
  }

  console.log('Seeding database...');

  const hashedPassword = bcryptjs.hashSync('password123', BCRYPT_COST);

  // Seed users
  db.insert(users).values([
    { id: 'user-admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin', password: hashedPassword, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
    { id: 'user-001', email: 'sarah.chen@example.com', firstName: 'Sarah', lastName: 'Chen', role: 'user', password: hashedPassword, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
    { id: 'user-002', email: 'mike.rodriguez@example.com', firstName: 'Mike', lastName: 'Rodriguez', role: 'user', password: hashedPassword, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
    { id: 'user-003', email: 'lisa.park@example.com', firstName: 'Lisa', lastName: 'Park', role: 'user', password: hashedPassword, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
    { id: 'user-004', email: 'james.wilson@example.com', firstName: 'James', lastName: 'Wilson', role: 'user', password: hashedPassword, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
    { id: 'user-005', email: 'emma.thompson@example.com', firstName: 'Emma', lastName: 'Thompson', role: 'user', password: hashedPassword, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
    { id: 'user-006', email: 'david.kim@example.com', firstName: 'David', lastName: 'Kim', role: 'user', password: hashedPassword, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
    { id: 'user-007', email: 'alex.rivera@example.com', firstName: 'Alex', lastName: 'Rivera', role: 'user', password: hashedPassword, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
    { id: 'user-008', email: 'rachel.foster@example.com', firstName: 'Rachel', lastName: 'Foster', role: 'user', password: hashedPassword, createdAt: '2025-01-10T00:00:00Z', updatedAt: '2025-01-10T00:00:00Z' },
  ]).run();

  // Seed use cases with pre-calculated metrics
  db.insert(useCases).values([
    {
      id: 'uc-001', title: 'Automated Code Review Comments',
      description: 'Enterprise-wide AI code review system that scans every pull request for bugs, security vulnerabilities, and performance issues. Deployed across all 50 engineers, it catches costly defects before they reach production.',
      whatWasBuilt: 'A GitHub Action integration that automatically runs Claude on every PR, generating structured review comments with severity levels. The bot posts inline comments directly on the diff and flags potential security issues.',
      keyLearnings: 'AI catches about 40% of the issues human reviewers find, but excels at security vulnerabilities and common bug patterns. The $120/use savings reflects average cost of defects caught early vs. in production. Best used as a first pass before human review.',
      metrics: JSON.stringify({ timeSavedPerUseMinutes: 45, moneySavedPerUse: 120, numberOfUsers: 50, usesPerUserPerPeriod: 5, frequencyPeriod: 'daily', timeSavedHours: 48750, moneySavedDollars: 7800000, dailyTimeSavedMinutes: 11250, dailyMoneySaved: 30000, weeklyTimeSavedMinutes: 56250, weeklyMoneySaved: 150000, monthlyTimeSavedHours: 4125, monthlyMoneySaved: 660000, annualTimeSavedHours: 48750, annualMoneySaved: 7800000 }),
      category: 'Code Review', aiTool: 'Copilot', department: 'Engineering', impact: 'high', effort: 'medium', status: 'active',
      tags: JSON.stringify(['code-review', 'automation', 'engineering']),
      submittedBy: 'Sarah Chen', submitterTeam: 'Engineering', submittedById: 'user-001', approvalStatus: 'approved',
      createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-20T14:30:00Z',
    },
    {
      id: 'uc-002', title: 'Marketing Copy Generation',
      description: 'Generate first drafts of marketing copy for email campaigns, social media posts, and landing pages. Marketing team reviews and edits for brand voice and accuracy.',
      whatWasBuilt: 'A prompt template library in Notion integrated with ChatGPT. Marketers fill in product details, target audience, and tone, then get draft copy for multiple channels simultaneously.',
      keyLearnings: 'The initial output needs about 30% editing for brand voice. Providing 3-4 examples of approved copy in the prompt dramatically improves quality. Social media posts need less editing than long-form content.',
      metrics: JSON.stringify({ timeSavedPerUseMinutes: 30, moneySavedPerUse: 15, numberOfUsers: 4, usesPerUserPerPeriod: 3, frequencyPeriod: 'weekly', timeSavedHours: 312, moneySavedDollars: 9360, dailyTimeSavedMinutes: 72, dailyMoneySaved: 36, weeklyTimeSavedMinutes: 360, weeklyMoneySaved: 180, monthlyTimeSavedHours: 26.4, monthlyMoneySaved: 792, annualTimeSavedHours: 312, annualMoneySaved: 9360 }),
      category: 'Content Creation', aiTool: 'ChatGPT', department: 'Marketing', impact: 'medium', effort: 'low', status: 'active',
      tags: JSON.stringify(['marketing', 'content', 'copywriting']),
      submittedBy: 'Mike Rodriguez', submitterTeam: 'Marketing', submittedById: 'user-002', approvalStatus: 'approved',
      createdAt: '2025-02-01T09:00:00Z', updatedAt: '2025-02-05T11:00:00Z',
    },
    {
      id: 'uc-003', title: 'Customer Support Ticket Classification',
      description: 'Automatically classify incoming support tickets by category, priority, and required expertise. Routes tickets to appropriate team members faster.',
      whatWasBuilt: 'A classification pipeline using Claude API that processes new Zendesk tickets. It tags tickets with category, priority, sentiment, and routes them to the right team queue automatically.',
      keyLearnings: 'Classification accuracy is 92% for category and 87% for priority. Edge cases around billing disputes needed additional prompt engineering. Adding customer history context improved routing accuracy by 15%.',
      metrics: JSON.stringify({ timeSavedPerUseMinutes: 3, moneySavedPerUse: 1.5, numberOfUsers: 5, usesPerUserPerPeriod: 40, frequencyPeriod: 'daily', timeSavedHours: 2600, moneySavedDollars: 78000, dailyTimeSavedMinutes: 600, dailyMoneySaved: 300, weeklyTimeSavedMinutes: 3000, weeklyMoneySaved: 1500, monthlyTimeSavedHours: 220, monthlyMoneySaved: 6600, annualTimeSavedHours: 2600, annualMoneySaved: 78000 }),
      category: 'Customer Support', aiTool: 'Claude', department: 'Operations', impact: 'high', effort: 'medium', status: 'pilot',
      tags: JSON.stringify(['support', 'classification', 'routing']),
      submittedBy: 'Lisa Park', submitterTeam: 'Customer Success', submittedById: 'user-003', approvalStatus: 'approved',
      createdAt: '2025-02-10T08:00:00Z', updatedAt: '2025-02-15T16:00:00Z',
    },
    {
      id: 'uc-004', title: 'Meeting Notes Summarization',
      description: 'Summarize meeting recordings and notes into actionable items, key decisions, and follow-ups. Distributed to all attendees automatically.',
      whatWasBuilt: 'A Slack bot that takes pasted meeting transcripts (from Otter.ai) and produces structured summaries with action items, owners, and deadlines. Posts directly to the relevant Slack channel.',
      keyLearnings: 'Structured output format (decisions, actions, questions) gets much better adoption than free-form summaries. Teams started writing better meeting notes because they knew AI would summarize them.',
      metrics: JSON.stringify({ timeSavedPerUseMinutes: 20, moneySavedPerUse: 8, numberOfUsers: 15, usesPerUserPerPeriod: 3, frequencyPeriod: 'weekly', timeSavedHours: 780, moneySavedDollars: 18720, dailyTimeSavedMinutes: 180, dailyMoneySaved: 72, weeklyTimeSavedMinutes: 900, weeklyMoneySaved: 360, monthlyTimeSavedHours: 66, monthlyMoneySaved: 1584, annualTimeSavedHours: 780, annualMoneySaved: 18720 }),
      category: 'Documentation', aiTool: 'Claude', department: 'Operations', impact: 'medium', effort: 'low', status: 'active',
      tags: JSON.stringify(['meetings', 'summarization', 'productivity']),
      submittedBy: 'James Wilson', submitterTeam: 'Engineering', submittedById: 'user-004', approvalStatus: 'approved',
      createdAt: '2025-03-01T10:00:00Z', updatedAt: '2025-03-05T12:00:00Z',
    },
    {
      id: 'uc-005', title: 'Sales Email Personalization',
      description: 'Generate personalized outreach emails based on prospect data, recent company news, and previous interactions. Sales reps review and customize before sending.',
      whatWasBuilt: 'A Chrome extension that pulls prospect info from LinkedIn and CRM, then generates personalized outreach emails. Integrates with Gmail for one-click drafting.',
      keyLearnings: 'Response rates increased 35% compared to generic templates. The key is feeding in specific company news and pain points. Emails over 150 words see diminishing returns on engagement.',
      metrics: JSON.stringify({ timeSavedPerUseMinutes: 20, moneySavedPerUse: 25, numberOfUsers: 8, usesPerUserPerPeriod: 10, frequencyPeriod: 'daily', timeSavedHours: 6933.333333333333, moneySavedDollars: 520000, dailyTimeSavedMinutes: 1600, dailyMoneySaved: 2000, weeklyTimeSavedMinutes: 8000, weeklyMoneySaved: 10000, monthlyTimeSavedHours: 586.6666666666666, monthlyMoneySaved: 44000, annualTimeSavedHours: 6933.333333333333, annualMoneySaved: 520000 }),
      category: 'Content Creation', aiTool: 'ChatGPT', department: 'Sales', impact: 'high', effort: 'low', status: 'active',
      tags: JSON.stringify(['sales', 'email', 'personalization']),
      submittedBy: 'Emma Thompson', submitterTeam: 'Sales', submittedById: 'user-005', approvalStatus: 'approved',
      createdAt: '2025-03-10T09:00:00Z', updatedAt: '2025-03-15T10:00:00Z',
    },
    {
      id: 'uc-006', title: 'Data Analysis Report Generation',
      description: 'Use AI to analyze datasets and generate narrative reports with insights, trends, and recommendations. Analysts verify findings before distribution.',
      whatWasBuilt: 'A Python notebook workflow where analysts upload CSV data, and Claude generates executive summary reports with visualizations suggestions, key findings, and actionable recommendations.',
      keyLearnings: 'AI-generated insights are most valuable for spotting anomalies humans might miss. Analysts still need to validate statistical significance. Providing context about what business questions matter improves report quality significantly.',
      metrics: JSON.stringify({ timeSavedPerUseMinutes: 45, moneySavedPerUse: 50, numberOfUsers: 6, usesPerUserPerPeriod: 8, frequencyPeriod: 'weekly', timeSavedHours: 1872, moneySavedDollars: 124800, dailyTimeSavedMinutes: 432, dailyMoneySaved: 480, weeklyTimeSavedMinutes: 2160, weeklyMoneySaved: 2400, monthlyTimeSavedHours: 158.4, monthlyMoneySaved: 10560, annualTimeSavedHours: 1872, annualMoneySaved: 124800 }),
      category: 'Data Analysis', aiTool: 'Claude', department: 'Product', impact: 'high', effort: 'high', status: 'pilot',
      tags: JSON.stringify(['data', 'analysis', 'reporting']),
      submittedBy: 'David Kim', submitterTeam: 'Analytics', submittedById: 'user-006', approvalStatus: 'approved',
      createdAt: '2025-03-20T08:00:00Z', updatedAt: '2025-03-25T14:00:00Z',
    },
    {
      id: 'uc-007', title: 'API Documentation Writer',
      description: 'Auto-generate API documentation from code comments and function signatures. Keeps docs in sync with code changes.',
      whatWasBuilt: 'A CI/CD step that runs on every merge to main, extracting function signatures and JSDoc comments to generate OpenAPI specs and human-readable docs via Copilot.',
      keyLearnings: 'Works best for RESTful APIs with consistent patterns. Complex business logic still needs hand-written explanations. Auto-generated examples save the most time for developers consuming the API.',
      metrics: JSON.stringify({ timeSavedPerUseMinutes: 25, moneySavedPerUse: 5, numberOfUsers: 6, usesPerUserPerPeriod: 4, frequencyPeriod: 'monthly', timeSavedHours: 118.18181818181819, moneySavedDollars: 1418.1818181818182, dailyTimeSavedMinutes: 27.272727272727273, dailyMoneySaved: 5.454545454545455, weeklyTimeSavedMinutes: 136.36363636363637, weeklyMoneySaved: 27.272727272727273, monthlyTimeSavedHours: 10, monthlyMoneySaved: 120, annualTimeSavedHours: 118.18181818181819, annualMoneySaved: 1418.1818181818182 }),
      category: 'Documentation', aiTool: 'Copilot', department: 'Engineering', impact: 'medium', effort: 'medium', status: 'active',
      tags: JSON.stringify(['documentation', 'api', 'automation']),
      submittedBy: 'Alex Rivera', submitterTeam: 'Engineering', submittedById: 'user-007', approvalStatus: 'approved',
      createdAt: '2025-04-01T10:00:00Z', updatedAt: '2025-04-10T10:00:00Z',
    },
    {
      id: 'uc-008', title: 'Competitive Research Assistant',
      description: 'AI-powered research assistant that monitors competitor activities, product launches, and market trends. Generates monthly briefing documents for leadership review.',
      whatWasBuilt: 'A monthly automated workflow that scrapes competitor blogs, press releases, and social media, then uses ChatGPT to synthesize a competitive intelligence brief with key takeaways.',
      keyLearnings: 'The AI is great at synthesizing large volumes of text into digestible summaries. However, it sometimes misinterprets competitive positioning. Having an analyst review the brief before distribution is essential. Low adoption limits the overall impact.',
      metrics: JSON.stringify({ timeSavedPerUseMinutes: 30, moneySavedPerUse: 5, numberOfUsers: 2, usesPerUserPerPeriod: 1, frequencyPeriod: 'monthly', timeSavedHours: 11.818181818181818, moneySavedDollars: 118.18181818181819, dailyTimeSavedMinutes: 2.727272727272727, dailyMoneySaved: 0.4545454545454546, weeklyTimeSavedMinutes: 13.636363636363637, weeklyMoneySaved: 2.272727272727273, monthlyTimeSavedHours: 1, monthlyMoneySaved: 10, annualTimeSavedHours: 11.818181818181818, annualMoneySaved: 118.18181818181819 }),
      category: 'Research', aiTool: 'ChatGPT', department: 'Product', impact: 'medium', effort: 'high', status: 'active',
      tags: JSON.stringify(['research', 'competitive-analysis', 'market']),
      submittedBy: 'Rachel Foster', submitterTeam: 'Strategy', submittedById: 'user-008', approvalStatus: 'approved',
      createdAt: '2025-04-05T09:00:00Z', updatedAt: '2025-04-12T09:00:00Z',
    },
  ]).run();

  // Seed prompts
  db.insert(prompts).values([
    {
      id: 'pr-001', title: 'Code Review Checklist Prompt',
      content: 'Review the following code and provide feedback on:\n1. Code style and consistency\n2. Potential bugs or edge cases\n3. Performance implications\n4. Security concerns\n5. Suggestions for improvement\n\nCode:\n```\n{paste code here}\n```\n\nProvide your review in a structured format with severity levels (critical, warning, suggestion).',
      description: 'Comprehensive code review prompt covering style, bugs, performance, and security.',
      problemBeingSolved: 'Manual code reviews are time-consuming and inconsistent. Reviewers often miss common patterns and style violations, leading to back-and-forth cycles.',
      effectivenessRating: 5, tips: 'Include the programming language and any project-specific style guide rules in the prompt for better results. Works best with functions under 100 lines.',
      category: 'Coding', aiTool: 'Claude', useCaseId: 'uc-001',
      tags: JSON.stringify(['code-review', 'engineering']),
      submittedBy: 'Sarah Chen', submittedById: 'user-001', approvalStatus: 'approved',
      rating: 4.5, ratingCount: 12,
      createdAt: '2025-01-16T10:00:00Z', updatedAt: '2025-01-20T14:00:00Z',
    },
    {
      id: 'pr-002', title: 'Email Campaign Copy Generator',
      content: 'Write a marketing email for {product/service} targeting {audience}.\n\nTone: {professional/casual/urgent}\nGoal: {awareness/conversion/retention}\nKey message: {main point}\n\nInclude:\n- Subject line (max 50 chars)\n- Preview text (max 100 chars)\n- Body (max 200 words)\n- Call to action\n\nBrand voice guidelines: {paste guidelines}',
      description: 'Template for generating marketing email copy with brand consistency.',
      problemBeingSolved: 'Writing personalized email campaigns from scratch takes hours per variant. Teams need multiple versions for A/B testing but lack bandwidth.',
      effectivenessRating: 4, tips: 'Always include 3-4 examples of previously approved emails in the prompt. Specify exact character limits for subject lines to avoid truncation in email clients.',
      category: 'Writing', aiTool: 'ChatGPT', useCaseId: 'uc-002',
      tags: JSON.stringify(['marketing', 'email', 'copywriting']),
      submittedBy: 'Mike Rodriguez', submittedById: 'user-002', approvalStatus: 'approved',
      rating: 4.2, ratingCount: 8,
      createdAt: '2025-02-02T09:00:00Z', updatedAt: '2025-02-05T11:00:00Z',
    },
    {
      id: 'pr-003', title: 'Support Ticket Classifier',
      content: 'Classify the following support ticket:\n\nTicket: "{ticket text}"\n\nProvide:\n1. Category: [billing, technical, feature-request, bug-report, account, other]\n2. Priority: [critical, high, medium, low]\n3. Sentiment: [positive, neutral, negative, urgent]\n4. Required expertise: [tier-1, tier-2, tier-3, specialist]\n5. Brief summary (1 sentence)\n\nRespond in JSON format.',
      description: 'Classifies support tickets by category, priority, and routing.',
      problemBeingSolved: 'Support managers spend 2+ hours daily manually triaging tickets. Misrouted tickets add 4-8 hours to resolution time.',
      effectivenessRating: 5, tips: 'Feed in recent examples of correctly classified tickets for few-shot learning. Update the category list as your product evolves. JSON output makes it easy to integrate with ticketing systems.',
      category: 'Analysis', aiTool: 'Claude', useCaseId: 'uc-003',
      tags: JSON.stringify(['support', 'classification']),
      submittedBy: 'Lisa Park', submittedById: 'user-003', approvalStatus: 'approved',
      rating: 4.8, ratingCount: 15,
      createdAt: '2025-02-11T08:00:00Z', updatedAt: '2025-02-15T16:00:00Z',
    },
    {
      id: 'pr-004', title: 'Meeting Notes Summarizer',
      content: 'Summarize the following meeting notes:\n\n{paste meeting notes}\n\nProvide:\n1. **Key Decisions** - List all decisions made\n2. **Action Items** - List each action item with owner and deadline\n3. **Discussion Points** - Brief summary of main topics discussed\n4. **Open Questions** - Any unresolved questions or follow-ups needed\n5. **Next Steps** - What happens next\n\nKeep the summary concise (max 300 words).',
      description: 'Transforms raw meeting notes into structured, actionable summaries.',
      problemBeingSolved: 'Meeting attendees waste time writing summaries, and the quality varies wildly. Action items get lost in long transcripts, leading to missed follow-ups.',
      effectivenessRating: 4, tips: 'Include the meeting agenda at the top of the notes for better context. If using a transcript, note who the speakers are. Ask for bullet points rather than paragraphs for faster scanning.',
      category: 'Summarization', aiTool: 'Claude', useCaseId: 'uc-004',
      tags: JSON.stringify(['meetings', 'summarization', 'productivity']),
      submittedBy: 'James Wilson', submittedById: 'user-004', approvalStatus: 'approved',
      rating: 4.6, ratingCount: 20,
      createdAt: '2025-03-02T10:00:00Z', updatedAt: '2025-03-05T12:00:00Z',
    },
    {
      id: 'pr-005', title: 'Sales Outreach Personalizer',
      content: 'Write a personalized sales outreach email.\n\nProspect info:\n- Name: {name}\n- Company: {company}\n- Role: {role}\n- Recent news: {news item}\n- Pain points: {pain points}\n\nOur product: {product description}\nValue proposition: {how we solve their pain}\n\nRequirements:\n- Keep under 150 words\n- Reference their specific situation\n- Include a clear, low-commitment CTA\n- Sound human, not salesy',
      description: 'Creates personalized cold outreach emails based on prospect research.',
      problemBeingSolved: 'Sales reps spend 20+ minutes per personalized email. Generic templates get ignored, but truly personalized outreach gets 3x response rates.',
      effectivenessRating: 4, tips: 'The more specific the prospect info, the better the output. Always include a recent news item or LinkedIn post to reference. Test different CTAs (meeting vs. resource share) for your industry.',
      category: 'Writing', aiTool: 'ChatGPT', useCaseId: 'uc-005',
      tags: JSON.stringify(['sales', 'email', 'personalization']),
      submittedBy: 'Emma Thompson', submittedById: 'user-005', approvalStatus: 'approved',
      rating: 4.3, ratingCount: 10,
      createdAt: '2025-03-11T09:00:00Z', updatedAt: '2025-03-15T10:00:00Z',
    },
    {
      id: 'pr-006', title: 'Data Insight Narrator',
      content: 'Analyze the following dataset summary and write a narrative report:\n\nData: {paste data or summary statistics}\n\nInclude:\n1. **Executive Summary** (2-3 sentences)\n2. **Key Findings** (top 3-5 insights)\n3. **Trends** (patterns over time)\n4. **Anomalies** (unexpected data points)\n5. **Recommendations** (actionable next steps)\n\nUse clear, non-technical language. Include specific numbers from the data.',
      description: 'Generates narrative reports from data analysis results.',
      problemBeingSolved: 'Translating raw data into executive-friendly narratives is a bottleneck. Analysts spend more time writing reports than doing analysis.',
      effectivenessRating: 3, tips: 'Provide context about what the business cares about measuring. Include comparison benchmarks if available. Ask for confidence levels on each insight to help analysts prioritize what to verify.',
      category: 'Analysis', aiTool: 'Claude', useCaseId: 'uc-006',
      tags: JSON.stringify(['data', 'analysis', 'reporting']),
      submittedBy: 'David Kim', submittedById: 'user-006', approvalStatus: 'approved',
      rating: 4.1, ratingCount: 6,
      createdAt: '2025-03-21T08:00:00Z', updatedAt: '2025-03-25T14:00:00Z',
    },
    {
      id: 'pr-007', title: 'Bug Report Analyzer',
      content: 'Analyze the following bug report and provide:\n\n1. **Root Cause Hypothesis** - Most likely cause based on the symptoms\n2. **Affected Components** - Which parts of the system are likely involved\n3. **Reproduction Steps** - Suggested steps to reproduce\n4. **Severity Assessment** - Critical/High/Medium/Low with justification\n5. **Suggested Fix** - High-level approach to resolving the issue\n\nBug Report:\n{paste bug report}\n\nSystem context: {describe the system architecture briefly}',
      description: 'Helps developers quickly triage and analyze bug reports by suggesting root causes and fixes.',
      problemBeingSolved: 'Junior developers struggle to triage bugs efficiently. Bug reports often lack context, leading to wasted investigation time.',
      effectivenessRating: 3, tips: 'Include relevant error logs and stack traces. The more system context you provide, the better the root cause hypothesis. Works best for application-level bugs rather than infrastructure issues.',
      category: 'Coding', aiTool: 'Claude', useCaseId: null,
      tags: JSON.stringify(['debugging', 'engineering', 'triage']),
      submittedBy: 'Alex Rivera', submittedById: 'user-007', approvalStatus: 'approved',
      rating: 3.9, ratingCount: 7,
      createdAt: '2025-04-02T10:00:00Z', updatedAt: '2025-04-08T10:00:00Z',
    },
    {
      id: 'pr-008', title: 'Product Requirements Drafter',
      content: 'Draft a product requirements document (PRD) for the following feature:\n\nFeature: {feature name}\nProblem: {what problem does it solve}\nTarget users: {who will use this}\nSuccess metrics: {how will we measure success}\n\nInclude sections:\n1. **Overview** - Problem statement and proposed solution\n2. **User Stories** - As a [user], I want [goal], so that [benefit]\n3. **Requirements** - Functional and non-functional requirements\n4. **Out of Scope** - What this does NOT include\n5. **Open Questions** - Decisions that still need to be made\n\nKeep it concise but thorough enough for engineering to estimate.',
      description: 'Generates structured PRDs from high-level feature descriptions.',
      problemBeingSolved: 'Product managers spend days writing PRDs from scratch. First drafts often miss edge cases that could be caught earlier with structured prompting.',
      effectivenessRating: 4, tips: 'Include competitor examples or existing similar features for context. The more specific your success metrics, the better the requirements. Review the "Out of Scope" section carefully to prevent scope creep.',
      category: 'Writing', aiTool: 'Claude', useCaseId: null,
      tags: JSON.stringify(['product', 'requirements', 'planning']),
      submittedBy: 'Rachel Foster', submittedById: 'user-008', approvalStatus: 'approved',
      rating: 4.4, ratingCount: 9,
      createdAt: '2025-04-06T09:00:00Z', updatedAt: '2025-04-10T09:00:00Z',
    },
  ]).run();

  console.log('Database seeded successfully.');
}
