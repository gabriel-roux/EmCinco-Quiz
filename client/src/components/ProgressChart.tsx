import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface ProgressChartProps {
  landing: {
    now: string;
    week1: string;
    week2: string;
    week3: string;
    week4: string;
    start: string;
    base: string;
    building: string;
    momentum: string;
    mastery: string;
  };
}

export default function ProgressChart({ landing }: ProgressChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 border border-border shadow-lg mb-6 h-[280px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={[
            { name: landing.now, value: 20, label: landing.start },
            { name: landing.week1, value: 40, label: landing.base },
            {
              name: landing.week2,
              value: 65,
              label: landing.building,
            },
            {
              name: landing.week3,
              value: 85,
              label: landing.momentum,
            },
            {
              name: landing.week4,
              value: 100,
              label: landing.mastery,
            },
          ]}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient
              id="colorProgress"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#22c55e"
                stopOpacity={0.3}
              />
              <stop
                offset="100%"
                stopColor="#22c55e"
                stopOpacity={0.02}
              />
            </linearGradient>
            <linearGradient
              id="strokeGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#f97316" />
              <stop offset="65%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
            opacity={0.5}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "hsl(var(--muted-foreground))",
              fontSize: 11,
              fontWeight: 500,
            }}
            dy={10}
          />
          <YAxis hide domain={[0, 110]} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 10px 25px -3px rgb(0 0 0 / 0.15)",
              backgroundColor: "hsl(var(--card))",
              padding: "12px 16px",
            }}
            labelStyle={{
              fontWeight: 600,
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [`${value}%`, "Progresso"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#strokeGradient)"
            strokeWidth={4}
            fillOpacity={0.15}
            fill="url(#strokeGradient)"
            animationDuration={1500}
            dot={{
              fill: "hsl(var(--primary))",
              strokeWidth: 2,
              r: 5,
              stroke: "white",
            }}
            activeDot={{
              r: 7,
              stroke: "hsl(var(--primary))",
              strokeWidth: 3,
              fill: "white",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
