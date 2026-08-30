export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonItem {
  id: string;
  title: string;
  type: "video" | "pdf" | "article";
  duration: string;
  videoUrl?: string;
  articleContent?: string;
  diagram?: string;
  reflectionQuestion?: string;
  pdfUrl?: string;
  hasQuiz?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  stats: {
    duration: string;
    enrolled: number;
    rating: number;
  };
  tags: string[];
  isMandatory: boolean;
  modules: CourseModule[];
  quiz: {
    title: string;
    questions: QuizQuestion[];
  };
  flashcards?: Array<{
    id: string;
    front: string;
    back: string;
  }>;
}

export const COURSES_DATABASE: Record<string, CourseDetail> = {
  // 1. Cybersecurity
  "1": {
    id: "1",
    title: "Enterprise Information Security & Threat Defense",
    description: "Master threat detection, zero-trust authentication, credential hygiene, and incident reporting for enterprise compliance. Learn to identify advanced phishing vectors, configure MFA, and isolate compromised hosts.",
    instructor: { name: "Dr. Raghavan Sundaram", role: "Chief Information Security Officer & Principal Instructor", avatar: "RS" },
    stats: { duration: "2h 00m", enrolled: 24, rating: 4.9 },
    tags: ["Cybersecurity", "Zero-Trust", "Compliance"],
    isMandatory: true,
    modules: [
      {
        id: "m1",
        title: "Module 1: Threat Landscape & Zero-Trust Principles",
        lessons: [
          {
            id: "l1_1",
            title: "Threat Landscape & Cybersecurity Foundations",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/bPVaOlJ6ln0",
            diagram: "Attack Vector ---> Perimeter Gate ---> MFA Challenge ---> Verified Access",
            reflectionQuestion: "How would you identify and respond to an MFA fatigue attack in your team?",
            articleContent: "Cyber threats evolve from basic credential theft to sophisticated social engineering. Organizations must enforce least-privilege access and hardware security keys across all internal systems.",
          },
          {
            id: "l1_2",
            title: "MFA & Password Hygiene Guidelines",
            type: "article",
            duration: "12m",
            videoUrl: "https://www.youtube.com/embed/1vR3bFh_n7A",
            diagram: "User Request ---> Context Evaluation (IP, Device, Geolocation) ---> Session Token",
            reflectionQuestion: "Why is passphrase length more effective than symbol complexity against modern cracking tools?",
            articleContent: "Enforce multi-factor authentication (MFA) on all production endpoints. Use password managers with 16+ character passphrases to mitigate dictionary and rainbow table attacks.",
          },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Zero-Trust Architecture & Incident Containment",
        lessons: [
          {
            id: "l1_3",
            title: "Microsegmentation & Blast-Radius Containment",
            type: "article",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/inWWhr5tnEA",
            diagram: "Compromised Host ---> Automated VLAN Isolation ---> Forensic Capture ---> Remediation",
            reflectionQuestion: "What immediate steps should an engineer take when anomalous lateral network traffic is detected?",
            articleContent: "Microsegmentation restricts lateral movement between internal servers. In case of breach, isolate the container or virtual machine while preserving memory snapshots for forensic review.",
          },
        ],
      },
    ],
    quiz: {
      title: "Enterprise Information Security Certification Exam",
      questions: [
        { id: "q1", text: "What is the primary principle of Zero-Trust architecture?", options: ["Never trust, always verify", "Trust all internal network devices", "Disable MFA for internal users", "Rely exclusively on perimeter firewalls"], correctIndex: 0, explanation: "Zero-Trust assumes breach and verifies every request regardless of source." },
        { id: "q2", text: "How should an employee respond to an unexpected MFA push notification?", options: ["Approve it to clear the notification", "Deny immediately and notify IT Security", "Ignore it and wait for it to expire", "Change Wi-Fi network"], correctIndex: 1, explanation: "Unsolicited MFA prompts indicate compromised credentials under an MFA fatigue attack." },
        { id: "q3", text: "What is the purpose of microsegmentation in cloud networks?", options: ["Increase internet download speed", "Contain lateral movement during a breach", "Disable load balancing", "Reduce server disk usage"], correctIndex: 1, explanation: "Microsegmentation confines compromised workloads to their isolated subnet." },
        { id: "q4", text: "Which authentication factor is most resilient against real-time phishing?", options: ["SMS One-Time Passwords", "Hardware FIDO2 / WebAuthn Security Keys", "Security Question Answers", "Static PIN numbers"], correctIndex: 1, explanation: "FIDO2 keys bind authentication to the cryptographic origin, preventing relay attacks." },
        { id: "q5", text: "When an active host compromise is suspected, what is the first operational step?", options: ["Shut down and reformat the server immediately", "Isolate the host from the network while preserving RAM", "Delete server audit logs", "Email all company employees"], correctIndex: 1, explanation: "Network isolation stops lateral spread while volatile RAM preserves forensic evidence." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Zero-Trust?", back: "A security framework requiring continuous authentication and authorization for every request." },
      { id: "fc2", front: "What is Blast-Radius Containment?", back: "Limiting the scope of damage a breach can cause through isolation and segmentation." },
      { id: "fc3", front: "What is FIDO2 / WebAuthn?", back: "Phishing-resistant hardware key authentication using public-key cryptography." },
    ],
  },

  // 2. Agile Leadership
  "2": {
    id: "2",
    title: "Agile Leadership & Cross-Functional Team Management",
    description: "Develop executive leadership capabilities, facilitate sprint retrospectives, and lead distributed teams with high psychological safety and outcome-focused velocity.",
    instructor: { name: "Prof. Sunita Deshmukh", role: "Agile Coach & Organizational Psychologist", avatar: "SD" },
    stats: { duration: "1h 45m", enrolled: 38, rating: 4.8 },
    tags: ["Leadership", "Agile", "Management"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Agile Mindset & Servant Leadership",
        lessons: [
          {
            id: "l2_1",
            title: "Agile Methodology & Scrum in Practice",
            type: "video",
            duration: "14m",
            videoUrl: "https://www.youtube.com/embed/8eWd1X_kQyo",
            diagram: "Product Backlog ---> Sprint Planning ---> Daily Standup ---> Sprint Review & Retro",
            reflectionQuestion: "How do you transition a team from measuring output (tickets closed) to measuring business outcomes?",
            articleContent: "Agile leadership prioritizes empowering self-organizing teams over command-and-control hierarchy. Sprints focus on delivering validated customer value incrementally.",
          },
          {
            id: "l2_2",
            title: "Building Psychological Safety in Agile Teams",
            type: "article",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/LhoLuui9gX8",
            diagram: "Vulnerability & Candor ---> Safe Failure Environment ---> Rapid Innovation Cycle",
            reflectionQuestion: "What is one specific question you ask in retrospectives to uncover root causes without assigning personal blame?",
            articleContent: "Psychological safety allows engineers to raise blockers, admit mistakes, and propose ambitious experiments without fear of retribution.",
          },
        ],
      },
    ],
    quiz: {
      title: "Agile Leadership Capstone Exam",
      questions: [
        { id: "q1", text: "What is the primary role of a Scrum Master?", options: ["Assign daily tasks to developers", "Serve as a facilitator and remove team impediments", "Write all technical code", "Control company budgets"], correctIndex: 1, explanation: "Scrum Masters act as servant leaders who facilitate ceremonies and unblock teams." },
        { id: "q2", text: "What defines psychological safety in high-performing teams?", options: ["Never giving critical feedback", "A shared belief that the team is safe for interpersonal risk-taking", "Allowing poor code quality", "Eliminating all project deadlines"], correctIndex: 1, explanation: "Psychological safety allows engineers to voice concerns and experiment openly." },
        { id: "q3", text: "What is the goal of a Sprint Retrospective?", options: ["Assign blame for missed deadlines", "Inspect team processes and commit to continuous improvement", "Present finished features to customers", "Create salary reviews"], correctIndex: 1, explanation: "Retrospectives focus on process optimization and actionable team improvements." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Servant Leadership?", back: "A leadership philosophy where the main goal is to enrich and empower the team." },
      { id: "fc2", front: "What is Sprint Velocity?", back: "The amount of work a team completes during a typical sprint cycle." },
    ],
  },

  // 3. Data Privacy & GDPR
  "3": {
    id: "3",
    title: "Data Privacy, GDPR & Governance Compliance",
    description: "Understand data residency regulations, PII anonymization techniques, and compliance audit preparation across global jurisdictions.",
    instructor: { name: "Dr. Ananya Sengupta", role: "Principal Data Governance Counsel", avatar: "AS" },
    stats: { duration: "1h 30m", enrolled: 19, rating: 4.7 },
    tags: ["Data Privacy", "Governance", "Legal Compliance"],
    isMandatory: true,
    modules: [
      {
        id: "m1",
        title: "Module 1: GDPR Principles & Lawful Processing",
        lessons: [
          {
            id: "l3_1",
            title: "GDPR Core Tenets & Data Rights",
            type: "video",
            duration: "14m",
            videoUrl: "https://www.youtube.com/embed/Q4A_6h-lJm8",
            diagram: "User Data Ingestion ---> Consent Verification ---> Purpose Limitation Gate ---> Right to Erasure",
            reflectionQuestion: "How does your engineering architecture handle a 'Right to be Forgotten' deletion request across replicas?",
            articleContent: "GDPR mandates strict purpose limitation, data minimization, and explicit consent mechanisms for processing Personally Identifiable Information (PII).",
          },
          {
            id: "l3_2",
            title: "Data Masking & PII Redaction in Production Logs",
            type: "article",
            duration: "12m",
            videoUrl: "https://www.youtube.com/embed/J7_0_1d9n2w",
            diagram: "Application Logs ---> Regex Redaction Filter (SSN, Email, Card) ---> Centralized SIEM",
            reflectionQuestion: "What automated tooling can you place in your CI/CD pipeline to prevent PII leaks in telemetry?",
            articleContent: "Never log plaintext passwords, credit card numbers, or medical records. Implement automated redaction filters before log ingestion.",
          },
        ],
      },
    ],
    quiz: {
      title: "Data Privacy & GDPR Certification Exam",
      questions: [
        { id: "q1", text: "Under GDPR, what is the maximum notification window for a data breach to authorities?", options: ["24 hours", "72 hours", "30 days", "1 year"], correctIndex: 1, explanation: "GDPR Article 33 requires notification within 72 hours of becoming aware of the breach." },
        { id: "q2", text: "What is data minimization?", options: ["Storing data on smaller hard drives", "Collecting only the data strictly necessary for specified purposes", "Deleting all backups daily", "Compressing files with zip"], correctIndex: 1, explanation: "Data minimization limits collection to what is directly required for business operation." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is PII?", back: "Personally Identifiable Information that can directly or indirectly identify an individual." },
      { id: "fc2", front: "What is Data Residency?", back: "Legal requirements that data must be stored and processed within specific geographical borders." },
    ],
  },

  // 4. Docker Containerization
  "4": {
    id: "4",
    title: "Docker Containerization & Zero-Trust Security",
    description: "Master multi-stage Dockerfiles, non-root user execution, image vulnerability scanning with Trivy, and container network isolation in production.",
    instructor: { name: "Vikram Malhotra", role: "Principal Cloud Native Architect", avatar: "VM" },
    stats: { duration: "2h 15m", enrolled: 42, rating: 4.9 },
    tags: ["Docker", "DevOps", "Containers", "Security"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Multi-Stage Builds & Minimal Base Images",
        lessons: [
          {
            id: "l4_1",
            title: "Docker Architecture & Multi-Stage Optimization",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/Gjnup-PuquQ",
            diagram: "Build Stage (SDK + Compiler) ---> Binary Artifact ---> Final Stage (Distroless / Alpine)",
            reflectionQuestion: "Why should development dependencies and compilers never be present in a production Docker container?",
            articleContent: "Multi-stage Dockerfiles allow separating compilation tools from runtime environments, shrinking image sizes from 1GB to <50MB and eliminating security attack surface.",
          },
          {
            id: "l4_2",
            title: "Container Security & Non-Root Enforcement",
            type: "article",
            duration: "14m",
            videoUrl: "https://www.youtube.com/embed/gAkwW2tuIqE",
            diagram: "Dockerfile ---> USER appuser ---> Read-Only Root Filesystem ---> Dropped Linux Capabilities",
            reflectionQuestion: "What risk does running containers as default root introduce on a shared Linux host?",
            articleContent: "Always create a dedicated non-privileged user inside your container and drop unnecessary Linux capabilities (CAP_DROP_ALL).",
          },
        ],
      },
    ],
    quiz: {
      title: "Docker Security & Container Architecture Exam",
      questions: [
        { id: "q1", text: "Why are multi-stage builds recommended for production Docker images?", options: ["They make images run faster on CPU", "They keep compilation tools out of the final runtime image", "They remove the need for Linux kernels", "They bypass container scanning"], correctIndex: 1, explanation: "Multi-stage builds eliminate build tools from production images, minimizing attack surface." },
        { id: "q2", text: "Why should containers avoid running as root user (UID 0)?", options: ["Root users use more memory", "Root in container can facilitate host privilege escalation if escaped", "Root is not supported by Docker", "Root slows down networking"], correctIndex: 1, explanation: "Running as non-root mitigates the impact of container breakout vulnerabilities." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Distroless?", back: "A minimal container image containing only your application and runtime dependencies, with no shell or package manager." },
      { id: "fc2", front: "What is Trivy?", back: "A comprehensive vulnerability and misconfiguration scanner for container images." },
    ],
  },

  // 5. Kubernetes Orchestration
  "5": {
    id: "5",
    title: "Kubernetes Orchestration & Production Deployment",
    description: "Architect self-healing Kubernetes clusters, manage Horizontal Pod Autoscaling (HPA), configure ingress controllers, and enforce network policies.",
    instructor: { name: "Elena Rostova", role: "Senior SRE & Kubernetes Maintainer", avatar: "ER" },
    stats: { duration: "2h 45m", enrolled: 56, rating: 4.9 },
    tags: ["Kubernetes", "Cloud Native", "DevOps", "SRE"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Pod Lifecycle & Ingress Architecture",
        lessons: [
          {
            id: "l5_1",
            title: "Kubernetes Core Architecture & Pod Lifecycle",
            type: "video",
            duration: "18m",
            videoUrl: "https://www.youtube.com/embed/PivpCKEiQOQ",
            diagram: "API Server ---> etcd ---> Kubelet ---> Container Runtime ---> Pod Running",
            reflectionQuestion: "How do liveness and readiness probes differ during a rolling deployment?",
            articleContent: "Kubernetes abstracts infrastructure through declarative YAML specifications. The control plane constantly reconciles actual state against desired state.",
          },
          {
            id: "l5_2",
            title: "Ingress Controllers & Service Mesh Routing",
            type: "article",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/X48VuDVv0do",
            diagram: "External Traffic ---> Ingress Controller (TLS Termination) ---> ClusterIP Service ---> Pods",
            reflectionQuestion: "When would you choose a Service Mesh like Istio over basic Ingress routing?",
            articleContent: "Ingress controllers provide reverse proxying and SSL termination, while NetworkPolicies enforce firewall rules between namespace pods.",
          },
        ],
      },
    ],
    quiz: {
      title: "Kubernetes Production Engineering Exam",
      questions: [
        { id: "q1", text: "What is the function of a Kubernetes Readiness Probe?", options: ["Checks if pod should be rebooted", "Determines if pod should receive network traffic from service", "Measures pod CPU temperature", "Backs up pod data to disk"], correctIndex: 1, explanation: "Readiness probes tell Kubernetes when a container is ready to accept incoming user traffic." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is HPA?", back: "Horizontal Pod Autoscaler automatically scales pod replicas based on observed CPU/memory metrics." },
    ],
  },

  // 6. Next.js 15 & RSC
  "6": {
    id: "6",
    title: "Next.js 15 & React Server Components Architecture",
    description: "Build ultra-fast web applications using React Server Components, Server Actions, partial prerendering, Turbopack, and streaming SSR.",
    instructor: { name: "Alex Rivers", role: "Fullstack Architecture Lead", avatar: "AR" },
    stats: { duration: "2h 30m", enrolled: 63, rating: 4.9 },
    tags: ["Next.js", "React", "Fullstack", "Web Dev"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Server Components & Streaming SSR",
        lessons: [
          {
            id: "l6_1",
            title: "React Server Components (RSC) Deep Dive",
            type: "video",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/Sklc_fQBmcs",
            diagram: "Client Browser ---> Server Component (Zero JS Bundle) ---> Suspense Boundary ---> Streamed HTML",
            reflectionQuestion: "Why do React Server Components result in zero client-side JavaScript bundle weight?",
            articleContent: "RSCs execute solely on the server, accessing databases directly without passing secrets to the browser, and stream UI asynchronously via React Suspense.",
          },
          {
            id: "l6_2",
            title: "Server Actions & Optimistic UI Updates",
            type: "article",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/VBlFpxXw_24",
            diagram: "User Form Submit ---> Server Action Mutation ---> RevalidatePath Cache ---> Instant UI Sync",
            reflectionQuestion: "How do Server Actions eliminate the need for boilerplate REST API endpoints for mutations?",
            articleContent: "Server Actions provide end-to-end type safety for data mutations, automatically handling CSRF tokens and cache invalidation.",
          },
        ],
      },
    ],
    quiz: {
      title: "Next.js 15 Fullstack Architecture Exam",
      questions: [
        { id: "q1", text: "What is the primary advantage of React Server Components over standard client components?", options: ["They can use useState directly", "They reduce client-side bundle size and access server resources securely", "They only run in Chrome", "They eliminate CSS files"], correctIndex: 1, explanation: "RSCs run on the server, eliminating heavy component libraries from the browser's JavaScript payload." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Turbopack?", back: "The Rust-based incremental bundler optimized for instantaneous Next.js local builds." },
    ],
  },

  // 7. Generative AI & Prompt Engineering
  "7": {
    id: "7",
    title: "Generative AI & LLM Prompt Engineering for Enterprise",
    description: "Design robust prompt pipelines, implement semantic search with vector embeddings, build RAG systems, and enforce safety guardrails on LLMs.",
    instructor: { name: "Dr. Marcus Vance", role: "AI Research Scientist & LLM Architect", avatar: "MV" },
    stats: { duration: "2h 00m", enrolled: 71, rating: 5.0 },
    tags: ["Artificial Intelligence", "LLM", "Prompt Engineering", "Groq"],
    isMandatory: true,
    modules: [
      {
        id: "m1",
        title: "Module 1: LLM Mechanics & Structured Prompt Design",
        lessons: [
          {
            id: "l7_1",
            title: "Transformer Architecture & Token Generation",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/zjkBMFhNj_g",
            diagram: "Raw Text ---> Tokenizer ---> Attention Heads ---> Probability Distribution ---> Output Token",
            reflectionQuestion: "How does few-shot prompting guide an LLM to follow strict JSON schemas consistently?",
            articleContent: "Understanding context windows, temperature settings, and attention mechanisms allows engineers to eliminate hallucination and extract deterministic JSON.",
          },
          {
            id: "l7_2",
            title: "Retrieval-Augmented Generation (RAG) Architecture",
            type: "article",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/T-D1OfcDW1M",
            diagram: "User Query ---> Vector Search (Cosine Similarity) ---> Context Injection ---> Grounded Response",
            reflectionQuestion: "What chunking strategy prevents context fragmentation in enterprise RAG pipelines?",
            articleContent: "RAG connects proprietary enterprise knowledge bases to LLMs by retrieving high-relevance semantic chunks before invoking inference.",
          },
        ],
      },
    ],
    quiz: {
      title: "Enterprise Generative AI & Prompt Engineering Exam",
      questions: [
        { id: "q1", text: "What is the primary role of Retrieval-Augmented Generation (RAG)?", options: ["Increase the model parameter count", "Ground LLM generation in external, verified factual documents", "Translate code to binary", "Speed up internet Wi-Fi"], correctIndex: 1, explanation: "RAG retrieves domain-specific factual documents to ground the LLM and eliminate hallucinations." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Cosine Similarity?", back: "A metric measuring the semantic distance between high-dimensional vector embeddings." },
    ],
  },

  // 8. System Design
  "8": {
    id: "8",
    title: "System Design & Distributed Microservices Architecture",
    description: "Architect systems for 100M+ users. Master horizontal scaling, event-driven messaging with Kafka, distributed caching with Redis, and CAP theorem trade-offs.",
    instructor: { name: "Gaurav Sen", role: "Distinguished Distributed Systems Engineer", avatar: "GS" },
    stats: { duration: "3h 15m", enrolled: 89, rating: 4.9 },
    tags: ["System Design", "Microservices", "Architecture", "Kafka"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Scalability, Caching & Event Steaming",
        lessons: [
          {
            id: "l8_1",
            title: "High-Scale Distributed Architecture Fundamentals",
            type: "video",
            duration: "18m",
            videoUrl: "https://www.youtube.com/embed/i_Q0b_4P3Q8",
            diagram: "Client Traffic ---> Anycast DNS ---> Load Balancers ---> Stateless Services ---> DB Shards",
            reflectionQuestion: "How do you resolve cache stampedes when high-traffic Redis keys expire?",
            articleContent: "Distributed system scalability requires stateless application servers, write-through caching, and asynchronous event processing via durable message brokers.",
          },
        ],
      },
    ],
    quiz: {
      title: "System Design & Distributed Architecture Exam",
      questions: [
        { id: "q1", text: "According to the CAP theorem, what trade-off must a distributed system make during a network partition?", options: ["Choose between Consistency and Availability", "Choose between Speed and Disk Size", "Choose between CPU and RAM", "No trade-off is necessary"], correctIndex: 0, explanation: "During a partition (P), a distributed system must choose between Consistency (C) or Availability (A)." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Write-Through Caching?", back: "Data is written simultaneously to the cache and the permanent database store." },
    ],
  },

  // 9. AWS Cloud Architecture
  "9": {
    id: "9",
    title: "Cloud Architecture on AWS & Well-Architected Framework",
    description: "Design secure, resilient, high-performing, and cost-optimized enterprise cloud infrastructures following official AWS Well-Architected principles.",
    instructor: { name: "David K. Miller", role: "AWS Certified Solutions Architect Fellow", avatar: "DM" },
    stats: { duration: "2h 30m", enrolled: 45, rating: 4.8 },
    tags: ["Cloud Computing", "AWS", "Architecture", "DevOps"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: High Availability & Multi-AZ Resilience",
        lessons: [
          {
            id: "l9_1",
            title: "AWS Well-Architected Framework Pillars",
            type: "video",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/Ia-UEYYR44s",
            diagram: "VPC (Public / Private Subnets) ---> Auto Scaling Group (Multi-AZ) ---> Aurora Multi-Master",
            reflectionQuestion: "How does Multi-AZ deployment prevent downtime during physical data center outages?",
            articleContent: "The AWS Well-Architected Framework consists of 6 pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.",
          },
        ],
      },
    ],
    quiz: {
      title: "AWS Cloud Architecture Exam",
      questions: [
        { id: "q1", text: "What is the primary benefit of deploying database replicas across multiple Availability Zones (Multi-AZ)?", options: ["Automated failover and disaster resilience", "Faster write performance", "Lower AWS billing cost", "Eliminates database tables"], correctIndex: 0, explanation: "Multi-AZ provides synchronous replication and automatic failover in case of zone failure." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is an IAM Role?", back: "An identity with permission policies that determine what actions a cloud resource can perform." },
    ],
  },

  // 10. Python for Data Engineering
  "10": {
    id: "10",
    title: "Modern Python for Data Engineering & Automation",
    description: "Master asynchronous Python, type annotations, high-throughput Pandas/Polars pipelines, and automated ETL workflows for big data infrastructure.",
    instructor: { name: "Priya Sundaram", role: "Lead Data Platform Engineer", avatar: "PS" },
    stats: { duration: "2h 10m", enrolled: 52, rating: 4.9 },
    tags: ["Python", "Data Engineering", "Automation", "ETL"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: High-Performance Data Pipelines",
        lessons: [
          {
            id: "l10_1",
            title: "Modern Python Architecture & Asyncio Workflows",
            type: "video",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/rfscVS0vtbw",
            diagram: "Data Source (API / Stream) ---> Async Event Loop ---> Polars Dataframe ---> Parquet Storage",
            reflectionQuestion: "Why does Polars achieve 10x-50x speedups over Pandas on multi-core CPUs?",
            articleContent: "Modern Python leverages static typing (mypy), asynchronous I/O (asyncio), and Arrow-backed columnar engines (Polars) to process massive datasets in memory.",
          },
        ],
      },
    ],
    quiz: {
      title: "Modern Python Data Engineering Exam",
      questions: [
        { id: "q1", text: "What is the primary advantage of columnar storage formats like Apache Parquet in data lakes?", options: ["High compression ratios and faster column scan speeds", "Easier to edit in Notepad", "Smaller CPU memory chips", "Eliminates SQL syntax"], correctIndex: 0, explanation: "Columnar formats only read the requested columns, drastically reducing disk I/O." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Asyncio?", back: "Python library for writing concurrent code using the async/await syntax." },
    ],
  },

  // 11. DevSecOps Pipeline
  "11": {
    id: "11",
    title: "DevSecOps Pipeline: CI/CD & Automated Security Gates",
    description: "Embed static application security testing (SAST), software composition analysis (SCA), secrets scanning, and automated container policy gates into GitHub Actions.",
    instructor: { name: "Kavita Rao", role: "DevSecOps Practice Lead", avatar: "KR" },
    stats: { duration: "1h 55m", enrolled: 39, rating: 4.8 },
    tags: ["DevSecOps", "CI/CD", "Security", "GitHub Actions"],
    isMandatory: true,
    modules: [
      {
        id: "m1",
        title: "Module 1: Automated Security Testing in CI/CD",
        lessons: [
          {
            id: "l11_1",
            title: "DevSecOps Architecture & Shift-Left Philosophy",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/scEDHsr3APg",
            diagram: "Git Push ---> Secret Detection (Gitleaks) ---> SAST (Semgrep) ---> Container Scan (Trivy) ---> Deploy",
            reflectionQuestion: "Why is 'Shifting Left' 10x cheaper than remediating security bugs discovered in production?",
            articleContent: "Shift-Left security embeds automated linters, vulnerability scanners, and license compliance directly into the pull request lifecycle.",
          },
        ],
      },
    ],
    quiz: {
      title: "DevSecOps & CI/CD Security Exam",
      questions: [
        { id: "q1", text: "What does 'Shift-Left' mean in software engineering security?", options: ["Moving source code to left monitor", "Integrating security testing earlier in the software development lifecycle", "Shifting all servers to Western data centers", "Replacing developers with QA testers"], correctIndex: 1, explanation: "Shifting left catches vulnerabilities during development rather than after production deployment." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is SAST?", back: "Static Application Security Testing analyzes source code for vulnerabilities without executing it." },
    ],
  },

  // 12. PostgreSQL Optimization
  "12": {
    id: "12",
    title: "PostgreSQL Performance Tuning & Query Optimization",
    description: "Analyze execution plans with EXPLAIN ANALYZE, tune vacuum parameters, build composite B-Tree and GIN indexes, and resolve connection pooling bottlenecks.",
    instructor: { name: "Anand Ranganathan", role: "Principal Database Architect", avatar: "AR" },
    stats: { duration: "2h 20m", enrolled: 47, rating: 4.9 },
    tags: ["PostgreSQL", "Database", "Performance", "SQL"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Indexing Strategies & Query Optimization",
        lessons: [
          {
            id: "l12_1",
            title: "PostgreSQL Execution Plan Analysis",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/qw--VYLpxG4",
            diagram: "Query Parser ---> Query Planner ---> Index Scan vs Seq Scan ---> Buffer Cache Hit",
            reflectionQuestion: "When can an index scan actually be slower than a sequential table scan in PostgreSQL?",
            articleContent: "Understanding cost estimations, work_mem allocations, and index selection ensures low latency transactions across tables with millions of records.",
          },
        ],
      },
    ],
    quiz: {
      title: "PostgreSQL Performance Engineering Exam",
      questions: [
        { id: "q1", text: "What does EXPLAIN ANALYZE do in PostgreSQL?", options: ["Only shows estimated query execution cost", "Executes the query and displays actual runtimes and row counts", "Deletes slow table rows", "Changes database passwords"], correctIndex: 1, explanation: "EXPLAIN ANALYZE actually runs the query to measure real CPU times and memory buffers." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is a GIN Index?", back: "Generalized Inverted Index, ideal for indexing composite items like JSONB documents and full-text search." },
    ],
  },

  // 13. Frontend Performance
  "13": {
    id: "13",
    title: "Modern Frontend Performance & Core Web Vitals",
    description: "Optimize Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS). Master bundle splitting and asset caching.",
    instructor: { name: "Sarah Jenkins", role: "Web Performance Engineer", avatar: "SJ" },
    stats: { duration: "1h 40m", enrolled: 31, rating: 4.8 },
    tags: ["Frontend", "Performance", "Web Vitals", "React"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Core Web Vitals & Asset Optimization",
        lessons: [
          {
            id: "l13_1",
            title: "Optimizing LCP, INP, and CLS in Modern Web Apps",
            type: "video",
            duration: "14m",
            videoUrl: "https://www.youtube.com/embed/wm5gMKuwSYk",
            diagram: "Resource Preload ---> Critical CSS Inlining ---> Font Display Swap ---> Zero Layout Shift",
            reflectionQuestion: "What is the primary cause of Cumulative Layout Shift (CLS) in image-heavy pages?",
            articleContent: "Delivering sub-second web experiences requires inlining critical assets, reserving image aspect-ratio placeholders, and minimizing main-thread JavaScript execution.",
          },
        ],
      },
    ],
    quiz: {
      title: "Frontend Web Performance Exam",
      questions: [
        { id: "q1", text: "What does Largest Contentful Paint (LCP) measure?", options: ["How long it takes to download HTML", "Render time of the largest image or text block visible in the viewport", "The size of the CSS file", "Number of clicks on the page"], correctIndex: 1, explanation: "LCP measures perceived loading speed by timing when the main page content renders." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is INP?", back: "Interaction to Next Paint measures page responsiveness to user clicks, taps, and keyboard inputs." },
    ],
  },

  // 14. API Design (REST, GraphQL, gRPC)
  "14": {
    id: "14",
    title: "API Design with REST, GraphQL & gRPC",
    description: "Compare API communication paradigms. Master schema definition with Protocol Buffers, GraphQL federation, and RESTful idempotency semantics.",
    instructor: { name: "Tariq Mansoor", role: "Chief Backend Architect", avatar: "TM" },
    stats: { duration: "2h 15m", enrolled: 44, rating: 4.9 },
    tags: ["API Design", "gRPC", "GraphQL", "Backend"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: High-Throughput Protocol Selection",
        lessons: [
          {
            id: "l14_1",
            title: "REST vs GraphQL vs gRPC: Architectural Trade-offs",
            type: "video",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/qYhRvH9tJKw",
            diagram: "Client (JSON / REST) ---> API Gateway ---> Internal Services (gRPC Binary Protobuf over HTTP/2)",
            reflectionQuestion: "Why is gRPC 5x to 10x faster for internal microservice communication compared to REST over JSON?",
            articleContent: "gRPC uses binary Protocol Buffers and multiplexed HTTP/2 streams, drastically reducing CPU serialization overhead and network bandwidth.",
          },
        ],
      },
    ],
    quiz: {
      title: "Enterprise API Design Exam",
      questions: [
        { id: "q1", text: "What enables gRPC to achieve superior throughput over traditional JSON REST APIs?", options: ["Smaller monitor requirements", "Binary Protocol Buffers serialization over HTTP/2 multiplexing", "Disabling encryption entirely", "Only supporting numbers"], correctIndex: 1, explanation: "Binary protobuf encoding and HTTP/2 multiplexed streams eliminate verbose JSON parsing." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Idempotency?", back: "An API property where making the same request multiple times has the exact same state effect as making it once." },
    ],
  },

  // 15. Rust Systems Programming
  "15": {
    id: "15",
    title: "Rust Programming: Memory Safety & High Concurrency",
    description: "Learn zero-cost abstractions, the borrow checker, ownership semantics, and thread concurrency without garbage collection pauses.",
    instructor: { name: "Dr. Felix Thorne", role: "Systems Programming Fellow", avatar: "FT" },
    stats: { duration: "3h 00m", enrolled: 68, rating: 5.0 },
    tags: ["Rust", "Systems Programming", "Concurrency", "Performance"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Ownership, Borrowing & Concurrency",
        lessons: [
          {
            id: "l15_1",
            title: "Rust Ownership & The Borrow Checker",
            type: "video",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/zF34dRivLOw",
            diagram: "Variable Allocation ---> Single Owner Scope ---> Move / Borrow (&T) ---> Automatic Drop (No GC)",
            reflectionQuestion: "How does Rust prevent data races at compile time without a runtime garbage collector?",
            articleContent: "Rust enforces memory safety at compile time through its ownership model, guaranteeing freedom from null pointer dereferences and use-after-free bugs.",
          },
        ],
      },
    ],
    quiz: {
      title: "Rust Systems Programming Exam",
      questions: [
        { id: "q1", text: "How does Rust prevent memory leaks and dangling pointers without a garbage collector?", options: ["Compile-time ownership rules and borrow checking", "Writing all code in assembly", "Allowing only single-threaded programs", "Restarting the computer on error"], correctIndex: 0, explanation: "Rust's borrow checker enforces strict ownership and lifetime rules at compilation." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is RAII?", back: "Resource Acquisition Is Initialization: resources are automatically freed when the owning variable exits its scope." },
    ],
  },

  // 16. Cloud FinOps
  "16": {
    id: "16",
    title: "Enterprise FinOps: Cloud Cost Optimization & Governance",
    description: "Establish cloud financial accountability, unit economics, automated instance rightsizing, and savings plan commitment modeling.",
    instructor: { name: "Rachel Adams", role: "VP of Cloud Financial Operations", avatar: "RA" },
    stats: { duration: "1h 35m", enrolled: 28, rating: 4.7 },
    tags: ["FinOps", "Cloud Cost", "Finance", "Governance"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Unit Economics & Tagging Governance",
        lessons: [
          {
            id: "l16_1",
            title: "Cloud FinOps Framework & Cost Allocation",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/6iJ_5kL4P1w",
            diagram: "Cloud Billing Export ---> Cost Allocation Tags ---> Team Cost Centers ---> Automated Rightsizing",
            reflectionQuestion: "How do mandatory resource tags enable engineering teams to own their cloud margins?",
            articleContent: "FinOps bridges engineering and finance, transforming cloud spend from an opaque monthly bill into granular unit cost metrics (cost per customer transaction).",
          },
        ],
      },
    ],
    quiz: {
      title: "Enterprise Cloud FinOps Exam",
      questions: [
        { id: "q1", text: "What is the primary goal of Cloud FinOps?", options: ["Stop engineers from building new software", "Drive financial accountability and maximize business value from cloud spend", "Switch all applications back to on-premise hardware", "Eliminate cloud backups"], correctIndex: 1, explanation: "FinOps enables data-driven decisions to optimize the ROI of cloud infrastructure." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Unit Economics in FinOps?", back: "Measuring infrastructure cost relative to business metrics (e.g. Cost per active user or Cost per order)." },
    ],
  },

  // 17. MLOps & Model Monitoring
  "17": {
    id: "17",
    title: "Machine Learning Operations (MLOps) & Model Monitoring",
    description: "Deploy scalable ML inference pipelines, track model drift, manage feature stores, and implement automated retraining with MLflow and Kubeflow.",
    instructor: { name: "Dr. Chen Wei", role: "Head of AI Infrastructure", avatar: "CW" },
    stats: { duration: "2h 25m", enrolled: 51, rating: 4.9 },
    tags: ["MLOps", "Machine Learning", "AI", "Kubeflow"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Model Deployment & Drift Detection",
        lessons: [
          {
            id: "l17_1",
            title: "MLOps Architecture: CI/CD for Machine Learning",
            type: "video",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/zjkBMFhNj_g",
            diagram: "Feature Store ---> Training Pipeline ---> Model Registry ---> Triton Inference Server ---> Drift Alert",
            reflectionQuestion: "What is the difference between concept drift and data drift in live inference systems?",
            articleContent: "MLOps operationalizes machine learning by automating data validation, experiment versioning, canary model rollouts, and real-time latency monitoring.",
          },
        ],
      },
    ],
    quiz: {
      title: "MLOps & AI Infrastructure Exam",
      questions: [
        { id: "q1", text: "What is data drift in machine learning systems?", options: ["When server hard drives move physically", "When statistical properties of production input data change over time", "When Python code has syntax errors", "When GPU fans speed up"], correctIndex: 1, explanation: "Data drift occurs when incoming inference data distributions deviate from the training distribution." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is a Feature Store?", back: "A centralized repository that standardizes feature computation for training and low-latency serving." },
    ],
  },

  // 18. Site Reliability Engineering (SRE)
  "18": {
    id: "18",
    title: "Incident Response & SRE Reliability Engineering",
    description: "Define Service Level Objectives (SLOs), manage error budgets, conduct blameless post-mortems, and build automated chaos engineering drills.",
    instructor: { name: "Lucas Meyer", role: "Director of Reliability Engineering", avatar: "LM" },
    stats: { duration: "2h 05m", enrolled: 43, rating: 4.8 },
    tags: ["SRE", "DevOps", "Reliability", "Incident Response"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: SLIs, SLOs & Blameless Post-Mortems",
        lessons: [
          {
            id: "l18_1",
            title: "Site Reliability Engineering Core Principles",
            type: "video",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/inWWhr5tnEA",
            diagram: "Telemetry Metrics (SLI) ---> SLO Target ---> Error Budget Depleted ---> Feature Freeze",
            reflectionQuestion: "Why are blameless post-mortems essential for organizational resilience after major outages?",
            articleContent: "SRE treats operations as a software engineering problem. Teams balance product feature velocity against service availability using error budgets.",
          },
        ],
      },
    ],
    quiz: {
      title: "Site Reliability Engineering (SRE) Exam",
      questions: [
        { id: "q1", text: "What is an Error Budget in SRE?", options: ["The money paid to fix bugs", "The allowable amount of downtime or failure within an SLO period", "The maximum number of employees on call", "A budget for hardware servers"], correctIndex: 1, explanation: "Error budgets quantify the acceptable risk of downtime to balance reliability with deployment speed." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is an SLI?", back: "Service Level Indicator: a direct, measurable metric of service performance (e.g. latency or error rate)." },
    ],
  },

  // 19. Ethical Hacking & Pentesting
  "19": {
    id: "19",
    title: "Ethical Hacking & Web Application Penetration Testing",
    description: "Identify and exploit OWASP Top 10 vulnerabilities including SQL Injection, Cross-Site Scripting (XSS), SSRF, and Broken Access Control in controlled labs.",
    instructor: { name: "Zack Robinson", role: "Principal Penetration Tester", avatar: "ZR" },
    stats: { duration: "2h 35m", enrolled: 62, rating: 4.9 },
    tags: ["Cybersecurity", "Ethical Hacking", "OWASP", "Pentesting"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: OWASP Top 10 Exploits & Defenses",
        lessons: [
          {
            id: "l19_1",
            title: "Web Security Fundamentals & Pentesting Methodology",
            type: "video",
            duration: "16m",
            videoUrl: "https://www.youtube.com/embed/bPVaOlJ6ln0",
            diagram: "Reconnaissance ---> Threat Modeling ---> Vulnerability Scan ---> Exploitation ---> Remediation Report",
            reflectionQuestion: "How do parameterized database queries eliminate SQL Injection vulnerabilities completely?",
            articleContent: "Ethical hackers simulate real-world cyberattacks to uncover flaws before malicious threat actors exploit them.",
          },
        ],
      },
    ],
    quiz: {
      title: "Ethical Hacking & Web Pentesting Exam",
      questions: [
        { id: "q1", text: "What is the most effective defense against SQL Injection?", options: ["Firewalls", "Parameterized Prepared Statements", "Hiding the database password", "Converting code to HTML"], correctIndex: 1, explanation: "Prepared statements treat user input strictly as literal values rather than executable SQL syntax." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is SSRF?", back: "Server-Side Request Forgery forces a server to make unauthorized requests to internal network services." },
    ],
  },

  // 20. Tech Leadership & Communication
  "20": {
    id: "20",
    title: "Executive Communication & High-Impact Tech Leadership",
    description: "Bridge the gap between complex engineering architectures and business ROI. Master executive storytelling, board presentations, and conflict resolution.",
    instructor: { name: "Claire Dupont", role: "Executive Leadership Strategist", avatar: "CD" },
    stats: { duration: "1h 30m", enrolled: 37, rating: 4.9 },
    tags: ["Leadership", "Communication", "Management"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Translating Technical Architecture into ROI",
        lessons: [
          {
            id: "l20_1",
            title: "High-Impact Executive Communication for Engineers",
            type: "video",
            duration: "14m",
            videoUrl: "https://www.youtube.com/embed/7r1wL6g_3Qw",
            diagram: "Technical Problem ---> Business Impact ---> Quantified ROI Proposal ---> Actionable Recommendation",
            reflectionQuestion: "How do you present a large refactoring project to non-technical stakeholders to secure budget approval?",
            articleContent: "Effective engineering leaders frame technical investments in terms of risk reduction, customer retention, and revenue velocity.",
          },
        ],
      },
    ],
    quiz: {
      title: "Tech Leadership & Communication Exam",
      questions: [
        { id: "q1", text: "When pitching technical debt remediation to executive leadership, what is the best approach?", options: ["Complain about old code", "Quantify the business impact, customer risk, and velocity gains", "Write a 50-page technical paper", "Refactor in secret without telling anyone"], correctIndex: 1, explanation: "Executives approve funding when technical work is tied to tangible business outcomes." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Pyramid Communication?", back: "Starting presentations with the core recommendation first, followed by supporting arguments." },
    ],
  },

  // 21. Zero-Trust Network Access (ZTNA)
  "21": {
    id: "21",
    title: "Zero-Trust Network Access (ZTNA) & Identity Security",
    description: "Deprecate legacy VPNs in favor of modern Zero-Trust Network Access (ZTNA). Configure identity providers, context-aware proxying, and device posture checks.",
    instructor: { name: "Nathan Drake", role: "Enterprise Network Security Architect", avatar: "ND" },
    stats: { duration: "2h 00m", enrolled: 29, rating: 4.8 },
    tags: ["Network Security", "Zero-Trust", "ZTNA", "Cybersecurity"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Legacy VPN Deprecation & ZTNA Deployment",
        lessons: [
          {
            id: "l21_1",
            title: "ZTNA Architecture vs Traditional Corporate VPNs",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/1vR3bFh_n7A",
            diagram: "User Request ---> Identity Provider (SAML / OIDC) ---> Device Health Check ---> Encrypted Per-App Tunnel",
            reflectionQuestion: "Why does ZTNA grant access on a per-application basis rather than exposing the entire subnet?",
            articleContent: "ZTNA establishes granular, encrypted 1-to-1 connections to individual applications, eliminating broad network-level visibility for attackers.",
          },
        ],
      },
    ],
    quiz: {
      title: "ZTNA & Identity Architecture Exam",
      questions: [
        { id: "q1", text: "What is the primary security flaw of legacy corporate VPNs?", options: ["They require passwords", "They grant broad subnet network access once authenticated", "They only work on Windows", "They disable browser cookies"], correctIndex: 1, explanation: "Legacy VPNs grant broad network access, enabling attackers to move laterally." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is Device Posture Check?", back: "Verifying OS patch level, disk encryption, and antivirus status before granting application access." },
    ],
  },

  // 22. Tech Product Management
  "22": {
    id: "22",
    title: "Product Management: Discovery, Roadmaps & Strategy",
    description: "Lead product discovery, build customer empathy interviews, define North Star metrics, prioritize roadmaps with RICE framework, and drive agile delivery.",
    instructor: { name: "Sophia Martinez", role: "Head of Product Strategy", avatar: "SM" },
    stats: { duration: "1h 50m", enrolled: 35, rating: 4.9 },
    tags: ["Product Management", "Strategy", "Agile", "Leadership"],
    isMandatory: false,
    modules: [
      {
        id: "m1",
        title: "Module 1: Continuous Discovery & Product Prioritization",
        lessons: [
          {
            id: "l22_1",
            title: "Product Strategy, User Discovery & RICE Prioritization",
            type: "video",
            duration: "15m",
            videoUrl: "https://www.youtube.com/embed/8eWd1X_kQyo",
            diagram: "Customer Problem ---> Opportunity Solution Tree ---> RICE Scoring ---> MVP Validation",
            reflectionQuestion: "How does the RICE framework (Reach, Impact, Confidence, Effort) remove personal bias from product roadmaps?",
            articleContent: "Great product managers continuously validate problem spaces before writing code, prioritizing features that drive measurable retention and revenue.",
          },
        ],
      },
    ],
    quiz: {
      title: "Tech Product Management Capstone Exam",
      questions: [
        { id: "q1", text: "What does the RICE scoring model stand for in product management?", options: ["Risk, Innovation, Cost, Efficiency", "Reach, Impact, Confidence, Effort", "Research, Ideation, Coding, Evaluation", "Review, Iterate, Calculate, Execute"], correctIndex: 1, explanation: "RICE measures Reach, Impact, and Confidence divided by Effort to rank feature priorities." },
      ],
    },
    flashcards: [
      { id: "fc1", front: "What is a North Star Metric?", back: "The single key metric that best captures the core value your product delivers to customers." },
    ],
  },
};

export function getCourseDetailById(id: string): CourseDetail {
  if (COURSES_DATABASE[id]) {
    return COURSES_DATABASE[id];
  }

  // Fallback default
  return COURSES_DATABASE["1"];
}
