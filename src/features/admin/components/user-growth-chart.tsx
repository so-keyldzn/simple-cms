"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
import { formatDate } from "@/lib/analytics-utils";

type UserGrowthChartProps = {
	data: Array<{
		date: string;
		count: number;
	}>;
};

const chartConfig = {
	count: {
		label: "Utilisateurs",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig;

export function UserGrowthChart({ data }: UserGrowthChartProps) {
	const chartData = data.map((item) => ({
		date: formatDate(item.date, "short"),
		count: item.count,
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Croissance des utilisateurs</CardTitle>
				<CardDescription>
					Nouveaux utilisateurs inscrits par jour
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<AreaChart data={chartData}>
						<defs>
							<linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-count)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-count)"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
						<Area
							dataKey="count"
							type="monotone"
							fill="url(#fillCount)"
							fillOpacity={0.4}
							stroke="var(--color-count)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
