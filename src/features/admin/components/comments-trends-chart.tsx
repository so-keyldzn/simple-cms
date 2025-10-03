"use client";

import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatDate } from "@/lib/analytics-utils";

type CommentsTrendsChartProps = {
	data: Array<{
		date: string;
		approved: number;
		pending: number;
		rejected: number;
	}>;
};

const chartConfig = {
	approved: {
		label: "Approuvés",
		color: "var(--chart-1)",
	},
	pending: {
		label: "En attente",
		color: "var(--chart-4)",
	},
	rejected: {
		label: "Rejetés",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

export function CommentsTrendsChart({ data }: CommentsTrendsChartProps) {
	const chartData = data.map((item) => ({
		date: formatDate(item.date, "short"),
		approved: item.approved,
		pending: item.pending,
		rejected: item.rejected,
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Tendances des commentaires</CardTitle>
				<CardDescription>
					Évolution des commentaires par statut
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<LineChart data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Line
							dataKey="approved"
							type="monotone"
							stroke="var(--color-approved)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							dataKey="pending"
							type="monotone"
							stroke="var(--color-pending)"
							strokeWidth={2}
							dot={false}
						/>
						<Line
							dataKey="rejected"
							type="monotone"
							stroke="var(--color-rejected)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
