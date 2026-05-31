import { RouteLoader } from '@/components/ui/RouteLoader';

export default function Loading() {
  return <RouteLoader label="Loading the domain generator" rows={6} layout="grid" />;
}
