import type { Metadata } from 'next';
import { AdaChat } from '@/components/ada/AdaChat';

export const metadata: Metadata = {
  // short title — ADA layout template appends "| AI Domain Assistant"
  title: 'Chat',
  description:
    'Chat with AI Domain Assistant: brand-aligned domain ranking under budget. Agents use the same engine via MCP, REST, and the chat API.',
};

export default function AdaChatPage() {
  return <AdaChat />;
}
