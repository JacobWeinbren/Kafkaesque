import React from "react";
import {
	Navbar,
	NavbarContent,
	NavbarItem,
	Link,
	NavbarMenu,
	NavbarMenuToggle,
	NavbarMenuItem,
} from "@nextui-org/react";
import { ModeToggle } from "@/components/ModeToggle";

// Add a prop type for currentUrl
interface NavbarProps {
	currentUrl: string;
}

export default function App({ currentUrl }: NavbarProps) {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

	const menuItems = [
		{ name: "About Me", link: "/" },
		{ name: "Projects", link: "/projects" },
		{ name: "Blog", link: "/blog" },
		{ name: "Search", link: "/search" },
	];

	return (
		<Navbar onMenuOpenChange={setIsMenuOpen} className="[&>header]:p-4">
			<NavbarContent justify="start">
				<NavbarMenuToggle
					aria-label={isMenuOpen ? "Close menu" : "Open menu"}
					className="sm:hidden"
				/>
				<NavbarItem>
					<a
						href="/"
						className="mr-6 font-medium leading-5 no-underline"
					>
						Jacob Weinbren
					</a>
				</NavbarItem>
			</NavbarContent>
			<NavbarContent justify="end">
				<div className="hidden sm:flex gap-8 mr-4">
					{menuItems.map((item, index) => (
						<NavbarItem key={`${item.name}-${index}`}>
							<Link
								href={item.link}
								className={`text-sm font-normal ${
									currentUrl === item.link ||
									(item.link !== "/" &&
										currentUrl.startsWith(item.link))
										? "font-bold"
										: ""
								}`}
							>
								{item.name}
							</Link>
						</NavbarItem>
					))}
				</div>
				<NavbarItem>
					<ModeToggle />
				</NavbarItem>
			</NavbarContent>
			<NavbarMenu>
				{menuItems.map((item, index) => (
					<NavbarMenuItem key={`${item.name}-${index}`}>
						<Link
							color={
								index === 2
									? "primary"
									: index === menuItems.length - 1
									? "danger"
									: "foreground"
							}
							className="w-full"
							href={item.link}
							size="lg"
						>
							{item.name}
						</Link>
					</NavbarMenuItem>
				))}
			</NavbarMenu>
		</Navbar>
	);
}
