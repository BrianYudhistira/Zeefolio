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

    const activeLinePaths = [];
    if (points.length > 1) {
        let currentRun = [];
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const isElevated = (prev.views || 0) > 0 || (curr.views || 0) > 0;
            if (isElevated) {
                if (currentRun.length === 0) {
                    currentRun.push(prev);
                }
                currentRun.push(curr);
            } else if (currentRun.length > 0) {
                activeLinePaths.push(
                    currentRun
                        .map(
                            (p, idx) =>
                                `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
                        )
                        .join(" ")
                );
                currentRun = [];
            }
        }
        if (currentRun.length > 0) {
            activeLinePaths.push(
                currentRun
                    .map(
                        (p, idx) =>
                            `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
                    )
                    .join(" ")
            );
        }
    }

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

    const lastPoint = points.length > 0 ? points[points.length - 1] : null;

    return (
        <div className="admin-card rounded-xl border p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            {/* Header & Time Range Filters */}
            <div className="flex items-center justify-between gap-2.5">
                <div className="min-w-0">
                    <h2 className="text-sm font-medium text-[var(--text)]">
                        Portfolio Views
                    </h2>
                    <p className="hidden sm:block text-xs text-[var(--text-muted)]">
                        Visitor activity on your public portfolio
                    </p>
                </div>

                {/* Mobile Compact Range Select */}
                <select
                    value={range}
                    disabled={isLoading}
                    onChange={(e) => onRangeChange?.(e.target.value)}
                    aria-label="Select time range"
                    className="sm:hidden admin-input text-xs font-medium px-2.5 py-1.5 pr-7 rounded-lg border focus:ring-0 outline-none"
                >
                    {RANGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.mobileLabel}
                        </option>
                    ))}
                </select>

                {/* Desktop Segmented Filter Pills */}
                <div className="hidden sm:flex admin-pill-track items-center gap-1 p-1 rounded-lg border">
                    {RANGE_OPTIONS.map((opt) => {
                        const active = range === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={isLoading}
                                onClick={() => onRangeChange?.(opt.value)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--orange)] ${active
                                    ? "admin-pill-active"
                                    : "admin-pill-inactive"
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
                <div className="admin-well rounded-lg border px-3 py-2 sm:px-3.5 sm:py-2.5">
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                        Views ({range.toUpperCase()})
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-[var(--text)] mt-0.5">
                        {rangeViews.toLocaleString()}
                    </p>
                </div>
                <div className="admin-well rounded-lg border px-3 py-2 sm:px-3.5 sm:py-2.5">
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                        <span className="sm:hidden">Unique</span>
                        <span className="hidden sm:inline">Unique Visitors</span>
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-[var(--text)] mt-0.5">
                        {uniqueVisitors.toLocaleString()}
                    </p>
                </div>
                <div className="admin-well rounded-lg border px-3 py-2 sm:px-3.5 sm:py-2.5">
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                        <span className="sm:hidden">Highest</span>
                        <span className="hidden sm:inline">Highest Views</span>
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-[var(--text)] mt-0.5">
                        {peakViews.toLocaleString()}
                    </p>
                </div>
                <div className="admin-well rounded-lg border px-3 py-2 sm:px-3.5 sm:py-2.5">
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                        <span className="sm:hidden">Total</span>
                        <span className="hidden sm:inline">Total Views</span>
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-[var(--text)] mt-0.5">
                        {totalViews.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Interactive SVG Area Chart */}
            <div className="relative w-full">
                {activePoint && (
                    <div
                        className="pointer-events-none absolute top-1 z-10 px-2.5 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-strong)] shadow-xl text-xs whitespace-nowrap"
                        style={{
                            left: `${Math.min(
                                82,
                                Math.max(8, (activePoint.x / width) * 100)
                            )}%`,
                            transform: "translateX(-50%)",
                        }}
                    >
                        <p className="text-[10px] text-[var(--text-muted)]">
                            {activePoint.fullLabel}
                        </p>
                        <p className="text-xs font-semibold text-[var(--orange-soft)]">
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
                                stopColor="var(--orange)"
                                stopOpacity="0.18"
                            />
                            <stop
                                offset="100%"
                                stopColor="var(--orange)"
                                stopOpacity="0"
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
                                    stroke="var(--border)"
                                    strokeOpacity="0.9"
                                    strokeDasharray="3 3"
                                />
                                <text
                                    x={padLeft - 8}
                                    y={y + 3}
                                    textAnchor="end"
                                    fill="var(--text-muted)"
                                    className="text-[10px]"
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

                    {/* Dimmed Baseline Path (including flat 0 segments) */}
                    {linePath && (
                        <path
                            d={linePath}
                            fill="none"
                            stroke="var(--orange)"
                            strokeOpacity="0.28"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Highlighted Non-Zero / Rising Line Segments */}
                    {activeLinePaths.map((segPath, idx) => (
                        <path
                            key={idx}
                            d={segPath}
                            fill="none"
                            stroke="var(--orange)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}

                    {/* Clean Endpoint Marker */}
                    {lastPoint && (
                        <g>
                            <circle
                                cx={lastPoint.x}
                                cy={lastPoint.y}
                                r="5.5"
                                fill="var(--orange)"
                                fillOpacity="0.18"
                            />
                            <circle
                                cx={lastPoint.x}
                                cy={lastPoint.y}
                                r="2.75"
                                fill="var(--orange-text)"
                                stroke="var(--surface)"
                                strokeWidth="1.5"
                            />
                        </g>
                    )}

                    {/* Active Hover Guide & Dot */}
                    {activePoint && (
                        <g>
                            <line
                                x1={activePoint.x}
                                y1={padTop}
                                x2={activePoint.x}
                                y2={padTop + plotHeight}
                                stroke="var(--text-muted)"
                                strokeOpacity="0.4"
                                strokeDasharray="3 3"
                            />
                            <circle
                                cx={activePoint.x}
                                cy={activePoint.y}
                                r="5"
                                fill="var(--orange)"
                                fillOpacity="0.22"
                            />
                            <circle
                                cx={activePoint.x}
                                cy={activePoint.y}
                                r="3"
                                fill="var(--orange-soft)"
                                stroke="var(--bg)"
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
                                fill="var(--text-muted)"
                                className="text-[10px]"
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

