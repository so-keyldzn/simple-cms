import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item";
import { FileText, MessageSquare, Users, Image } from "lucide-react";
import { useTranslations } from "next-intl";

type IconName = "FileText" | "MessageSquare" | "Users" | "Image";

type StatsCardProps = {
	title: string;
	value: string | number;
	description?: string;
	iconName: IconName;
	trend?: {
		value: number;
		isPositive: boolean;
	};
};

const iconMap = {
	FileText,
	MessageSquare,
	Users,
	Image,
};

export function StatsCard({
	title,
	value,
	description,
	iconName,
	trend,
}: StatsCardProps) {
	const t = useTranslations();
	const Icon = iconMap[iconName];

	return (
		<Item variant="outline">
			<ItemMedia variant="icon">
				<Icon className="h-4 w-4 text-muted-foreground" />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>{title}</ItemTitle>
				<div className="text-2xl font-bold">{value}</div>
				{description && (
					<ItemDescription>{description}</ItemDescription>
				)}
				{trend && (
					<p
						className={`text-xs mt-1 ${
							trend.isPositive ? "text-green-600" : "text-red-600"
						}`}
					>
						{trend.isPositive ? "+" : ""}
						{trend.value}% {t("admin.statsCard.vsLastMonth")}
					</p>
				)}
			</ItemContent>
		</Item>
	);
}
