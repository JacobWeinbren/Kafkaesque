<!-- SignupForm.svelte -->
<script lang="ts">
	let form: HTMLFormElement;
	let messageEl: HTMLElement;
	let emailInput: HTMLInputElement;
	let emailError: HTMLElement;
	let isSubmitting = false;
	let submitMessage = "";
	let submitStatus: "success" | "error" | "" = "";
	let customErrorMessage = ""; // Add this to track the error message

	function handleInput() {
		emailInput.setCustomValidity("");
		customErrorMessage = ""; // Clear custom error message
		submitStatus = "";
		submitMessage = "";
	}

	function validateEmail() {
		// Set custom error message but don't show browser popup
		if (emailInput.value === "") {
			customErrorMessage = "Please enter your email.";
			return false;
		} else if (!emailInput.validity.valid) {
			customErrorMessage = "Enter a valid email.";
			return false;
		}
		customErrorMessage = "";
		return true;
	}

	async function handleSubmit() {
		// Manual validation instead of relying on browser validation
		if (!validateEmail()) return;

		isSubmitting = true;
		submitStatus = "";
		submitMessage = "";

		try {
			const formData = new FormData(form);
			const response = await fetch("/api/signup", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			submitMessage = data.message;
			submitStatus = response.ok ? "success" : "error";

			if (response.ok) {
				form.reset();
				setTimeout(() => {
					submitStatus = "";
					submitMessage = "";
				}, 4000);
			}
		} catch (err) {
			console.error("Subscription error:", err);
			submitMessage = "Error occurred. Try again.";
			submitStatus = "error";
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="card mx-auto transition border-green-100 max-w-md">
	<div class="mb-5">
		<h3 class="text-xl font-display font-bold text-gray-800">
			Stay Updated
		</h3>
		<p class="text-gray-600 text-sm">
			Get notified about new posts on GIS and development.
		</p>
	</div>

	<form
		bind:this={form}
		on:submit|preventDefault={handleSubmit}
		class="space-y-3"
		novalidate
	>
		<div class="relative">
			<input
				type="email"
				id="email"
				name="email"
				required
				placeholder="you@example.com"
				class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-green-600 focus:border-green-600 transition"
				aria-label="Email address"
				bind:this={emailInput}
				on:input={handleInput}
			/>
			<div
				bind:this={emailError}
				class="text-red-500 text-xs mt-1"
				class:hidden={!customErrorMessage}
			>
				{customErrorMessage}
			</div>
		</div>

		<button
			type="submit"
			class="w-full btn btn-primary text-sm"
			disabled={isSubmitting}
		>
			{#if isSubmitting}
				<svg
					class="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				Subscribing...
			{:else if submitStatus === "success"}
				<svg
					class="inline-block -ml-1 mr-1 h-3 w-3 text-white"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
				Subscribed!
			{:else}
				Subscribe
			{/if}
		</button>

		{#if submitMessage}
			<div
				bind:this={messageEl}
				class="text-xs text-center mt-2"
				class:text-green-600={submitStatus === "success"}
				class:text-red-600={submitStatus === "error"}
				role="status"
				aria-live="polite"
			>
				{submitMessage}
			</div>
		{/if}
	</form>
</div>
