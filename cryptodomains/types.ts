
export interface DomainResult {
  domain: string;
  available: boolean;
  tld: string;
  price?: string;
}

export interface WhoisResult {
  domain: string;
  registrar: string;
  createdDate: string;
  expiresDate: string;
  updatedDate: string;
  nameServers: string[];
  status: string[];
  rawWhois?: string;
}

export interface AppraisalResult {
  domain: string;
  estimatedValue: string;
  reasoning: string;
  comparableSales: string[];
  marketPotential: 'Low' | 'Medium' | 'High';
}

export interface GeoLocation {
  name: string;
  population: string;
  code: string;
}

export type ToolType = 'search' | 'generator' | 'geo' | 'bulk' | 'whois' | 'appraisal';
