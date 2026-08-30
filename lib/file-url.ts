"use client";

import * as React from "react";

/* ------------------------------------------------------------------ *
 * Berkas yang diunggah UMKM disimpan sebagai data URI (`data:...;base64`)
 * di prototipe. Browser modern memblokir navigasi tab / render <iframe>
 * langsung ke data URI (mis. Chrome: "Not allowed to navigate top frame
 * to data URL"). Solusinya: ubah data URI menjadi blob URL yang seorigin
 * dan boleh dibuka / di-embed.
 * ------------------------------------------------------------------ */

async function dataUriToBlobUrl(dataUri: string): Promise<string> {
  const res = await fetch(dataUri);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * Kembalikan URL yang aman untuk dipakai pada `<iframe src>`:
 * data URI diubah ke blob URL (dan dibersihkan saat unmount / berubah),
 * URL biasa diteruskan apa adanya.
 */
export function useViewableUrl(fileUrl: string | undefined | null): string | null {
  const [url, setUrl] = React.useState<string | null>(
    fileUrl && !fileUrl.startsWith("data:") ? fileUrl : null,
  );

  React.useEffect(() => {
    if (!fileUrl) {
      setUrl(null);
      return;
    }
    if (!fileUrl.startsWith("data:")) {
      setUrl(fileUrl);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    dataUriToBlobUrl(fileUrl)
      .then((next) => {
        if (cancelled) {
          URL.revokeObjectURL(next);
          return;
        }
        objectUrl = next;
        setUrl(next);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileUrl]);

  return url;
}

/**
 * Buka berkas di tab baru. Jendela dibuka sinkron (agar tidak diblokir
 * popup), lalu diarahkan ke blob URL setelah data URI selesai dikonversi.
 */
export function openFileInNewTab(fileUrl: string | undefined | null): void {
  if (!fileUrl) return;

  if (!fileUrl.startsWith("data:")) {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const win = window.open("", "_blank", "noopener,noreferrer");
  dataUriToBlobUrl(fileUrl)
    .then((blobUrl) => {
      if (win) win.location.href = blobUrl;
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    })
    .catch(() => {
      if (win) win.close();
    });
}
