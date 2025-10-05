"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Folder } from "lucide-react";

type FolderBreadcrumbProps = {
	breadcrumb: Array<{ id: string; name: string; slug: string }>;
	onNavigate: (folderId: string) => void;
};

export const FolderBreadcrumb = memo(function FolderBreadcrumb({ breadcrumb, onNavigate }: FolderBreadcrumbProps) {
	const t = useTranslations();

	if (breadcrumb.length === 0) return null;

	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink
						onClick={() => onNavigate("")}
						className="cursor-pointer flex items-center gap-1"
					>
						<Folder className="h-3 w-3" />
						{t("admin.folders.root")}
					</BreadcrumbLink>
				</BreadcrumbItem>

				{breadcrumb.map((item, index) => (
					<div key={item.id} className="flex items-center gap-2">
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							{index === breadcrumb.length - 1 ? (
								<BreadcrumbPage>{item.name}</BreadcrumbPage>
							) : (
								<BreadcrumbLink
									onClick={() => onNavigate(item.id)}
									className="cursor-pointer"
								>
									{item.name}
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
});
