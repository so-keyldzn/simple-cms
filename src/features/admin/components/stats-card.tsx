import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{description && (
					<p className="text-xs text-muted-foreground mt-1">{description}</p>
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
			</CardContent>
		</Card>
	);
}
