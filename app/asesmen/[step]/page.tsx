import { notFound } from "next/navigation";

import { PILLARS } from "@/lib/assessment-config";
import { StepAsesmen } from "./StepAsesmen";

export function generateStaticParams() {
  return PILLARS.map((p) => ({ step: String(p.id) }));
}

export default function AsesmenStepPage({
  params,
}: {
  params: { step: string };
}) {
  const step = Number(params.step);
  if (!PILLARS.some((p) => p.id === step)) notFound();

  return <StepAsesmen step={step} />;
}
