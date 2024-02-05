import * as React from "react";
import {
	Dropdown,
	DropdownTrigger,
	DropdownMenu,
	DropdownItem,
	Button,
} from "@nextui-org/react";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
	const [theme, setThemeState] = React.useState<
		"theme-light" | "dark" | "system"
	>("system");

	const updateAllDataWrapperSrc = (isDark) => {
		const dataWrapperScripts = document.querySelectorAll(
			'iframe[src*="datawrapper.dwcdn.net/"]'
		);
		dataWrapperScripts.forEach((script) => {
			const src = script.getAttribute("src");
			const newSrc =
				src.split("?")[0] + `?dark=${isDark ? "true" : "false"}`;
			script.setAttribute("src", newSrc);
		});
	};

	React.useEffect(() => {
		const isDarkMode = document.documentElement.classList.contains("dark");
		setThemeState(isDarkMode ? "dark" : "theme-light");
	}, []);

	React.useEffect(() => {
		let isDark;
		if (theme === "system") {
			isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		} else {
			isDark = theme === "dark";
		}
		document.documentElement.classList[isDark ? "add" : "remove"]("dark");
		localStorage.setItem("theme", isDark ? "dark" : "light");
		updateAllDataWrapperSrc(isDark);
	}, [theme]);

	return (
		<Dropdown>
			<DropdownTrigger>
				<Button
					variant="flat"
					className="flex items-center justify-center"
				>
					<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
				</Button>
			</DropdownTrigger>
			<DropdownMenu
				aria-label="Theme Selection"
				className="border shadow rounded z-20 w-24 bg-white dark:bg-black"
			>
				<DropdownItem
					key="light"
					textValue="Light"
					className="text-sm"
					onClick={() => setThemeState("theme-light")}
				>
					Light
				</DropdownItem>
				<DropdownItem
					key="dark"
					textValue="Dark"
					className="text-sm"
					onClick={() => setThemeState("dark")}
				>
					Dark
				</DropdownItem>
				<DropdownItem
					key="system"
					textValue="System"
					className="text-sm"
					onClick={() => setThemeState("system")}
				>
					System
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}
