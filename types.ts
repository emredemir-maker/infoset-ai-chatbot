
export enum AIProvider {
  OPENAI = 'OpenAI',
  GEMINI = 'Google Gemini',
  CLAUDE = 'Anthropic Claude',
  AZURE = 'Azure OpenAI'
}

export enum KBStatus {
  READY = 'READY',
  TRAINING = 'TRAINING',
  INDEXING = 'INDEXING',
  ERROR = 'ERROR'
}

export interface Account {
  id: string;
  name: string;
  plan: 'Standard' | 'Enterprise' | 'Trial';
  status: 'Active' | 'Trial' | 'Suspended';
  primaryContact: string;
  contactEmail: string;
  deptCount: number;
  createdAt: string;
  logo?: string;
}

export interface Department {
  id: string;
  accountId: string;
  name: string;
  adminName: string;
  adminEmail: string;
  userCount: number;
  status: 'Active' | 'Pending Setup' | 'Inactive';
  linkedResources: {
    chatbots: string[];
    knowledgeBases: string[];
  };
}

export type UserRole = 'Global Admin' | 'Dept Admin' | 'User';

export interface User {
  id: string;
  accountId: string;
  departmentIds: string[];
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Offline' | 'Invited';
  lastActive: string;
  avatar?: string;
}

export interface KnowledgeBank {
  id: string;
  name: string;
  description: string;
  status: KBStatus;
  progress?: number;
  documentCount: number;
  agentCount: number;
  lastUpdated: string;
  thumbnail: string;
  tags: string[];
  taxonomyCategoryId?: string;
  isPublic?: boolean;
  departmentId?: string;
}

export interface Script {
  id: string;
  content: string;
  primaryIntent: string;
  category: string;
  keywords: string[];
  confidence: number;
  status: 'PROCESSED' | 'PENDING' | 'REJECTED';
  kbId: string;
  isGolden?: boolean;
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  parentId?: string;
  kbId?: string; 
  description?: string;
  promptContext?: string;
  fewShotExamples?: string[];
  count: number;
  type: 'CATEGORY' | 'INTENT' | 'ENTITY';
  forceHierarchy?: boolean;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  userInput: string;
  aiResponse: string;
  intent: string;
  category: string;
  confidence: number;
  status: 'VERIFIED' | 'LOW_CONFIDENCE' | 'REFLECTED' | 'CORRECTED';
  reasoning: string;
  sourceScriptId?: string;
  referenceKbId?: string;
  userLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  sentiment?: 'Positive' | 'Neutral' | 'Negative' | 'Urgent';
  durationMs?: number;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface EscalationTrigger {
  id: string;
  type: 'Confidence Score' | 'Keyword' | 'Intent' | 'Sentiment';
  condition: 'Is below' | 'Is above' | 'Contains' | 'Equals' | 'Is';
  value: string;
}

export interface EscalationAction {
  id: string;
  type: 'Send Email' | 'Webhook' | 'Transfer to Human' | 'Slack Notification';
  recipients?: string;
  message?: string;
}

export interface EscalationRule {
  id: string;
  name: string;
  isActive: boolean;
  triggers: EscalationTrigger[];
  actions: EscalationAction[];
}

export interface Bot {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  kbIds: string[];
  temperature: number;
  welcomeMessage: string;
  systemPrompt?: string;
  status: 'ACTIVE' | 'DRAFT';
  maxResponseLength: number;
  tone: 'Professional' | 'Friendly' | 'Concise' | 'Instructional';
  promptStyle?: 'Direct' | 'Polite' | 'Inquisitive' | 'Concise';
  notificationRules: string[]; 
  maxOffTopicQuestions?: number;
  departmentId?: string;
}
