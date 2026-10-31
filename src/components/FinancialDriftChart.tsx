import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CurrencyCode, FinancialPeriod } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, AlertCircle, Info, Calendar, Sparkles, SlidersHorizontal } from 'lucide-react';

export interface DriftDataPoint {
  date: Date;
  label: string;
  forecast: number;
  actual: number;
  drift: number; // actual - forecast
  driftPct: number;
  milestone?: string;
  notes?: string;
}

interface FinancialDriftChartProps {
  selectedCurrency: CurrencyCode;
  selectedEntityId: string;
  selectedPeriod: FinancialPeriod;
}

export const FinancialDriftChart: React.FC<FinancialDriftChartProps> = ({
  selectedCurrency,
  selectedEntityId,
  selectedPeriod,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [granularity, setGranularity] = useState<'monthly' | 'weekly'>('monthly');
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'cumulative' | 'period'>('cumulative');
  const [activePoint, setActivePoint] = useState<DriftDataPoint | null>(null);

  // Generate realistic drift dataset based on entity and period
  const rawData: DriftDataPoint[] = React.useMemo(() => {
    // Entity multiplier
    let mult = 1.0;
    if (selectedEntityId === 'ENT-NA') mult = 0.55;
    else if (selectedEntityId === 'ENT-EMEA') mult = 0.22;
    else if (selectedEntityId === 'ENT-APAC') mult = 0.13;
    else if (selectedEntityId === 'ENT-BD') mult = 0.10;

    if (granularity === 'weekly') {
      const weeks = [
        { d: new Date(2026, 8, 7), label: 'W36 (Sep 7)', f: 14100000, a: 14050000, m: 'Payroll cycle', note: 'Bi-weekly global engineer payroll disbursement' },
        { d: new Date(2026, 8, 14), label: 'W37 (Sep 14)', f: 14250000, a: 14320000, m: 'Contract renewal', note: 'European enterprise SaaS subscription renewal' },
        { d: new Date(2026, 8, 21), label: 'W38 (Sep 21)', f: 14300000, a: 14280000, m: 'AWS billing', note: 'Routine cloud compute infrastructure wire' },
        { d: new Date(2026, 8, 28), label: 'W39 (Sep 28)', f: 14450000, a: 14590000, m: 'Dhaka Inflow', note: 'Dhaka R&D Center offshore export remittance & IT service receipt' },
        { d: new Date(2026, 9, 5), label: 'W40 (Oct 5)', f: 14480000, a: 14420000, m: 'Software licensing', note: 'Annual ERP software maintenance fee' },
        { d: new Date(2026, 9, 12), label: 'W41 (Oct 12)', f: 14520000, a: 14560000, note: 'Normal operating receivables inflow' },
        { d: new Date(2026, 9, 19), label: 'W42 (Oct 19)', f: 14550000, a: 14510000, m: 'Hardware deposit', note: 'Deposit for Nvidia GPU server blades' },
        { d: new Date(2026, 9, 26), label: 'W43 (Oct 26)', f: 14600000, a: 14820000, m: 'Apex Wire +$185k', note: 'Large multi-year customer prepayment wire received' },
      ];

      return weeks.map((w) => {
        const forecast = Math.round(w.f * mult);
        const actual = Math.round(w.a * mult);
        const drift = actual - forecast;
        return {
          date: w.d,
          label: w.label,
          forecast,
          actual,
          drift,
          driftPct: (drift / forecast) * 100,
          milestone: w.m,
          notes: w.note,
        };
      });
    }

    // Monthly data (Jan to Oct 2026)
    const months = [
      { d: new Date(2026, 0, 31), label: 'Jan 2026', f: 12100000, a: 12400000, m: 'Q1 Kickoff', note: 'Higher early contract renewals' },
      { d: new Date(2026, 1, 28), label: 'Feb 2026', f: 12600000, a: 12500000, note: 'Hardware CapEx pull-forward' },
      { d: new Date(2026, 2, 31), label: 'Mar 2026', f: 13000000, a: 13400000, m: 'Q1 Close Peak', note: 'Strong enterprise quarter-end billings' },
      { d: new Date(2026, 3, 30), label: 'Apr 2026', f: 13200000, a: 13100000, note: 'Estimated corporate tax distribution' },
      { d: new Date(2026, 4, 31), label: 'May 2026', f: 13500000, a: 13800000, m: 'EMEA Contract', note: 'New multi-year cloud tier signed in London' },
      { d: new Date(2026, 5, 30), label: 'Jun 2026', f: 13900000, a: 14200000, m: 'Q2 Close Peak', note: 'Mid-year audit and enterprise settlements' },
      { d: new Date(2026, 6, 31), label: 'Jul 2026', f: 14000000, a: 13900000, note: 'Summer collection float delay (net-45)' },
      { d: new Date(2026, 7, 31), label: 'Aug 2026', f: 14200000, a: 14400000, m: 'APAC Expansion', note: 'Tokyo data center tier licensing receipts' },
      { d: new Date(2026, 8, 30), label: 'Sep 2026', f: 14500000, a: 14600000, note: 'Q3 enterprise receivables collection' },
      { d: new Date(2026, 9, 31), label: 'Oct 2026', f: 14600000, a: 14820000, m: 'Treasury MM Sweep', note: 'Apex client wire + money market interest yield' },
    ];

    return months.map((m) => {
      const forecast = Math.round(m.f * mult);
      const actual = Math.round(m.a * mult);
      const drift = actual - forecast;
      return {
        date: m.d,
        label: m.label,
        forecast,
        actual,
        drift,
        driftPct: (drift / forecast) * 100,
        milestone: m.m,
        notes: m.note,
      };
    });
  }, [selectedEntityId, granularity]);

  // Overall drift metrics
  const latestPoint = rawData[rawData.length - 1];
  const netDrift = latestPoint ? latestPoint.drift : 0;
  const netDriftPct = latestPoint ? latestPoint.driftPct : 0;
  const maxForecast = d3.max(rawData, (d) => d.forecast) || 1;
  const avgAccuracy = Math.round(
    100 - (rawData.reduce((acc, d) => acc + Math.abs(d.drift), 0) / (maxForecast * rawData.length)) * 100
  );

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 760;
    const height = 280;
    const margin = { top: 25, right: 35, bottom: 35, left: 65 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(rawData, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    // Y Scale
    const yMin = d3.min(rawData, (d) => Math.min(d.actual, d.forecast) * 0.95) || 0;
    const yMax = d3.max(rawData, (d) => Math.max(d.actual, d.forecast) * 1.05) || 100;

    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]).nice();

    // Defs: Gradients
    const defs = svg.append('defs');

    // Positive drift gradient
    const greenGrad = defs
      .append('linearGradient')
      .attr('id', 'drift-positive-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    greenGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.35);
    greenGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.05);

    // Gridlines (horizontal)
    const yAxisGrid = d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => '');
    g.append('g')
      .attr('class', 'grid')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08);

    g.select('.grid .domain').remove();

    // Confidence Band Area (&plusmn;4% forecast buffer)
    if (showConfidenceBand) {
      const confArea = d3
        .area<DriftDataPoint>()
        .x((d) => xScale(d.date))
        .y0((d) => yScale(d.forecast * 0.96))
        .y1((d) => yScale(d.forecast * 1.04))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(rawData)
        .attr('fill', '#94a3b8')
        .attr('fill-opacity', 0.12)
        .attr('stroke', 'none')
        .attr('d', confArea);
    }

    // Drift Shaded Area (between actual and forecast)
    const driftArea = d3
      .area<DriftDataPoint>()
      .x((d) => xScale(d.date))
      .y0((d) => yScale(d.forecast))
      .y1((d) => yScale(d.actual))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(rawData)
      .attr('fill', 'url(#drift-positive-grad)')
      .attr('stroke', 'none')
      .attr('d', driftArea);

    // Forecasted Line (dashed, subtle)
    const forecastLine = d3
      .line<DriftDataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.forecast))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(rawData)
      .attr('fill', 'none')
      .attr('stroke', '#64748b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5 4')
      .attr('d', forecastLine);

    // Actual Realized Line (solid, prominent)
    const actualLine = d3
      .line<DriftDataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.actual))
      .curve(d3.curveMonotoneX);

    const actualPath = g
      .append('path')
      .datum(rawData)
      .attr('fill', 'none')
      .attr('stroke', '#059669')
      .attr('stroke-width', 2.5)
      .attr('d', actualLine);

    // Milestone Circles & Drift Variance Indicators
    rawData.forEach((pt) => {
      const x = xScale(pt.date);
      const y = yScale(pt.actual);

      if (pt.milestone) {
        // Milestone outer halo
        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 6)
          .attr('fill', '#10b981')
          .attr('fill-opacity', 0.25);

        g.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 3.5)
          .attr('fill', '#047857')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.5)
          .attr('cursor', 'pointer')
          .on('click', () => setActivePoint(pt));
      }
    });

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(granularity === 'weekly' ? 6 : 8)
      .tickFormat((d) => d3.timeFormat(granularity === 'weekly' ? '%b %d' : '%b')(d as Date));

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.6);

    g.selectAll('.domain').attr('stroke-opacity', 0.2);

    // Y Axis (Compact financial format)
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => formatCurrency(d as number, selectedCurrency, true));

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', '10px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.7);

    // Crosshair overlay group
    const focusGroup = g.append('g').style('display', 'none');

    const focusLine = focusGroup
      .append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 3');

    const focusDotActual = focusGroup
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', '#059669')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    const focusDotForecast = focusGroup
      .append('circle')
      .attr('r', 4)
      .attr('fill', '#64748b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5);

    // Bisector for tracking mouse
    const bisectDate = d3.bisector<DriftDataPoint, Date>((d) => d.date).center;

    // Overlay rect to capture pointer events
    svg
      .append('rect')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', () => focusGroup.style('display', null))
      .on('mouseleave', () => {
        focusGroup.style('display', 'none');
      })
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const x0 = xScale.invert(mx);
        const idx = bisectDate(rawData, x0, 0, rawData.length - 1);
        const pt = rawData[idx];

        if (pt) {
          const px = xScale(pt.date);
          focusLine.attr('x1', px).attr('x2', px);
          focusDotActual.attr('cx', px).attr('cy', yScale(pt.actual));
          focusDotForecast.attr('cx', px).attr('cy', yScale(pt.forecast));
          setActivePoint(pt);
        }
      });
  }, [rawData, showConfidenceBand, granularity, selectedCurrency]);

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-4">
      {/* Chart Header & Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Financial Drift Analysis: Forecast vs. Actual Cash Flow</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              D3 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time divergence modeling between approved budget forecasts and actual bank-cleared treasury liquidity.
          </p>
        </div>

        {/* Granularity & View Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Confidence interval toggle */}
          <button
            onClick={() => setShowConfidenceBand(!showConfidenceBand)}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors flex items-center gap-1.5 ${
              showConfidenceBand
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                : 'text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>&plusmn;4% Corridor</span>
          </button>

          {/* Granularity Switcher */}
          <div className="inline-flex rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setGranularity('monthly')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                granularity === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                granularity === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Weekly Rolling
            </button>
          </div>
        </div>
      </div>

      {/* KPI Micro-Strip for Drift Summary with Vibrant Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-gradient-to-b from-emerald-500/10 to-transparent dark:from-emerald-500/15 dark:to-transparent border border-emerald-200 dark:border-emerald-800/80 border-t-2 border-t-emerald-500 rounded-lg shadow-2xs">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Actual Cleared Liquidity</span>
          <span className="font-mono font-bold text-base text-slate-900 dark:text-white mt-1 block">
            {formatCurrency(latestPoint?.actual || 0, selectedCurrency, true)}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Reconciled bank &amp; GL feed</span>
        </div>

        <div className="p-3 bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-500/15 dark:to-transparent border border-indigo-200 dark:border-indigo-800/80 border-t-2 border-t-indigo-500 rounded-lg shadow-2xs">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Forecast Budget Baseline</span>
          <span className="font-mono font-bold text-base text-slate-700 dark:text-slate-200 mt-1 block">
            {formatCurrency(latestPoint?.forecast || 0, selectedCurrency, true)}
          </span>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Treasury statistical plan</span>
        </div>

        <div className="p-3 bg-gradient-to-b from-teal-500/10 to-transparent dark:from-teal-500/15 dark:to-transparent border border-teal-200 dark:border-teal-800/80 border-t-2 border-t-teal-500 rounded-lg shadow-2xs">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Net Financial Drift</span>
          <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            +{formatCurrency(netDrift, selectedCurrency, true)} ({netDriftPct > 0 ? '+' : ''}{netDriftPct.toFixed(2)}%)
          </span>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Favorable cash surplus</span>
        </div>

        <div className="p-3 bg-gradient-to-b from-violet-500/10 to-transparent dark:from-violet-500/15 dark:to-transparent border border-violet-200 dark:border-violet-800/80 border-t-2 border-t-violet-500 rounded-lg shadow-2xs">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Variance Precision Score</span>
          <span className="font-mono font-bold text-base text-violet-600 dark:text-violet-400 mt-1 block">
            {avgAccuracy}%
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Within &plusmn;4% corridor</span>
        </div>
      </div>

      {/* D3 SVG Viewport */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-slate-50/40 dark:bg-slate-950/40 rounded-lg border border-slate-100 dark:border-slate-800/60 p-2">
        <svg ref={svgRef} className="w-full h-auto text-slate-700 dark:text-slate-300" />
      </div>

      {/* Dynamic Hover/Inspection Panel with Vibrant Highlights */}
      {activePoint ? (
        <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/40 dark:to-cyan-950/30 border border-emerald-300 dark:border-emerald-700/60 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-900 dark:text-white font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700">
              {activePoint.label}
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              Actual: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{formatCurrency(activePoint.actual, selectedCurrency)}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
            <span className="text-slate-600 dark:text-slate-300">
              Forecast: <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">{formatCurrency(activePoint.forecast, selectedCurrency)}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-100/70 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
              Drift: {activePoint.drift > 0 ? '+' : ''}{formatCurrency(activePoint.drift, selectedCurrency)} ({activePoint.driftPct > 0 ? '+' : ''}{activePoint.driftPct.toFixed(1)}%)
            </span>
          </div>

          {activePoint.milestone && (
            <div className="text-[11px] text-slate-700 dark:text-slate-200 flex items-center gap-1.5 font-sans bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span><strong>{activePoint.milestone}:</strong> {activePoint.notes}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-500 flex items-center justify-between">
          <span>Hover over any data point or click on an event milestone below to inspect granular actual vs forecast variance.</span>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Interactive D3 Engine</span>
        </div>
      )}

      {/* Interactive Milestone Spotlight Bar */}
      <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
        <span className="text-slate-500 font-medium text-[11px]">Key Fiscal Milestones:</span>
        {rawData.filter((p) => p.milestone).map((m) => (
          <button
            key={m.label}
            onClick={() => setActivePoint(m)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activePoint?.label === m.label
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300'
            }`}
          >
            {m.milestone} ({m.label})
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Actual Realized Cash Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-0.5 bg-indigo-400 border-b border-dashed border-indigo-500" />
            <span>Budgeted Forecast Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-2.5 bg-gradient-to-b from-emerald-500/30 to-cyan-500/10 rounded-xs" />
            <span>Favorable Drift Area</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-300 dark:ring-emerald-800" />
            <span>Milestone Marker (Click to inspect)</span>
          </div>
        </div>

        <span className="font-mono text-slate-400">Tolerance Threshold: &plusmn;5% SOX Tier</span>
      </div>
    </div>
  );
};
