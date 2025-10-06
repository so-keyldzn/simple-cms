"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Item, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { bytesToMB } from "@/lib/analytics-utils";

type MediaStorageChartProps = {
	data: Array<{
		mimeType: string;
		count: number;
		size: number;
	}>;
};

const chartConfig = {
	size: {
		label: "Taille (MB)",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function MediaStorageChart({ data }: MediaStorageChartProps) {
	const chartData = useMemo(
		() =>
			data.map((item) => ({
				type: item.mimeType.split("/")[0] || item.mimeType,
				size: bytesToMB(item.size),
				count: item.count,
			})),
		[data]
	);

	return (
		<Item variant="outline">
			<ItemContent>
				<ItemTitle>Stockage média par type</ItemTitle>
				<ItemDescription>
					Utilisation du stockage par type de fichier
				</ItemDescription>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<BarChart data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="type"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => `${value} MB`}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={(value, name, props) => (
										<>
											<div className="flex items-center gap-2">
												<div className="text-sm">
													{`${value} MB (${props.payload.count} fichiers)`}
												</div>
											</div>
										</>
									)}
								/>
							}
						/>
						<Bar
							dataKey="size"
							fill="var(--color-size)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</ItemContent>
		</Item>
	);
}
