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
	const THEME_KEY = "theme";
	const DARK_CLASS = "dark";
	const isLocalStorageAvailable = typeof localStorage !== "undefined";

	// Function to get the theme preference from localStorage or system preference
	const getThemePreference = (): "light" | "dark" | "system" => {
		if (isLocalStorageAvailable && localStorage.getItem(THEME_KEY)) {
			return localStorage.getItem(THEME_KEY) as
				| "light"
				| "dark"
				| "system";
		}
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	};

	const [theme, setThemeState] = React.useState<"light" | "dark" | "system">(
		getThemePreference()
	);

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
		// Applies the theme by toggling the "dark" class on the document element and updating local storage
		const applyTheme = (theme) => {
			const isDark = theme === "dark";
			document.documentElement.classList[isDark ? "add" : "remove"](
				DARK_CLASS
			);
			if (isLocalStorageAvailable) {
				localStorage.setItem(THEME_KEY, theme);
			}
			updateAllDataWrapperSrc(isDark);
		};

		if (theme === "system") {
			// Determine if the system prefers a dark theme
			const mediaQuery = window.matchMedia(
				"(prefers-color-scheme: dark)"
			);
			applyTheme(mediaQuery.matches ? "dark" : "light");
			// Listen for changes in the system's dark mode setting
			const mediaQueryChangeListener = (e) => {
				applyTheme(e.matches ? "dark" : "light");
			};
			// Use addEventListener to listen for changes in the system's theme preference
			mediaQuery.addEventListener("change", mediaQueryChangeListener);

			// Cleanup listener on component unmount or theme change
			return () =>
				mediaQuery.removeEventListener(
					"change",
					mediaQueryChangeListener
				);
		} else {
			applyTheme(theme);
		}
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
					onClick={() => setThemeState("light")}
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
