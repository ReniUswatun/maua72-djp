import {
  FileSearch,
  Globe2,
  Landmark,
  Package,
  ScrollText,
  Ship,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const PETA: Record<string, LucideIcon> = {
  ScrollText,
  Package,
  FileSearch,
  Landmark,
  Globe2,
  Ship,
  Wallet,
  Users,
};

export function PillarIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = PETA[icon] ?? ScrollText;
  return <Icon className={className} aria-hidden />;
}
