import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useHistory } from '../hooks/useHistory.js';

function formatDate(day) {
  const d = new Date(day);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ChartSkeleton() {
  return (
    <div className="h-64 w-full">
      <div className="skeleton h-full w-full rounded-xl" />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="grid h-64 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
      <div>
        <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-slate-400">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d="M4 19V5m0 14h16M4 15l4-5 3 3 5-7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">{message}</p>
        <p className="mt-1 text-xs text-slate-400">
          History builds daily as rates are captured.
        </p>
      </div>
    </div>
  );
}

export default function TrendChart({ base, target }) {
  const { data, loading, error } = useHistory(base, target, 30);

  const points = data?.points ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900">30-day trend</h2>
          <p className="text-xs text-slate-500">
            {base} → {target}
          </p>
        </div>
        {data && !data.building && (
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
            {points.length} data points
          </span>
        )}
      </div>

      {loading && <ChartSkeleton />}

      {!loading && error && <EmptyState message="Couldn’t load history" />}

      {!loading && !error && points.length < 5 && (
        <EmptyState message="Building history…" />
      )}

      {!loading && !error && points.length >= 5 && (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                minTickGap={24}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => v.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${target}`,
                  `1 ${base}`,
                ]}
                labelFormatter={formatDate}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 32px -8px rgba(16,24,40,0.18)',
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3563ff"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
