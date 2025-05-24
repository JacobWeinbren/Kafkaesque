<script lang="ts">
	import { tick } from "svelte";
	import { CheckCircle, AlertCircle, Mail, Send } from "lucide-svelte";

	let form: HTMLFormElement;
	let emailInput: HTMLInputElement;
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
		}
		if (!emailInput.checkValidity()) {
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
		} catch (err: unknown) {
			console.error("Subscription error:", err);
			submitMessage =
				err instanceof Error
					? err.message
					: "An error occurred. Please try again.";
			submitStatus = "error";
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div
	class="card bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
>
	<div class="mb-6">
		<div class="flex items-center gap-3 mb-3">
			<div class="p-2 rounded-lg bg-emerald-600 text-white">
				<Mail class="w-5 h-5" />
			</div>
			<h3
				class="text-lg font-semibold text-slate-900 dark:text-slate-100"
			>
				Stay Updated
			</h3>
		</div>
		<p class="text-slate-600 dark:text-slate-400">
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
		<div>
			<label for="email-signup" class="form-label"> Email address </label>
			<input
				type="email"
				id="email-signup"
				name="email"
				required
				placeholder="you@example.com"
				class="form-input {customErrorMessage
					? 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20 dark:focus:ring-red-400/20 bg-red-50 dark:bg-red-950/20'
					: ''}"
				aria-describedby="email-error-message"
				aria-invalid={!!customErrorMessage}
				bind:this={emailInput}
				on:input={handleInput}
			/>

			{#if customErrorMessage}
				<div
					id="email-error-message"
					class="flex items-center text-red-600 dark:text-red-400 text-sm mt-2"
					role="alert"
				>
					<AlertCircle class="w-4 h-4 mr-2 flex-shrink-0" />
					{customErrorMessage}
				</div>
			{/if}
		</div>

		<button
			type="submit"
			class="w-full btn btn-primary"
			disabled={isSubmitting}
		>
			{#if isSubmitting}
				<div
					class="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
				></div>
				Subscribing...
			{:else if submitStatus === "success"}
				<CheckCircle class="w-4 h-4" />
				Subscribed!
			{:else}
				<Send class="w-4 h-4" />
				Subscribe
			{/if}
		</button>

		{#if submitMessage && submitStatus !== ""}
			<div
				class="p-3 rounded-lg mt-4 {submitStatus === 'success'
					? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700'
					: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'}"
				role="status"
				aria-live="polite"
			>
				<div class="flex items-start gap-2">
					{#if submitStatus === "success"}
						<CheckCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
					{:else}
						<AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5" />
					{/if}
					<div>
						<p class="font-medium text-sm">
							{submitStatus === "success" ? "Success!" : "Error"}
						</p>
						<p class="text-sm mt-1">
							{submitMessage}
						</p>
					</div>
				</div>
			</div>
		{/if}
	</form>
</div>
