import { useState, useRef } from "react";
import type { NeighborhoodStat } from "../types";

// CABA bounding box — derived from the seeder polygon data
const BOUNDS = {
  minLon: -58.536,
  maxLon: -58.332,
  minLat: -34.708,
  maxLat: -34.526,
};

const W = 600;
const H = 480;

function px(lon: number): number {
  return ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * W;
}

function py(lat: number): number {
  return ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H;
}

function toPath(ring: [number, number][]): string {
  return ring
    .map(([lon, lat], i) => `${i === 0 ? "M" : "L"}${px(lon).toFixed(1)},${py(lat).toFixed(1)}`)
    .join(" ") + " Z";
}

function nnColor(nn: number): string {
  if (nn >= 3) return "#991b1b";
  if (nn >= 1) return "#d97706";
  return "#64748b";
}

function nnFill(nn: number, reports: number): string {
  if (nn >= 3) return "rgba(153,27,27,0.22)";
  if (nn >= 1) return "rgba(217,119,6,0.18)";
  if (reports > 0) return "rgba(217,119,6,0.09)";
  return "#ffffff";
}

function nnStroke(nn: number, reports: number): string {
  if (nn >= 3) return "#991b1b";
  if (nn >= 1) return "#d97706";
  if (reports > 0) return "#d97706";
  return "#94a3b8";
}

function nnStrokeWidth(nn: number, reports: number): number {
  if (nn > 0 || reports > 0) return 1;
  return 0.5;
}

interface TooltipState {
  n: NeighborhoodStat;
  svgX: number;
  svgY: number;
}

interface CabaMapProps {
  neighborhoods: NeighborhoodStat[];
}

export default function CabaMap({ neighborhoods }: CabaMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const withPolygon = neighborhoods.filter((n) => n.polygon && n.polygon.length > 0);
  const withCentroid = neighborhoods.filter((n) => n.coordinates != null);
  const maxActivity = Math.max(...neighborhoods.map((n) => n.nn + n.reports), 1);

  function handleEnter(e: React.MouseEvent<SVGPathElement>, n: NeighborhoodStat) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;
    setTooltip({ n, svgX, svgY });
  }

  return (
    <div className="relative w-full h-full select-none">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        {/* Background — subtle blue-gray water tone */}
        <rect width={W} height={H} fill="#e8eef5" />

        {/* Neighborhood polygons */}
        {withPolygon.map((n) => (
          <path
            key={n.neighborhood}
            d={toPath(n.polygon!)}
            fill={nnFill(n.nn, n.reports)}
            stroke={nnStroke(n.nn, n.reports)}
            strokeWidth={nnStrokeWidth(n.nn, n.reports)}
            strokeOpacity={0.8}
            className="cursor-pointer transition-all duration-150"
            onMouseEnter={(e) => handleEnter(e, n)}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}

        {/* Centroid markers for active neighborhoods */}
        {withCentroid
          .filter((n) => n.nn > 0 || n.reports > 0)
          .map((n) => {
            const cx = px(n.coordinates![0]);
            const cy = py(n.coordinates![1]);
            const activity = n.nn + n.reports;
            const r = 5 + (activity / maxActivity) * 8;
            const color = nnColor(n.nn);
            return (
              <g
                key={`marker-${n.neighborhood}`}
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  const svg = svgRef.current;
                  if (!svg) return;
                  const rect = svg.getBoundingClientRect();
                  setTooltip({
                    n,
                    svgX: (e.clientX - rect.left) * (W / rect.width),
                    svgY: (e.clientY - rect.top) * (H / rect.height),
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {/* Pulse ring */}
                <circle cx={cx} cy={cy} r={r + 4} fill={color} opacity={0.12} />
                {/* Main dot */}
                <circle
                  cx={cx} cy={cy} r={r}
                  fill={color}
                  stroke="white"
                  strokeWidth={1.5}
                  style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))" }}
                />
                {/* Count */}
                {n.nn > 0 && (
                  <text
                    x={cx} y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={r > 9 ? 8 : 6.5}
                    fontWeight="800"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.nn}
                  </text>
                )}
              </g>
            );
          })}

        {/* Tooltip rendered inside SVG via foreignObject */}
        {tooltip && (() => {
          const flip = tooltip.svgX > W * 0.65;
          const x = flip ? tooltip.svgX - 160 : tooltip.svgX + 12;
          const y = Math.min(tooltip.svgY - 10, H - 90);
          return (
            <foreignObject x={x} y={y} width={148} height={84} style={{ pointerEvents: "none" }}>
              <div
                style={{ fontFamily: "inherit" }}
                className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs"
              >
                <p className="font-bold text-slate-900 leading-tight">{tooltip.n.neighborhood}</p>
                {tooltip.n.comuna != null && (
                  <p className="text-[10px] text-slate-400 mt-0.5">Comuna {tooltip.n.comuna}</p>
                )}
                <div className="flex gap-3 mt-1.5 pt-1.5 border-t border-slate-100">
                  <span className="text-[11px]">
                    NNA <strong className="text-[#991b1b]">{tooltip.n.nn}</strong>
                  </span>
                  <span className="text-[11px]">
                    Rep. <strong className="text-amber-700">{tooltip.n.reports}</strong>
                  </span>
                </div>
              </div>
            </foreignObject>
          );
        })()}
      </svg>
    </div>
  );
}
