import * as React from "react";

import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { navigate } from "astro:transitions/client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

const components: { title: string; href: string; description: string }[] = [
	{
		title: "Israeli Elections",
		href: "/docs/primitives/alert-dialog",
		description: "Geographic visualisation of Israeli elections from 1992.",
	},
	{
		title: "Housing",
		href: "/docs/primitives/hover-card",
		description:
			"Spatial mapping and charting of UK House prices from 2000-2022.",
	},
	{
		title: "Local Elections",
		href: "/docs/primitives/progress",
		description:
			"Visual mapping of British Local Elections in 2022 mapped.",
	},
	{
		title: "Hebrew Duolingo Flashcards",
		href: "/docs/primitives/progress",
		description:
			"A collaborative project to make all Hebrew Duolingo words as Anki flashcards.",
	},
	{
		title: "Israeli Local Data",
		href: "/docs/primitives/progress",
		description:
			"Local Area Data mapped from the CBS for Israeli localities",
	},
	{
		title: "British Local Data",
		href: "/docs/primitives/progress",
		description: "Mapped classification data from the ONS for LSOAs.",
	},
];

export default function NavigationMenuDemo() {
	return (
		<>
			<NavigationMenu className="hidden sm:block">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink
							className={navigationMenuTriggerStyle()}
							href="/"
						>
							About Me
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Projects</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
								{components.map((component) => (
									<ListItem
										key={component.title}
										title={component.title}
										href={component.href}
									>
										{component.description}
									</ListItem>
								))}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Blog</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
								<li className="row-span-3">
									<NavigationMenuLink asChild>
										<a
											className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
											href="/blog"
										>
											<div className="mb-2 mt-4 text-lg font-medium">
												Kafkaesque Blog
											</div>
											<p className="text-sm leading-tight text-muted-foreground">
												Home to my thoughts on
												literature, politics, and
												programming.
											</p>
										</a>
									</NavigationMenuLink>
								</li>
								<ListItem href="/archive" title="Archive">
									The definitive collection of all my posts to
									date.
								</ListItem>
								<ListItem
									href="https://www.thesocialreview.co.uk/author/jacobweinbren/"
									title="The Social Review"
								>
									My writings on politics and social
									democracy.
								</ListItem>
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
			<div className="block sm:hidden cursor-pointer">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline">Menu</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => navigate("/")}>
							About Me
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => navigate("/projects")}>
							Projects
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => navigate("/blog")}>
							Blog
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	);
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">
						{title}
					</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
