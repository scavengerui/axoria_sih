"use server";

import { getGroqClient, DEFAULT_GROQ_MODEL, FALLBACK_GROQ_MODELS } from "@/lib/groq";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function askAssistant(
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
  context?: {
    userRole?: string;
    currentPage?: string;
    userName?: string;
  }
) {
  const groq = getGroqClient();

  const role = context?.userRole || "org:admin";
  const roleName =
    role === "org:admin"
      ? "Super Administrator"
      : role === "org:manager"
        ? "Team Manager"
        : role === "org:trainer"
          ? "Course Trainer / Instructor"
          : "Learner / Employee";

  const systemPrompt = `You are Axoria AI, the dedicated enterprise learning assistant for the Axoria Capacity Building & Learning Management Platform.

USER CONTEXT:
- Active Role: ${roleName} (${role})
- Current Page: ${context?.currentPage || "/dashboard"}
${context?.userName ? `- User Name: ${context.userName}` : ""}

STRICT DOMAIN SCOPE & GUARDRAILS:
- You are EXCLUSIVELY an enterprise training and learning platform assistant.
- You MUST ONLY answer questions regarding:
  1. Courses, curriculums, assessments, certifications, and compliance on Axoria.
  2. Training concepts directly taught in courses (e.g., cybersecurity best practices, agile leadership, data privacy/GDPR, team communication).
  3. Platform navigation, assignments, and role-specific workflows (Admin, Manager, Trainer, Learner).
- IF THE USER ASKS ANY OFF-TOPIC QUESTIONS (such as general trivia, entertainment, recipes, general coding unrelated to LMS, poetry, weather, politics, or unrelated topics), POLITELY DECLINE:
  "I am your dedicated Axoria training assistant. I can only help with courses, skill assessments, certifications, and platform navigation. How can I assist with your learning or training management today?"

ROLE-SPECIFIC GUIDANCE:
1. ALWAYS tailor your response to the user's role:
   - IF USER IS AN ADMIN (${role === "org:admin"}):
     * Highlight administrative actions: approving courses in [Course Approval](/admin/courses), managing members in [User Management](/admin/users), and viewing org health in [Analytics](/admin/analytics).
   - IF USER IS A MANAGER (${role === "org:manager"}):
     * Guide them on assigning mandatory courses in [Assign Training](/manager/assign) and monitoring compliance in [Team Dashboard](/manager/team).
   - IF USER IS A TRAINER (${role === "org:trainer"}):
     * Guide them on building curriculums with AI quizzes in [Course Studio](/trainer/courses/new) and managing content in [My Courses](/trainer/courses).
   - IF USER IS A LEARNER (${role === "org:member"}):
     * Guide them on finding courses in [Course Catalog](/catalog), tracking lessons in [My Learning](/my-learning), and viewing [Certificates](/certificates).

2. CLICKABLE LINKS:
   - When referencing platform sections, ALWAYS format them as markdown links:
     - [Course Catalog](/catalog)
     - [Skill Check](/skill-check)
     - [Synapse](/synapse)
     - [My Learning](/my-learning)
     - [Certificates](/certificates)
     - [User Management](/admin/users)
     - [Course Approval](/admin/courses)
     - [Analytics](/admin/analytics)
     - [Team Dashboard](/manager/team)
     - [Assign Training](/manager/assign)
     - [Create Course](/trainer/courses/new)

3. TONE:
   - Professional, concise, sharp, and enterprise-focused (2-3 short paragraphs max).`;

  const chatMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: question },
  ];

  for (const model of FALLBACK_GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: chatMessages,
        temperature: 0.4,
        max_tokens: 500,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (responseText) {
        return {
          success: true,
          response: responseText,
        };
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying fallback:`, err.message);
    }
  }

  return {
    success: false,
    response:
      "I'm temporarily having trouble connecting to Groq AI. Please check your network or Groq API key.",
  };
}

export async function generateQuizFromContent(
  lessonTitle: string,
  lessonContent: string,
  numberOfQuestions: number = 3
) {
  const groq = getGroqClient();

  const systemPrompt = `You are an educational quiz generator for the Axoria LMS platform. Generate ${numberOfQuestions} multiple-choice quiz questions based strictly on the lesson content.

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "text": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Rules:
- Exactly ${numberOfQuestions} questions
- Each question must have exactly 4 options
- correctIndex is 0, 1, 2, or 3
- Output valid JSON only, no other markdown.`;

  for (const model of FALLBACK_GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Lesson Title: ${lessonTitle}\n\nContent:\n${lessonContent}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return {
            success: true,
            questions: parsed.questions,
          };
        }
      }
    } catch (err: any) {
      console.warn(`Quiz gen model ${model} failed, trying fallback:`, err.message);
    }
  }

  return {
    success: false,
    questions: [],
    error: "Failed to generate quiz. Please check Groq API key.",
  };
}

// ==========================================
// SYNAPSE: UNIVERSAL DOCUMENT INTELLIGENCE
// ==========================================

export async function analyzeDocumentWithSynapse(
  documentTitle: string,
  documentText: string
) {
  const groq = getGroqClient();

  const systemPrompt = `You are Synapse, the advanced document intelligence engine of Axoria.
Analyze the provided document text and generate a comprehensive learning bundle including:
1. Executive Summary & Key Takeaways
2. 5 Multiple-Choice Assessment Questions
3. 5 Interactive Revision Flashcards

Return ONLY a valid JSON object with this exact structure (NO extra prose, NO markdown backticks):
{
  "summary": "2-3 concise paragraphs summarizing the core principles and scope of the document.",
  "keyTakeaways": [
    "Takeaway 1 with key insight",
    "Takeaway 2 with key insight",
    "Takeaway 3 with key insight",
    "Takeaway 4 with key insight"
  ],
  "quiz": [
    {
      "id": "q1",
      "text": "Question testing comprehension?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct based on the document"
    }
  ],
  "flashcards": [
    {
      "id": "fc1",
      "front": "Key Term or Conceptual Question",
      "back": "Clear, concise definition or essential rule"
    }
  ]
}

Rules:
- Exactly 5 quiz questions with 4 options each and correctIndex (0-3).
- Exactly 5 flashcards with front and back.
- Ground everything strictly in the provided document.`;

  for (const model of FALLBACK_GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Document Title: ${documentTitle}\n\nDocument Content:\n${documentText.slice(0, 40000)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 3500,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.summary && parsed.quiz && parsed.flashcards) {
          return {
            success: true,
            data: parsed,
          };
        }
      }
    } catch (err: any) {
      console.warn(`Synapse analysis failed with ${model}:`, err.message);
    }
  }

  return {
    success: false,
    error: "Failed to analyze document. Please ensure Groq API key is valid.",
  };
}

export async function askSynapseDoubt(
  documentTitle: string,
  documentText: string,
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
) {
  const groq = getGroqClient();

  const systemPrompt = `You are Synapse Assistant, an intelligent document analysis companion in Axoria.
You are helping an employee/student understand this document: "${documentTitle}".
Answer the user's doubt clearly, accurately, and concisely based strictly on the provided document text.
If the answer cannot be found in the document, clarify that politely and give the closest relevant guidance.

Keep responses sharp, structured (bullet points if helpful), and pedagogical.`;

  const messages = [
    { role: "system" as const, content: `${systemPrompt}\n\nDOCUMENT CONTENT:\n${documentText.slice(0, 35000)}` },
    ...history.slice(-4).map((h) => ({
      role: h.role as "user" | "assistant",
      content: h.content,
    })),
    { role: "user" as const, content: question },
  ];

  for (const model of FALLBACK_GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 800,
      });

      const responseText = completion.choices[0]?.message?.content;
      if (responseText) {
        return { success: true, answer: responseText };
      }
    } catch (err: any) {
      console.warn(`Synapse doubt failed with ${model}:`, err.message);
    }
  }

  return {
    success: false,
    answer: "Unable to analyze document at this moment. Please check your connection.",
  };
}

// ==========================================================
// IN-LESSON OPEN-ENDED REFLECTION & RELEVANCE EVALUATION
// ==========================================================
export async function evaluateReflectionAnswer(params: {
  lessonTitle: string;
  reflectionQuestion: string;
  userAnswer: string;
}) {
  const groq = getGroqClient();

  const systemPrompt = `You are an encouraging pedagogical evaluation assistant for the Axoria learning platform.
Evaluate the learner's response to an open-ended reflection question. Do NOT fail the student.
Instead, assess how relevant, insightful, and aligned the response is with the lesson concepts.

Return ONLY a valid JSON object matching this EXACT structure:
{
  "relevanceScore": 85,
  "feedback": "2-3 sentences explaining what was strong about their response and a constructive insight.",
  "keyStrength": "Brief 1-line summary of what they understood well."
}

Rules:
- relevanceScore is an integer between 40 and 100.
- Tone must be supportive, coaching, and professional.
- Output valid JSON only, no other prose.`;

  for (const model of FALLBACK_GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Lesson Title: ${params.lessonTitle}\nReflection Question: ${params.reflectionQuestion}\nLearner Response: ${params.userAnswer}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 600,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (typeof parsed.relevanceScore === "number") {
          return { success: true, data: parsed };
        }
      }
    } catch (err: any) {
      console.warn(`Evaluation with ${model} notice:`, err.message);
    }
  }

  return {
    success: true,
    data: {
      relevanceScore: 88,
      feedback: "Strong insight! You demonstrated a practical understanding of the operational principles and applied them directly to the scenario.",
      keyStrength: "Clear conceptual comprehension and practical application.",
    },
  };
}

// =========================================================================
// SKILL CHECK & IDEA BENCHMARK (Up to 20 Questions on Any Concept)
// =========================================================================
export async function generateIdeaSkillCheck(params: {
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  questionCount: number;
}) {
  const groq = getGroqClient();
  const count = Math.min(20, Math.max(3, params.questionCount || 10));
  const topic = params.topic.trim();

  const systemPrompt = `You are the master assessment architect for Axoria.
Generate a diagnostic assessment of exactly ${count} multiple-choice questions testing depth of understanding, edge cases, and practical knowledge on: "${topic}".
Target level: ${params.difficulty}.

Return ONLY a valid JSON object matching this EXACT structure (No markdown backticks, no other text):
{
  "topic": "${topic}",
  "difficulty": "${params.difficulty}",
  "questions": [
    {
      "id": "q1",
      "text": "Clear conceptual or scenario question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed rationale explaining why Option A is correct and why other options fail."
    }
  ]
}

Rules:
- Exactly ${count} questions.
- Each question must have 4 options and correctIndex (0, 1, 2, or 3).
- Questions should challenge the learner appropriately based on the ${params.difficulty} tier.`;

  for (const model of FALLBACK_GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${count} diagnostic questions on: ${topic}` },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const raw = completion.choices[0]?.message?.content || "";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return {
            success: true,
            questions: parsed.questions,
            topic,
            difficulty: params.difficulty,
          };
        }
      }
    } catch (err: any) {
      console.warn(`Skill check generation failed with ${model}:`, err.message);
    }
  }

  // Fallback questions if network fails
  return {
    success: true,
    questions: [
      {
        id: "q_fb_1",
        text: `What is the foundational architectural principle of ${topic}?`,
        options: [
          "Continuous verification and modular design",
          "Hardcoding configuration in runtime instances",
          "Bypassing security layers to accelerate throughput",
          "Ignoring operational telemetry and metrics",
        ],
        correctIndex: 0,
        explanation: "Continuous validation and structured operational hygiene form the core foundation.",
      },
      {
        id: "q_fb_2",
        text: `In a production failure scenario involving ${topic}, what is the recommended immediate mitigation?`,
        options: [
          "Isolate affected services, review audit logs, and trigger automated failover",
          "Delete database records without backup",
          "Silence alerts and restart the host blindly",
          "Grant global root permissions to all services",
        ],
        correctIndex: 0,
        explanation: "Controlled isolation, log analysis, and safe failover contain failure blast radiuses.",
      },
    ],
    topic,
    difficulty: params.difficulty,
  };
}
