import { useState } from "react";
import { HiOutlineEye } from "react-icons/hi2";

const RANGE_OPTIONS = [
    { value: "1h", label: "1H", mobileLabel: "Last 1 Hour (1H)" },
    { value: "5h", label: "5H", mobileLabel: "Last 5 Hours (5H)" },
    { value: "24h", label: "24H", mobileLabel: "Last 24 Hours (24H)" },
    { value: "1w", label: "1W", mobileLabel: "Last 7 Days (1W)" },
    { value: "1m", label: "1M", mobileLabel: "Last 30 Days (1M)" },
    { value: "3m", label: "3M", mobileLabel: "Last 3 Months (3M)" },
    { value: "6m", label: "6M", mobileLabel: "Last 6 Months (6M)" },
    { value: "1y", label: "1Y", mobileLabel: "Last 1 Year (1Y)" },
];

export default function ViewsChart({
    analytics = {},
    onRangeChange,
    isLoading = false,
}) {
    const {
        range = "24h",
        totalViews = 0,
        rangeViews = 0,
        uniqueVisitors = 0,
        peakViews = 0,
        series = [],
    } = analytics;

    const [hoveredIndex, setHoveredIndex] = useState(null);

    const width = 760;
    const height = 220;
    const padLeft = 36;
    const padRight = 16;
    const padTop = 18;
    const padBottom = 28;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    const maxVal = Math.max(4, ...series.map((d) => d.views || 0));
    const yTicks = [0, Math.ceil(maxVal / 2), maxVal];

    const points = series.map((item, idx) => {
        const x =
            series.length <= 1
                ? padLeft + plotWidth / 2
                : padLeft + (idx / (series.length - 1)) * plotWidth;
        const y =
            padTop + plotHeight - ((item.views || 0) / maxVal) * plotHeight;
        return { ...item, x, y, idx };
    });

    const linePath =
        points.length > 0
            ? points
                .map(
                    (p, i) =>
                        `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
                )
                .join(" ")
            : "";

    const areaPath =
        points.length > 0
            ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
                padTop + plotHeight
            ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(
                padTop + plotHeight
            ).toFixed(1)} Z`
            : "";

    const labelStep =
        series.length <= 8
            ? 1
            : series.length <= 15
                ? 2
                : series.length <= 24
                    ? 3
                    : 4;

    const activePoint =
        hoveredIndex !== null && points[hoveredIndex]
            ? points[hoveredIndex]
            : null;

    return (
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            {/* Header & Time Range Filters */}
            <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0">
                    <h2 className="text-sm font-medium text-zinc-100">
                        Portfolio Views
                    </h2>
                    <p className="hidden sm:block text-xs text-zinc-400">
                        Traffic overview across your public portfolio
                    </p>
                </div>

                {/* Mobile Compact Range Select */}
                <select
                    value={range}
                    disabled={isLoading}
                    onChange={(e) => onRangeChange?.(e.target.value)}
                    aria-label="Select time range"
                    className="sm:hidden text-xs font-medium px-2.5 py-1.5 pr-7 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-emerald-500/50 focus:ring-0 outline-none"
                >
                    {RANGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.mobileLabel}
                        </option>
                    ))}
                </select>

                {/* Desktop Segmented Filter Pills */}
                <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
                    {RANGE_OPTIONS.map((opt) => {
                        const active = range === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={isLoading}
                                onClick={() => onRangeChange?.(opt.value)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${active
                                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="rounded-lg bg-zinc-950/70 border border-zinc-800/80 px-3 py-2 sm:px-3.5 sm:py-2.5">
                    <p className="text-[11px] text-zinc-400 truncate">
                        Views ({range.toUpperCase()})
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-zinc-100 mt-0.5">
                        {rangeViews.toLocaleString()}
                    </p>
                </div>
                <div className="rounded-lg bg-zinc-950/70 border border-zinc-800/80 px-3 py-2 sm:px-3.5 sm:py-2.5">
                    <p className="text-[11px] text-zinc-400 truncate">
                        <span className="sm:hidden">Unique</span>
                        <span className="hidden sm:inline">Unique Visitors</span>
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-zinc-100 mt-0.5">
                        {uniqueVisitors.toLocaleString()}
                    </p>
                </div>
                <div className="rounded-lg bg-zinc-950/70 border border-zinc-800/80 px-3 py-2 sm:px-3.5 sm:py-2.5">
                    <p className="text-[11px] text-zinc-400 truncate">
                        <span className="sm:hidden">Peak</span>
                        <span className="hidden sm:inline">Peak Bucket</span>
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-zinc-100 mt-0.5">
                        {peakViews.toLocaleString()}
                    </p>
                </div>
                <div className="rounded-lg bg-zinc-950/70 border border-zinc-800/80 px-3 py-2 sm:px-3.5 sm:py-2.5">
                    <p className="text-[11px] text-zinc-400 truncate">
                        <span className="sm:hidden">All-Time</span>
                        <span className="hidden sm:inline">All-Time Views</span>
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-emerald-400 mt-0.5">
                        {totalViews.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Interactive SVG Area Chart */}
            <div className="relative w-full">
                {activePoint && (
                    <div
                        className="pointer-events-none absolute top-1 z-10 px-2.5 py-1.5 rounded-lg bg-zinc-950/95 border border-zinc-700 shadow-lg text-xs whitespace-nowrap"
                        style={{
                            left: `${Math.min(
                                82,
                                Math.max(8, (activePoint.x / width) * 100)
                            )}%`,
                            transform: "translateX(-50%)",
                        }}
                    >
                        <p className="text-[10px] text-zinc-400">
                            {activePoint.fullLabel}
                        </p>
                        <p className="text-xs font-semibold text-emerald-300">
                            {activePoint.views}{" "}
                            {activePoint.views === 1 ? "view" : "views"}
                        </p>
                    </div>
                )}

                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className={`w-full h-44 sm:h-60 overflow-visible select-none transition-opacity ${isLoading ? "opacity-60" : "opacity-100"
                        }`}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <defs>
                        <linearGradient
                            id="viewsAreaGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity="0.32"
                            />
                            <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity="0.0"
                            />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines & Y Labels */}
                    {yTicks.map((tick) => {
                        const y =
                            padTop +
                            plotHeight -
                            (tick / maxVal) * plotHeight;
                        return (
                            <g key={tick}>
                                <line
                                    x1={padLeft}
                                    y1={y}
                                    x2={width - padRight}
                                    y2={y}
                                    stroke="#27272a"
                                    strokeDasharray="3 3"
                                />
                                <text
                                    x={padLeft - 8}
                                    y={y + 3}
                                    textAnchor="end"
                                    className="fill-zinc-500 text-[10px]"
                                >
                                    {tick}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area Fill */}
                    {areaPath && (
                        <path d={areaPath} fill="url(#viewsAreaGrad)" />
                    )}

                    {/* Line Path */}
                    {linePath && (
                        <path
                            d={linePath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Active Hover Guide & Dot */}
                    {activePoint && (
                        <g>
                            <line
                                x1={activePoint.x}
                                y1={padTop}
                                x2={activePoint.x}
                                y2={padTop + plotHeight}
                                stroke="#52525b"
                                strokeDasharray="3 3"
                            />
                            <circle
                                cx={activePoint.x}
                                cy={activePoint.y}
                                r="5"
                                fill="#10b981"
                                fillOpacity="0.25"
                            />
                            <circle
                                cx={activePoint.x}
                                cy={activePoint.y}
                                r="3"
                                fill="#34d399"
                                stroke="#09090b"
                                strokeWidth="1.5"
                            />
                        </g>
                    )}

                    {/* X-Axis Labels */}
                    {points.map((p, idx) => {
                        const showLabel =
                            idx === 0 ||
                            idx === points.length - 1 ||
                            idx % labelStep === 0;
                        if (!showLabel) return null;
                        return (
                            <text
                                key={idx}
                                x={p.x}
                                y={height - 6}
                                textAnchor="middle"
                                className="fill-zinc-500 text-[10px]"
                            >
                                {p.label}
                            </text>
                        );
                    })}

                    {/* Invisible Hover Hit Targets */}
                    {points.map((p, idx) => {
                        const colWidth =
                            points.length > 1
                                ? plotWidth / (points.length - 1)
                                : plotWidth;
                        return (
                            <rect
                                key={idx}
                                x={p.x - colWidth / 2}
                                y={padTop}
                                width={colWidth}
                                height={plotHeight}
                                fill="transparent"
                                className="cursor-crosshair"
                                onMouseEnter={() => setHoveredIndex(idx)}
                            />
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

