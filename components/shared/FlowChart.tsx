"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FlowStep {
  id: string;
  label: string;
  shape?: "rect" | "rounded" | "diamond" | "branch-only";
  branches?: { label?: string; targetId: string }[];
}

interface Props {
  steps: FlowStep[];
  /** Max nodes per row before wrapping. Default 3. */
  perRow?: number;
  className?: string;
}

/* ── Layout constants ─────────────────────────────────── */
const W = 180;   // node width
const H = 56;    // node height
const DW = 160;  // diamond width
const DH = 64;   // diamond height
const GAP_X = 40; // horizontal gap between nodes
const GAP_Y = 48; // vertical gap between rows

/* ── Colours ──────────────────────────────────────────── */
const C = {
  start:   { bg: "#eff6ff", border: "#3b82f6", text: "#1e40af" },
  end:     { bg: "#f0fdf4", border: "#22c55e", text: "#166534" },
  normal:  { bg: "#f8fafc", border: "#94a3b8", text: "#334155" },
  diamond: { bg: "#fef9c3", border: "#f59e0b", text: "#78350f" },
};

type Pos = { x: number; y: number; w: number; h: number };

/**
 * Snake layout: row 0 goes L→R, connector goes down on right side,
 * row 1 goes R→L (reversed), connector goes down on left side, etc.
 */
function buildLayout(steps: FlowStep[], perRow: number) {
  const mainSteps = steps.filter((s) => !s.shape || s.shape !== "branch-only");
  const pos: Record<string, Pos> = {};

  let row = 0;
  let col = 0;

  mainSteps.forEach((step) => {
    const isDiamond = step.shape === "diamond";
    const sw = isDiamond ? DW : W;
    const sh = isDiamond ? DH : H;
    const rowY = row * (H + GAP_Y) + 24;
    const isEvenRow = row % 2 === 0;

    // Column x: even rows go L→R, odd rows go R→L
    const maxCols = perRow;
    const colX = isEvenRow
      ? col * (W + GAP_X) + 32
      : (maxCols - 1 - col) * (W + GAP_X) + 32;

    pos[step.id] = { x: colX, y: rowY, w: sw, h: sh };

    col++;
    if (col >= perRow) {
      col = 0;
      row++;
    }
  });

  // Place branch-only targets (nodes not in main sequence)
  steps.forEach((step) => {
    if (!step.branches) return;
    step.branches.forEach((b) => {
      if (pos[b.targetId]) return; // already placed
      const from = pos[step.id];
      if (!from) return;
      pos[b.targetId] = {
        x: from.x,
        y: from.y + from.h + GAP_Y,
        w: W,
        h: H,
      };
    });
  });

  return pos;
}

/* ── Arrow ────────────────────────────────────────────── */
function Arrow({ x1, y1, x2, y2, label }: {
  x1: number; y1: number; x2: number; y2: number; label?: string;
}) {
  // Use a smooth elbow path
  const isH = Math.abs(y1 - y2) < 6;
  const isV = Math.abs(x1 - x2) < 6;
  let d: string;

  if (isH) {
    d = `M ${x1} ${y1} L ${x2} ${y2}`;
  } else if (isV) {
    d = `M ${x1} ${y1} L ${x2} ${y2}`;
  } else {
    // elbow: go horizontal first then vertical
    d = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`;
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g>
      <path d={d} fill="none" stroke="#94a3b8" strokeWidth={2}
        markerEnd="url(#arrowhead)" strokeLinejoin="round" />
      {label && (
        <text x={midX + 4} y={midY - 5} fontSize={11} fill="#64748b" fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  );
}

/* ── Node ─────────────────────────────────────────────── */
function Node({ step, x, y, w, h, isFirst, isLast }: {
  step: FlowStep; x: number; y: number; w: number; h: number;
  isFirst: boolean; isLast: boolean;
}) {
  const isDiamond = step.shape === "diamond";
  const color = isDiamond ? C.diamond : isFirst ? C.start : isLast ? C.end : C.normal;

  const badgeText = isFirst ? "MULAI" : isLast ? "SELESAI" : null;
  const badgeBg = isFirst ? "#3b82f6" : "#22c55e";
  const badgeW = isFirst ? 46 : 56;

  if (isDiamond) {
    const cx = x + w / 2, cy = y + h / 2;
    const hw = w / 2 - 2, hh = h / 2 - 2;
    return (
      <g>
        <polygon
          points={`${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`}
          fill={color.bg} stroke={color.border} strokeWidth={2}
        />
        <foreignObject x={x + 14} y={y + 10} width={w - 28} height={h - 20}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", textAlign: "center", fontSize: "11px",
            fontWeight: 700, color: color.text, lineHeight: 1.3,
          }}>
            {step.label}
          </div>
        </foreignObject>
        {badgeText && (
          <g>
            <rect x={x + w / 2 - badgeW / 2} y={y - 8} width={badgeW} height={16} rx={8} fill={badgeBg} />
            <text x={x + w / 2} y={y + 3} fontSize={9} fill="white" fontWeight={700} textAnchor="middle">
              {badgeText}
            </text>
          </g>
        )}
      </g>
    );
  }

  const rx = isFirst || isLast ? 28 : 10;
  return (
    <g>
      <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx={rx}
        fill={color.bg} stroke={color.border} strokeWidth={2} />
      <foreignObject x={x + 10} y={y + 6} width={w - 20} height={h - 12}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100%", textAlign: "center", fontSize: "12px",
          fontWeight: 600, color: color.text, lineHeight: 1.3,
        }}>
          {step.label}
        </div>
      </foreignObject>
      {badgeText && (
        <g>
          <rect x={x + w / 2 - badgeW / 2} y={y - 8} width={badgeW} height={16} rx={8} fill={badgeBg} />
          <text x={x + w / 2} y={y + 3} fontSize={9} fill="white" fontWeight={700} textAnchor="middle">
            {badgeText}
          </text>
        </g>
      )}
    </g>
  );
}

/* ── Main component ───────────────────────────────────── */
export function FlowChart({ steps, perRow = 3, className }: Props) {
  const pos = buildLayout(steps, perRow);

  // Canvas size
  const allX = Object.values(pos).map((p) => p.x + p.w);
  const allY = Object.values(pos).map((p) => p.y + p.h);
  const svgW = Math.max(...allX) + 32;
  const svgH = Math.max(...allY) + 32;

  // Which steps are "main" (no branch-only marker, just ordered)
  const mainSteps = steps;

  // Build edges (snake connectors + branch arrows)
  const edges: React.ReactNode[] = [];

  mainSteps.forEach((step, i) => {
    const from = pos[step.id];
    if (!from) return;

    if (step.branches) {
      // For diamond with branches, draw the first branch going right (next main),
      // and second branch going down.
      step.branches.forEach((b, bi) => {
        const to = pos[b.targetId];
        if (!to) return;
        const isNextMain = mainSteps[i + 1]?.id === b.targetId;

        if (isNextMain) {
          // Arrow sideways from diamond depending on row direction
          const fromRow = Math.round((from.y - 24) / (H + GAP_Y));
          const isEvenFromRow = fromRow % 2 === 0;

          const x1 = isEvenFromRow ? from.x + from.w : from.x;
          const x2 = isEvenFromRow ? to.x : to.x + to.w;

          edges.push(
            <Arrow key={`${step.id}-${b.targetId}`}
              x1={x1} y1={from.y + from.h / 2}
              x2={x2} y2={to.y + to.h / 2}
              label={b.label} />
          );
        } else {
          // Arrow down from diamond (non-next main)
          const startX = from.x + from.w / 2;
          const startY = from.y + from.h;
          const endX = to.x + to.w / 2;
          const endY = to.y;
          
          // Draw a Z-curve: down, horizontal, down
          const midY = startY + GAP_Y / 2;
          const d = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
          
          edges.push(
            <g key={`${step.id}-${b.targetId}`}>
              <path d={d} fill="none" stroke="#94a3b8" strokeWidth={2}
                markerEnd="url(#arrowhead)" strokeLinejoin="round" />
              {b.label && (
                <text x={(startX + endX) / 2} y={midY - 4} fontSize={11} fill="#64748b" fontWeight={700} textAnchor="middle">
                  {b.label}
                </text>
              )}
            </g>
          );
        }
      });
    } else if (i < mainSteps.length - 1) {
      const next = mainSteps[i + 1];
      // Skip if next is a branch-only target
      const to = pos[next.id];
      if (!to) return;

      const fromRow = Math.round((from.y - 24) / (H + GAP_Y));
      const toRow = Math.round((to.y - 24) / (H + GAP_Y));

      if (fromRow === toRow) {
        // Same row — horizontal arrow (direction depends on even/odd row)
        const goingRight = from.x < to.x;
        const x1 = goingRight ? from.x + from.w : from.x;
        const x2 = goingRight ? to.x : to.x + to.w;
        edges.push(
          <Arrow key={`${step.id}-${next.id}`}
            x1={x1} y1={from.y + from.h / 2}
            x2={x2} y2={to.y + to.h / 2} />
        );
      } else {
        // Row wrap: arrow goes from bottom-right of last node in row,
        // down the right side, then to top-left of first node in next row.
        // We draw a U-turn with an elbow.
        const isEvenFromRow = fromRow % 2 === 0;
        const fromXEdge = isEvenFromRow ? from.x + from.w : from.x;
        const toXEdge = isEvenFromRow ? to.x + to.w : to.x;
        const elbowX = isEvenFromRow
          ? fromXEdge + GAP_X / 2   // right side elbow
          : fromXEdge - GAP_X / 2;  // left side elbow

        // U-turn elbow: right → down → left (or left → down → right)
        const d = `M ${fromXEdge} ${from.y + from.h / 2} `
          + `L ${elbowX} ${from.y + from.h / 2} `
          + `L ${elbowX} ${to.y + to.h / 2} `
          + `L ${toXEdge} ${to.y + to.h / 2}`;

        edges.push(
          <g key={`${step.id}-${next.id}`}>
            <path d={d} fill="none" stroke="#94a3b8" strokeWidth={2}
              markerEnd="url(#arrowhead)" strokeLinejoin="round" strokeLinecap="round" />
          </g>
        );
      }
    }
  });

  const lastId = mainSteps[mainSteps.length - 1]?.id;

  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-slate-50 py-6 px-4", className)}>
      <svg
        width="100%"
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <marker id="arrowhead" markerWidth="7" markerHeight="5" refX="5" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="#94a3b8" />
          </marker>
        </defs>
        {edges}
        {mainSteps.map((step, i) => {
          const p = pos[step.id];
          if (!p) return null;
          return (
            <Node key={step.id} step={step}
              x={p.x} y={p.y} w={p.w} h={p.h}
              isFirst={i === 0}
              isLast={step.id === lastId} />
          );
        })}
      </svg>
    </div>
  );
}
