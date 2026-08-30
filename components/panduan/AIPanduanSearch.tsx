"use client";

import * as React from "react";
import { Loader2, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PanduanEntry, PanduanBlok } from "@/lib/types";

// Helper to extract text from a Panduan entry for searching
function extractTextFromEntry(entry: PanduanEntry): string {
  let text = `${entry.judul} ${entry.ringkas} `;
  
  for (const blok of entry.blok) {
    switch (blok.tipe) {
      case "paragraf":
      case "catatan":
        text += blok.teks + " ";
        break;
      case "poin":
        text += blok.items.join(" ") + " ";
        break;
      case "langkah":
        text += blok.items.map((i) => `${i.judul} ${i.detail}`).join(" ") + " ";
        break;
      case "tautan":
        text += blok.items.map((i) => i.teks).join(" ") + " ";
        break;
      case "gambar":
        if (blok.keterangan) text += blok.keterangan + " ";
        break;
    }
  }
  return text.toLowerCase();
}

interface AIPanduanSearchProps {
  entries: PanduanEntry[];
  onResult: (results: PanduanEntry[] | null, message: string | null) => void;
}

export function AIPanduanSearch({ entries, onResult }: AIPanduanSearchProps) {
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      clearSearch();
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate AI processing delay (1.5s)
    setTimeout(() => {
      const searchTerms = query.toLowerCase().split(" ").filter((t) => t.length > 2);
      
      const scoredEntries = entries.map((entry) => {
        const fullText = extractTextFromEntry(entry);
        let score = 0;
        
        for (const term of searchTerms) {
          if (entry.judul.toLowerCase().includes(term)) score += 5; // Title match has high weight
          else if (entry.ringkas.toLowerCase().includes(term)) score += 2;
          else if (fullText.includes(term)) score += 1;
        }
        
        return { entry, score };
      });

      // Filter and sort
      const results = scoredEntries
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.entry);

      let aiMessage = "Berikut adalah panduan yang relevan dengan deskripsi Anda:";
      if (results.length === 0) {
        aiMessage = "Maaf, saya belum menemukan panduan spesifik untuk deskripsi tersebut. Anda bisa mencoba menggunakan kata kunci lain, atau melihat seluruh panduan di bawah ini.";
      } else if (results.length === 1) {
        aiMessage = "Saya menemukan satu panduan yang paling pas untuk situasi Anda:";
      }

      onResult(results.length > 0 ? results : null, aiMessage);
      setIsSearching(false);
    }, 1500);
  };

  const clearSearch = () => {
    setQuery("");
    setHasSearched(false);
    setIsSearching(false);
    onResult(null, null);
  };

  return (
    <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-1 shadow-sm ring-1 ring-inset ring-gray-200">
      <div className="rounded-xl bg-white/60 p-4 backdrop-blur-xl sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Tanya Asisten AI</h2>
            <p className="mt-1 text-sm text-gray-600">
              Ceritakan secara singkat apa yang ingin Anda ekspor atau kendala apa yang Anda temui. Saya akan mencarikan panduan yang tepat.
            </p>
            
            <form onSubmit={handleSearch} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Contoh: Saya mau ekspor furnitur ke Jepang, dokumen apa saja yang perlu disiapkan?"
                  className="pl-10 pr-10 shadow-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={isSearching}
                />
                {query && !isSearching && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit" disabled={isSearching || !query.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari Panduan"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
