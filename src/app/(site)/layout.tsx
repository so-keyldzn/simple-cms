import { ReactNode } from "react";
import Header from "@/components/common/site/header/header";


interface SiteLayoutProps {
	children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
	return (

      
				<div className="min-h-screen bg-background">
					<Header />
					{children}
				</div>
			
	);
}
