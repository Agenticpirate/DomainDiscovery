import { RouteLoader } from '@/components/ui/RouteLoader';

export default function Loading() {
  return <RouteLoader label="Loading domain extensions" rows={9} layout="grid" />;
}
