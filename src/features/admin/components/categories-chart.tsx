"use client";

import { Pie, PieChart } from "recharts";
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
	ChartLegend,
	ChartLegendContent,
} from "@/components/ui/chart";

type CategoriesChartProps = {
	data: Array<{
		id: string;
		name: string;
		_count: {
			posts: number;
		};
	}>;
};

const chartColors = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

export function CategoriesChart({ data }: CategoriesChartProps) {
	// Create chart config dynamically
	const chartConfig: ChartConfig = data.reduce((acc, category, index) => {
		acc[category.id] = {
			label: category.name,
			color: chartColors[index % chartColors.length],
		};
		return acc;
	}, {} as ChartConfig);

	// Format data for the chart - use id as unique key
	const chartData = data.map((category, index) => ({
		id: category.id,
		category: category.name,
		posts: category._count.posts,
		fill: chartColors[index % chartColors.length],
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Distribution des catégories</CardTitle>
				<CardDescription>
					Répartition des posts par catégorie
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<PieChart>
						<ChartTooltip content={<ChartTooltipContent nameKey="id" />} />
						<ChartLegend content={<ChartLegendContent nameKey="id" />} />
						<Pie
							data={chartData}
							dataKey="posts"
							nameKey="id"
							cx="50%"
							cy="50%"
							outerRadius={80}
							label
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
