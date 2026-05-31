import { RouteLoader } from '@/components/ui/RouteLoader';

export default function Loading() {
  return <RouteLoader label="Loading search" rows={6} layout="grid" />;
}
