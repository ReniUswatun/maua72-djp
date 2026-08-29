"use client";

import { Lightbulb, Sparkles } from "lucide-react";

import { OptionCheckbox } from "@/components/assessment/OptionCheckbox";
import { OptionRadio } from "@/components/assessment/OptionRadio";
import { TeksBerGlosarium } from "@/components/assessment/HelpTooltip";
import { Badge } from "@/components/ui/badge";
import type { Answer, Question } from "@/lib/types";
import { cn } from "@/lib/utils";

export function QuestionCard({
  pertanyaan,
  nomor,
  total,
  jawaban,
  onJawab,
}: {
  pertanyaan: Question;
  nomor: number;
  total: number;
  jawaban: Answer | undefined;
  onJawab: (jawaban: Answer) => void;
}) {
  const terpilih = Array.isArray(jawaban) ? jawaban : jawaban ? [jawaban] : [];
  const terjawab = terpilih.length > 0;

  /** Multi-select: opsi "belum ada" mematikan pilihan lain, dan sebaliknya. */
  const toggle = (opsiId: string) => {
    const nol = pertanyaan.opsiNolId;
    if (opsiId === nol) {
      onJawab(terpilih.includes(nol) ? [] : [nol]);
      return;
    }
    const tanpaNol = terpilih.filter((id) => id !== nol);
    onJawab(
      tanpaNol.includes(opsiId)
        ? tanpaNol.filter((id) => id !== opsiId)
        : [...tanpaNol, opsiId],
    );
  };

  return (
    <article
      id={`q-${pertanyaan.id}`}
      className={cn(
        "scroll-mt-32 rounded-xl border bg-white p-6 transition-colors sm:p-8",
        terjawab ? "border-gray-200" : "border-gray-300",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Pertanyaan {nomor} dari {total}
        </span>
        {pertanyaan.hanyaUntukTrait ? (
          <Badge tone="accent">
            <Sparkles className="h-3 w-3" aria-hidden />
            Khusus kategori usaha Anda
          </Badge>
        ) : null}
        {pertanyaan.type === "multi" ? (
          <Badge tone="neutral">Boleh pilih lebih dari satu</Badge>
        ) : null}
      </div>

      <h2 className="mt-3 text-xl font-semibold leading-snug text-gray-900">
        <TeksBerGlosarium teks={pertanyaan.teks} istilah={pertanyaan.istilah} />
      </h2>

      <div
        className="mt-5 space-y-2.5"
        role={pertanyaan.type === "single" ? "radiogroup" : "group"}
        aria-label={pertanyaan.teks}
      >
        {pertanyaan.options.map((o) =>
          pertanyaan.type === "single" ? (
            <OptionRadio
              key={o.id}
              name={pertanyaan.id}
              value={o.id}
              label={o.label}
              checked={terpilih.includes(o.id)}
              onSelect={onJawab}
            />
          ) : (
            <OptionCheckbox
              key={o.id}
              value={o.id}
              label={o.label}
              checked={terpilih.includes(o.id)}
              onToggle={toggle}
            />
          ),
        )}
      </div>

      {pertanyaan.bantuan ? (
        <div className="mt-5 flex gap-3 rounded-lg border border-sky-100 bg-sky-50/70 p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden />
          <p className="text-sm leading-relaxed text-sky-900">
            {pertanyaan.bantuan}
          </p>
        </div>
      ) : null}
    </article>
  );
}
