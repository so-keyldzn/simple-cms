import { ReactNode } from "react";
import Header from "@/components/common/site/header/header";
import Footer from "@/components/common/site/footer/footer";


interface SiteLayoutProps {
	children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
	return (

      
				<div className="min-h-screen bg-background">
					<Header />
					{children}
                    <Footer />
				</div>
			
	);
}
