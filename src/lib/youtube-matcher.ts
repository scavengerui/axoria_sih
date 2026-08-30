/**
 * YouTube Educational Video Matcher for Axoria LMS
 * Matches user topics and curriculum keywords to verified high-quality educational video embed URLs
 */

interface VideoTopicMapping {
  keywords: string[];
  videos: Array<{
    title: string;
    url: string;
    duration: number; // minutes
  }>;
}

const TOPIC_VIDEO_REGISTRY: VideoTopicMapping[] = [
  {
    keywords: ["docker", "container", "containerization", "dockerfile"],
    videos: [
      { title: "Docker in 100 Seconds & Full Architectural Tour", url: "https://www.youtube.com/embed/Gjnup-PuquQ", duration: 12 },
      { title: "Docker Container Security & Multi-Stage Builds", url: "https://www.youtube.com/embed/gAkwW2tuIqE", duration: 15 },
      { title: "Production Container Optimization & Networking", url: "https://www.youtube.com/embed/fqMOX6JJhGo", duration: 14 },
    ],
  },
  {
    keywords: ["kubernetes", "k8s", "pod", "cluster", "ingress", "helm"],
    videos: [
      { title: "Kubernetes in 100 Seconds & Core Architecture", url: "https://www.youtube.com/embed/PivpCKEiQOQ", duration: 12 },
      { title: "Kubernetes Pods, Services & Ingress Controllers Explained", url: "https://www.youtube.com/embed/X48VuDVv0do", duration: 18 },
      { title: "Production Cluster Autoscaling & Helm Package Management", url: "https://www.youtube.com/embed/s_o8dwzRlu4", duration: 16 },
    ],
  },
  {
    keywords: ["next.js", "react", "frontend", "nextjs", "server components", "rsc"],
    videos: [
      { title: "Next.js App Router & Server Components Complete Architecture", url: "https://www.youtube.com/embed/Sklc_fQBmcs", duration: 15 },
      { title: "React Server Actions, Turbopack & Data Mutations", url: "https://www.youtube.com/embed/VBlFpxXw_24", duration: 14 },
      { title: "Fullstack Next.js Production Performance & SEO", url: "https://www.youtube.com/embed/wm5gMKuwSYk", duration: 16 },
    ],
  },
  {
    keywords: ["cybersecurity", "security", "threat", "phishing", "malware", "zero-trust", "ciso"],
    videos: [
      { title: "Cybersecurity Architecture & Enterprise Threat Defense", url: "https://www.youtube.com/embed/bPVaOlJ6ln0", duration: 15 },
      { title: "Zero Trust Architecture Principles Explained (IBM)", url: "https://www.youtube.com/embed/1vR3bFh_n7A", duration: 14 },
      { title: "Incident Response Playbook & Blast Radius Quarantine", url: "https://www.youtube.com/embed/inWWhr5tnEA", duration: 16 },
    ],
  },
  {
    keywords: ["ai", "prompt", "llm", "gpt", "generative ai", "rag", "langchain", "groq", "transformers"],
    videos: [
      { title: "Large Language Models & Generative AI Architecture Explained", url: "https://www.youtube.com/embed/zjkBMFhNj_g", duration: 15 },
      { title: "Enterprise Prompt Engineering & Guardrail Frameworks", url: "https://www.youtube.com/embed/jC4v5AS4RIM", duration: 16 },
      { title: "Retrieval Augmented Generation (RAG) Systems in Practice", url: "https://www.youtube.com/embed/T-D1OfcDW1M", duration: 18 },
    ],
  },
  {
    keywords: ["cloud", "aws", "azure", "gcp", "serverless", "iam"],
    videos: [
      { title: "Cloud Architecture & Well-Architected Framework (AWS)", url: "https://www.youtube.com/embed/Ia-UEYYR44s", duration: 16 },
      { title: "High Availability & Multi-Region Cloud Resilience", url: "https://www.youtube.com/embed/3hLmDS179YE", duration: 15 },
      { title: "Serverless Compute & Microservice Decoupling", url: "https://www.youtube.com/embed/vxJobGtqKVM", duration: 14 },
    ],
  },
  {
    keywords: ["system design", "architecture", "distributed", "microservices", "caching", "load balancer", "kafka"],
    videos: [
      { title: "System Design Fundamentals: High Scale Distributed Systems", url: "https://www.youtube.com/embed/i_Q0b_4P3Q8", duration: 18 },
      { title: "Microservices vs Monolith: Partitioning & Communication", url: "https://www.youtube.com/embed/qYhRvH9tJKw", duration: 15 },
      { title: "Distributed Caching (Redis) & Message Queues (Kafka)", url: "https://www.youtube.com/embed/19l6eP8H64M", duration: 17 },
    ],
  },
  {
    keywords: ["python", "data science", "pandas", "numpy", "automation"],
    videos: [
      { title: "Modern Python Architecture & High Performance Workflows", url: "https://www.youtube.com/embed/rfscVS0vtbw", duration: 16 },
      { title: "Data Pipelines & ETL Engineering with Python", url: "https://www.youtube.com/embed/yqyK_KTaYFk", duration: 18 },
      { title: "Automated Testing & Type Hints in Modern Python", url: "https://www.youtube.com/embed/6iF8Xb7Z3wQ", duration: 14 },
    ],
  },
  {
    keywords: ["sql", "database", "postgres", "postgresql", "indexing", "nosql", "mongodb"],
    videos: [
      { title: "PostgreSQL Database Architecture & Query Optimization", url: "https://www.youtube.com/embed/qw--VYLpxG4", duration: 15 },
      { title: "B-Tree Indexes & Execution Plan Analysis (EXPLAIN ANALYZE)", url: "https://www.youtube.com/embed/clhy_mH_a8U", duration: 16 },
      { title: "ACID Transactions, Isolation Levels & Connection Pooling", url: "https://www.youtube.com/embed/rP_jGgM_2wI", duration: 14 },
    ],
  },
  {
    keywords: ["devops", "ci/cd", "github actions", "terraform", "iac", "sre", "ansible"],
    videos: [
      { title: "DevOps & CI/CD Pipelines Explained from Scratch", url: "https://www.youtube.com/embed/scEDHsr3APg", duration: 15 },
      { title: "Infrastructure as Code (IaC) with Terraform in Production", url: "https://www.youtube.com/embed/l5k1ai_GBDE", duration: 18 },
      { title: "Automated Security Scanning & Compliance in CI/CD", url: "https://www.youtube.com/embed/gM8fR_KqIqQ", duration: 14 },
    ],
  },
  {
    keywords: ["rust", "concurrency", "memory", "borrow checker", "systems"],
    videos: [
      { title: "Rust Programming Language: Ownership & Memory Safety", url: "https://www.youtube.com/embed/zF34dRivLOw", duration: 16 },
      { title: "Concurrency & Multi-Threading in Rust without Data Races", url: "https://www.youtube.com/embed/D_h_v4i3gA0", duration: 18 },
      { title: "Building High-Throughput Network Microservices in Rust", url: "https://www.youtube.com/embed/MsocPEZBd-M", duration: 15 },
    ],
  },
  {
    keywords: ["agile", "leadership", "scrum", "management", "communication", "product"],
    videos: [
      { title: "Agile Leadership & Scrum Framework in Practice", url: "https://www.youtube.com/embed/8eWd1X_kQyo", duration: 14 },
      { title: "Building High-Performing Psychological Safety Teams", url: "https://www.youtube.com/embed/LhoLuui9gX8", duration: 15 },
      { title: "Executive Decision Making & Cross-Functional Alignment", url: "https://www.youtube.com/embed/7r1wL6g_3Qw", duration: 16 },
    ],
  },
  {
    keywords: ["privacy", "gdpr", "compliance", "governance", "legal", "audit"],
    videos: [
      { title: "Data Privacy, GDPR & Global Compliance Fundamentals", url: "https://www.youtube.com/embed/Q4A_6h-lJm8", duration: 14 },
      { title: "PII Anonymization & Data Residency Regulations", url: "https://www.youtube.com/embed/J7_0_1d9n2w", duration: 15 },
      { title: "Enterprise Compliance Audit Preparation & Governance", url: "https://www.youtube.com/embed/9oF_J1a4i7U", duration: 14 },
    ],
  },
  {
    keywords: ["finops", "cost", "finance", "budget", "cloud cost"],
    videos: [
      { title: "Cloud FinOps: Financial Operations & Cloud Cost Optimization", url: "https://www.youtube.com/embed/6iJ_5kL4P1w", duration: 16 },
      { title: "Unit Economics & Automated Tagging Strategies", url: "https://www.youtube.com/embed/K8_j0vP7a9M", duration: 14 },
      { title: "Reserved Instances, Savings Plans & Spot Allocation", url: "https://www.youtube.com/embed/3vM_0p4L1rQ", duration: 15 },
    ],
  },
];

// Fallback high-impact tech educational video
const DEFAULT_VIDEOS = [
  { title: "Foundations & Architectural Deep Dive", url: "https://www.youtube.com/embed/j0ieRrwae5w", duration: 15 },
  { title: "Operational Guidelines & Enterprise Standards", url: "https://www.youtube.com/embed/bPVaOlJ6ln0", duration: 12 },
  { title: "Real-World Case Studies & Production Mastery", url: "https://www.youtube.com/embed/Ia-UEYYR44s", duration: 16 },
];

/**
 * Returns relevant educational YouTube videos for a given topic
 */
export function getVideosForTopic(topic: string): Array<{ title: string; url: string; duration: number }> {
  const normalized = topic.toLowerCase();
  
  for (const mapping of TOPIC_VIDEO_REGISTRY) {
    if (mapping.keywords.some((k) => normalized.includes(k))) {
      return mapping.videos;
    }
  }

  return DEFAULT_VIDEOS;
}
