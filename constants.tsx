
import { KnowledgeBank, Script, TaxonomyCategory, AgentLog, KBStatus } from './types';

export const MOCK_KNOWLEDGE_BANKS: KnowledgeBank[] = [
  {
    id: 'KB-8821',
    name: 'Destek Kripto',
    description: 'Kripto para çekim limitleri, güvenlik ve cüzdan yönetimi rehberi.',
    status: KBStatus.READY,
    documentCount: 145,
    agentCount: 2,
    lastUpdated: '10 Dakika Önce',
    thumbnail: 'https://picsum.photos/seed/kripto/400/300',
    tags: ['Kripto', 'Güvenlik', 'Limitler'],
    taxonomyCategoryId: 'ROOT-GRP-1'
  }
];

export const MOCK_SCRIPTS: Script[] = [
  {
    id: 'SCR-1001',
    content: 'En az ne kadar kripto çekebilirim? Bir limit var mı?',
    primaryIntent: 'Withdrawal Limit Inquiry',
    category: 'Kripto Çekim',
    keywords: ['limit', 'çekim', 'minimum'],
    confidence: 1.0,
    status: 'PROCESSED',
    kbId: 'KB-8821',
    isGolden: true
  }
];

export const MOCK_TAXONOMY: TaxonomyCategory[] = [
  { id: 'ROOT-GRP-1', name: 'Destek Operasyon', count: 12, type: 'CATEGORY' }
];

export const MOCK_LOGS: AgentLog[] = [
  {
    id: '1766666777865',
    timestamp: '15:46:17',
    userInput: 'en az kadar kripto çekebilirim. Bir limit var mı?',
    aiResponse: 'Sayın kullanıcımız, kripto para çekim limitleri hesabınızın doğrulama seviyesine göre değişmektedir. Temel hesaplar için günlük limit 10.000 USD eşdeğeridir.',
    intent: 'Withdrawal Limit Inquiry',
    category: 'Kripto Çekim',
    confidence: 0.95,
    status: 'VERIFIED',
    reasoning: 'Kullanıcı limitleri sordu, RAG verisi başarıyla çekildi.',
    durationMs: 840,
    tokenUsage: { prompt: 840, completion: 120, total: 960 },
    sentiment: 'Neutral'
  },
  {
    id: '1766666904475',
    timestamp: '16:12:05',
    userInput: 'Yatırım tavsiyesi verir misiniz?',
    aiResponse: 'Üzgünüm, yasal düzenlemeler gereği yatırım tavsiyesi verememekteyim. Lütfen profesyonel bir danışmana başvurun.',
    intent: 'Investment Advice Denied',
    category: 'Legal',
    confidence: 0.32,
    status: 'LOW_CONFIDENCE',
    reasoning: 'Reddedilen içerik tespit edildi ancak cevap düşük güven skoruna sahip.',
    durationMs: 1200,
    tokenUsage: { prompt: 900, completion: 50, total: 950 },
    sentiment: 'Urgent'
  }
];
