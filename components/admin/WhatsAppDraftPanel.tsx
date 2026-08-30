"use client";

import * as React from "react";
import { Copy, MessageCircle, RefreshCw, Save } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { generateWaDraft, waLink } from "@/lib/wa-template";
import { useAdminStore } from "@/store/admin-store";
import type { ApplicationCase } from "@/lib/types";

/** Fitur C4 — draf pesan WhatsApp siap kirim ke UMKM. */
export function WhatsAppDraftPanel({
  caseItem,
  embedded = false,
}: {
  caseItem: ApplicationCase;
  /** True bila dipakai di dalam Card/section lain — buang bingkai Card sendiri. */
  embedded?: boolean;
}) {
  const saveWaDraft = useAdminStore((s) => s.saveWaDraft);
  const [text, setText] = React.useState(caseItem.waDraft ?? generateWaDraft(caseItem));
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const regenerate = () => {
    setText(generateWaDraft(caseItem));
    setSaved(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const body = (
    <div className="space-y-4">
      {embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-600">
            Disusun dari keputusan terkini. Tinjau dan sunting sebelum dikirim.
          </p>
          <Badge tone="success">wa.me · {caseItem.phone}</Badge>
        </div>
      ) : null}

      <Textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setSaved(false);
        }}
        className="min-h-[13rem] font-normal"
        aria-label="Draf pesan WhatsApp"
      />

      <div className="flex flex-wrap gap-3">
        <a href={waLink(caseItem.phone, text)} target="_blank" rel="noreferrer">
          <Button>
            <MessageCircle className="h-4 w-4" aria-hidden />
            Buka di WhatsApp
          </Button>
        </a>
        <Button variant="outline" onClick={copy}>
          <Copy className="h-4 w-4" aria-hidden />
          {copied ? "Tersalin" : "Salin teks"}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            saveWaDraft(caseItem.id, text);
            setSaved(true);
          }}
        >
          <Save className="h-4 w-4" aria-hidden />
          {saved ? "Tersimpan" : "Simpan draf"}
        </Button>
        <Button variant="ghost" onClick={regenerate}>
          <RefreshCw className="h-4 w-4" aria-hidden />
          Susun ulang dari keputusan
        </Button>
      </div>

      <p className="text-xs leading-relaxed text-gray-500">
        Draf dibuat dari data internal case ini saja. Admin bertanggung jawab penuh atas
        isi pesan yang benar-benar dikirim.
      </p>
    </div>
  );

  if (embedded) return body;

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Draf Pesan WhatsApp ke UMKM</CardTitle>
            <CardDescription>
              Disusun dari keputusan terkini. Tinjau dan sunting sebelum dikirim.
            </CardDescription>
          </div>
          <Badge tone="success">wa.me · {caseItem.phone}</Badge>
        </div>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
