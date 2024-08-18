<script>
	import { darken } from "color2k";

	export let href;
	export let color = undefined;
	export let className = "";

	$: style = color
		? `background-color: ${color}; border-color: ${darken(color, 0.2)};`
		: "";
</script>

<a {href} class="inline-block {className}">
	<button
		type="button"
		class="p-3 text-white border-2 border-b-4 active:border-b-2 rounded-2xl active:translate-y-[2px] font-bold text-[15px] hover:text-opacity-80 flex items-center"
		{style}
	>
		<slot />
	</button>
</a>
