<script lang="ts">
	import { tick } from "svelte";
	import { CheckCircle, AlertCircle } from "lucide-svelte";

	let form: HTMLFormElement;
	let messageEl: HTMLElement;
	let emailInput: HTMLInputElement;
	let emailErrorEl: HTMLElement;
	let isSubmitting = false;
	let submitMessage = "";
	let submitStatus: "success" | "error" | "" = "";
	let customErrorMessage = "";

	function handleInput() {
		if (customErrorMessage) {
			customErrorMessage = "";
		}
		if (submitStatus) {
			submitStatus = "";
			submitMessage = "";
		}
	}

	function validateEmail(): boolean {
		if (!emailInput) return false;

		emailInput.setCustomValidity("");

		if (emailInput.value.trim() === "") {
			customErrorMessage = "Please enter your email.";
			return false;
		} else if (!emailInput.checkValidity()) {
			customErrorMessage = "Please enter a valid email address.";
			return false;
		}
		customErrorMessage = "";
		return true;
	}

	async function handleSubmit() {
		if (!validateEmail()) {
			await tick();
			emailInput?.focus();
			return;
		}

		isSubmitting = true;
		submitStatus = "";
		submitMessage = "";
		customErrorMessage = "";

		try {
			const formData = new FormData(form);
			const response = await fetch("/api/signup", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.message || `HTTP error ${response.status}`
				);
			}

			submitMessage = data.message || "Successfully subscribed!";
			submitStatus = "success";
			form.reset();

			setTimeout(() => {
				submitStatus = "";
				submitMessage = "";
			}, 4000);
		} catch (err: any) {
			console.error("Subscription error:", err);
			submitMessage =
				err.message || "An error occurred. Please try again.";
			submitStatus = "error";
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div
	class="bg-green-50 border border-green-100 rounded-xl p-6 shadow-sm transition hover:shadow-md"
>
	<div class="mb-5">
		<h3 class="text-xl font-display font-bold text-slate-800 mb-2">
			Stay Updated
		</h3>
		<p class="text-slate-600 text-sm">
			Get notified about new posts on GIS, spatial analysis, and
			development.
		</p>
	</div>

	<form
		bind:this={form}
		on:submit|preventDefault={handleSubmit}
		class="space-y-4"
		novalidate
	>
		<div class="relative">
			<label
				for="email-signup"
				class="block text-sm font-medium text-slate-700 mb-1"
				>Email address</label
			>
			<input
				type="email"
				id="email-signup"
				name="email"
				required
				placeholder="you@example.com"
				class="w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition {customErrorMessage
					? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50'
					: 'border-slate-200'}"
				aria-describedby="email-error-message"
				aria-invalid={!!customErrorMessage}
				bind:this={emailInput}
				on:input={handleInput}
			/>
			{#if customErrorMessage}
				<div
					bind:this={emailErrorEl}
					id="email-error-message"
					class="flex items-center text-red-600 text-xs mt-1.5"
					role="alert"
				>
					<AlertCircle class="w-3.5 h-3.5 mr-1 flex-shrink-0" />
					{customErrorMessage}
				</div>
			{/if}
		</div>

		<button
			type="submit"
			class="w-full btn btn-primary text-sm py-2.5"
			disabled={isSubmitting}
		>
			{#if isSubmitting}
				<div
					class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
				></div>
				Subscribing...
			{:else if submitStatus === "success"}
				<CheckCircle class="w-4 h-4 mr-1.5" />
				Subscribed!
			{:else}
				Subscribe
			{/if}
		</button>

		{#if submitMessage && submitStatus !== ""}
			<div
				bind:this={messageEl}
				class="text-sm px-3 py-2 rounded-md mt-2 {submitStatus ===
				'success'
					? 'text-green-700 bg-green-100 border border-green-200'
					: 'text-red-700 bg-red-100 border border-red-200'}"
				role="status"
				aria-live="polite"
			>
				<div class="flex items-center">
					{#if submitStatus === "success"}
						<CheckCircle class="w-4 h-4 mr-1.5 flex-shrink-0" />
					{:else}
						<AlertCircle class="w-4 h-4 mr-1.5 flex-shrink-0" />
					{/if}
					{submitMessage}
				</div>
			</div>
		{/if}
	</form>
</div>
