"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

type PostsChartProps = {
	data: Array<{
		date: string;
		count: number;
	}>;
};

const chartConfig = {
	count: {
		label: "Posts",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function PostsChart({ data }: PostsChartProps) {
	// Format data for the chart
	const chartData = data.map((item) => ({
		date: new Date(item.date).toLocaleDateString("fr-FR", {
			day: "2-digit",
			month: "short",
		}),
		count: item.count,
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Posts créés (30 derniers jours)</CardTitle>
				<CardDescription>
					Nombre de posts créés par jour
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<BarChart data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar
							dataKey="count"
							fill="var(--color-count)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
