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

import Logo from "@/img/logo.png";
import { Image } from "astro:assets";

const components: { title: string; href: string; description: string }[] = [
	{
		title: "Israeli Elections",
		href: "/docs/primitives/alert-dialog",
		description: "Mapping all Israeli elections from 1992 to 2021.",
	},
	{
		title: "Housing",
		href: "/docs/primitives/hover-card",
		description:
			"UK House prices trends mapped and charted from 2000-2022.",
	},
	{
		title: "Local Elections",
		href: "/docs/primitives/progress",
		description: "British Local Elections in 2021 mapped and charted.",
	},
	{
		title: "Hebrew Duolingo Flashcards",
		href: "/docs/primitives/progress",
		description:
			"A collection of all the words on Hebrew Duolingo as Anki flashcards.",
	},
	{
		title: "Israeli Local Data",
		href: "/docs/primitives/progress",
		description:
			"Local Area Data from the Bureau of Statistics for Israeli Localities",
	},
	{
		title: "British Local Data",
		href: "/docs/primitives/progress",
		description:
			"Classification data from the Office of National Statistics for British Local Small Output Areas.",
	},
];

export default function NavigationMenuDemo() {
	return (
		<>
			<NavigationMenu className="hidden md:block">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink
							className={navigationMenuTriggerStyle()}
							href="/docs"
						>
							About Me
						</NavigationMenuLink>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Blog</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
								<li className="row-span-3">
									<NavigationMenuLink asChild>
										<a
											className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
											href="/"
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
								<ListItem href="/docs" title="Archive">
									The definitive collection of all my posts to
									date.
								</ListItem>
								<ListItem
									href="/docs/primitives/typography"
									title="The Social Review"
								>
									My writings on politics and social
									democracy.
								</ListItem>
							</ul>
						</NavigationMenuContent>
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
				</NavigationMenuList>
			</NavigationMenu>
			<NavigationMenu className="block md:hidden">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuTrigger>Menu</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-[150px] gap-1 p-4">
								<ListItem
									title="About Me"
									href="/about"
								></ListItem>
								<ListItem title="Blog" href="/"></ListItem>
								<ListItem
									title="Projects"
									href="/projects"
								></ListItem>
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
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
