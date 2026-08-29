"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { NavigationButtons } from "@/components/assessment/NavigationButtons";
import { ProgressHeader } from "@/components/assessment/ProgressHeader";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { ButuhProfil } from "@/components/shared/Gate";
import { PillarIcon } from "@/components/shared/PillarIcon";
import {
  PILLARS,
  getPillar,
  questionsForPillar,
} from "@/lib/assessment-config";
import { isTerjawab, progresAsesmen } from "@/lib/scoring";
import type { Answer } from "@/lib/types";
import { useAppStore } from "@/store/assessment-store";

export function StepAsesmen({ step }: { step: number }) {
  return (
    <ButuhProfil>
      <Isi step={step} />
    </ButuhProfil>
  );
}

function Isi({ step }: { step: number }) {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const answers = useAppStore((s) => s.answers);
  const setJawaban = useAppStore((s) => s.setJawaban);
  const selesaikanAsesmen = useAppStore((s) => s.selesaikanAsesmen);

  const pilar = getPillar(step);
  const pertanyaan = React.useMemo(
    () => questionsForPillar(step, profile),
    [step, profile],
  );
  const progres = progresAsesmen(answers, profile);
  const belumLengkap = pertanyaan.filter(
    (q) => !isTerjawab(q, answers[q.id]),
  ).length;
  const langkahTerakhir = step === PILLARS[PILLARS.length - 1].id;

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  /** Setelah menjawab, gulirkan ke pertanyaan berikutnya yang masih kosong. */
  const jawab = (id: string, nilai: Answer, indeks: number) => {
    setJawaban(id, nilai);
    const berikut = pertanyaan[indeks + 1];
    if (!berikut) return;
    window.requestAnimationFrame(() => {
      document
        .getElementById(`q-${berikut.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const lanjut = () => {
    if (langkahTerakhir) {
      selesaikanAsesmen();
      router.push("/asesmen/hasil");
      return;
    }
    const currIdx = PILLARS.findIndex((p) => p.id === step);
    const nextStep = PILLARS[currIdx + 1]?.id ?? step + 1;
    router.push(`/asesmen/${nextStep}`);
  };

  return (
    <>
      <ProgressHeader
        pilarAktif={step}
        persen={progres.persen}
        terjawab={progres.terjawab}
        totalPertanyaan={progres.total}
      />

      <main id="konten-utama" className="container-form py-8 sm:py-10">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-white">
              <PillarIcon icon={pilar?.icon ?? ""} className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {pilar?.nama}
              </h1>
              <p className="mt-1.5 leading-relaxed text-gray-600">
                {pilar?.ringkas}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {pertanyaan.map((q, i) => (
              <QuestionCard
                key={q.id}
                pertanyaan={q}
                nomor={i + 1}
                total={pertanyaan.length}
                jawaban={answers[q.id]}
                onJawab={(nilai) => jawab(q.id, nilai, i)}
              />
            ))}
          </div>

          <NavigationButtons
            onSebelumnya={() => {
              const currIdx = PILLARS.findIndex((p) => p.id === step);
              if (currIdx === 0) {
                router.push("/asesmen");
              } else {
                const prevStep = PILLARS[currIdx - 1]?.id ?? step - 1;
                router.push(`/asesmen/${prevStep}`);
              }
            }}
            onLanjut={lanjut}
            bisaSebelumnya
            langkahTerakhir={langkahTerakhir}
            belumLengkap={belumLengkap}
            labelLanjut={
              langkahTerakhir ? "Selesai & Lihat Hasil" : "Simpan & Lanjut"
            }
          />
        </motion.div>
      </main>
    </>
  );
}
