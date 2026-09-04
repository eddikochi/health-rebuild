import type { SeriesPoint } from "../domain/analytics";

interface ChartProps {
  title: string;
  unit: string;
  points: SeriesPoint[];
  goal?: number;
  goalLabel?: string;
}

function polyline(points: SeriesPoint[]): string {
  if (points.length === 0) return "";
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const n = points.length;
  return points
    .map((p, i) => {
      const x = n === 1 ? 50 : (i * 100) / (n - 1);
      const y = 10 + ((max - p.value) / range) * 80;
      return `${x},${y}`;
    })
    .join(" ");
}

function goalY(points: SeriesPoint[], goal: number): number | null {
  if (points.length === 0) return null;
  const values = points.map((p) => p.value);
  const min = Math.min(...values, goal);
  const max = Math.max(...values, goal);
  const range = max - min || 1;
  return 10 + ((max - goal) / range) * 80;
}

export function Chart({ title, unit, points, goal, goalLabel }: ChartProps) {
  const last = points[points.length - 1];
  const gy = goal != null ? goalY(points, goal) : null;

  return (
    <div className="card">
      <div className="eyebrow">{title}</div>
      {points.length === 0 ? (
        <p className="empty">Sem dados ainda. Registre para ver a tendência.</p>
      ) : (
        <>
          <h2>
            {last.value} {unit}
          </h2>
          <div className="chart">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              {gy != null && (
                <line
                  x1="0"
                  x2="100"
                  y1={gy}
                  y2={gy}
                  stroke="#777"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <polyline
                points={polyline(points)}
                fill="none"
                stroke="#ff5a1f"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          {goalLabel && <p className="muted">{goalLabel}</p>}
        </>
      )}
    </div>
  );
}
