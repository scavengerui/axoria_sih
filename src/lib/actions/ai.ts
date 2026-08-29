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
     * If they ask about taking courses, completing quizzes, or earning certificates, clearly clarify that as an Administrator, their primary role is managing the organization, approving courses, and tracking compliance—not enrolling in courses. Then provide the step-by-step of how learners in their organization do it.
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

  // Build full message thread for multi-turn conversational context
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
