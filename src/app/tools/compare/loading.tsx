import { RouteLoader } from '@/components/ui/RouteLoader';

export default function Loading() {
  return <RouteLoader label="Loading price comparison" rows={6} layout="stack" />;
}
