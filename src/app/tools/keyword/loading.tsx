import { RouteLoader } from '@/components/ui/RouteLoader';

export default function Loading() {
  return <RouteLoader label="Loading keyword finder" rows={6} layout="stack" />;
}
