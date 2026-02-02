
import { DomainResult } from "../types";

// Deterministic mock check for demo purposes
export const checkDomainAvailability = async (domain: string): Promise<DomainResult> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
  
  // Deterministic but feels random: available if length is odd
  const isAvailable = domain.length % 2 !== 0; 
  const tld = domain.split('.').pop() || 'com';
  
  return {
    domain,
    available: isAvailable,
    tld: `.${tld}`,
    price: isAvailable ? `$${(Math.random() * 50 + 10).toFixed(2)}` : undefined
  };
};

export const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
