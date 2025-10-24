<script lang="ts" setup></script>

<template>
	<UContainer class="py-8">
		<h1 class="font-serif text-4xl font-bold text-white">
			Maatwerk keukens die het ritme van
			<Hand>jouw leven</Hand>
			volgen.
		</h1>
		<p>This is the content of the index page.</p>
		<UButton to="/projecten" label="Projecten" />

		<AnimatedImage
			src="site/modern_hero_fxhydj"
			sizes="800px"
			alt="Modern kitchen with island"
			direction="right"
			class="mt-20 h-140 w-full"
			:once="false"
			:duration="800"
			:pan="false"
		/>
		<div class="h-800" />
	</UContainer>
</template>
