"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from "@/components/ui/item";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { formatDate } from "@/lib/analytics-utils";

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
		date: formatDate(item.date, "short"),
		count: item.count,
	}));

	return (
		<Item variant="outline">
			<ItemHeader>
				<ItemContent>
					<ItemTitle>Posts créés (30 derniers jours)</ItemTitle>
					<ItemDescription>
						Nombre de posts créés par jour
					</ItemDescription>
				</ItemContent>
			</ItemHeader>
			<ItemContent className="p-4">
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
			</ItemContent>
		</Item>
	);
}
