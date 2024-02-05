import React from "react";
import {
	Navbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	Link,
	Button,
	NavbarMenu,
	NavbarMenuToggle,
	NavbarMenuItem,
} from "@nextui-org/react";
import { ModeToggle } from "@/components/ModeToggle";

export default function App() {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);

	const menuItems = [
		{ name: "About Me", link: "/" },
		{ name: "Projects", link: "/projects" },
		{ name: "Blog", link: "/blog" },
		{ name: "Search", link: "/search" },
	];

	return (
		<Navbar onMenuOpenChange={setIsMenuOpen}>
			<NavbarContent justify="start">
				<NavbarMenuToggle
					aria-label={isMenuOpen ? "Close menu" : "Open menu"}
					className="sm:hidden"
				/>
				<NavbarItem>
					<a href="/" className="mr-6 font-medium leading-5">
						Jacob Weinbren
					</a>
				</NavbarItem>
				<div className="hidden sm:flex gap-8">
					<NavbarItem>
						<Link href="/" className="text-sm">
							About Me
						</Link>
					</NavbarItem>
					<NavbarItem>
						<Link href="/projects" className="text-sm">
							Projects
						</Link>
					</NavbarItem>
					<NavbarItem>
						<Link href="/blog" className="text-sm">
							Blog
						</Link>
					</NavbarItem>
					<NavbarItem>
						<Link href="/search" className="text-sm">
							Search
						</Link>
					</NavbarItem>
				</div>
			</NavbarContent>
			<NavbarContent justify="end">
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
							className="w-full text-sm"
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
