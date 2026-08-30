"use client";

import { PanduanArticle } from "@/components/panduan/PanduanArticle";

export default function DashboardPanduanDetailPage({ params }: { params: { slug: string } }) {
  return <PanduanArticle slug={params.slug} basePath="/dashboard/panduan" />;
}
