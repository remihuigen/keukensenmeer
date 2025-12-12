<script lang="ts" setup></script>

<template>
	<div
		class="sticky top-(--ui-header-height) h-[calc(100dvh-var(--ui-header-height))] snap-y snap-mandatory overflow-scroll"
	>
		<section
			class="relative grid min-h-[calc(100dvh-var(--ui-header-height))] snap-center py-8"
		>
			<UContainer class="flex h-full flex-row items-center gap-16">
				<AnimatedImage
					src="images/modern_hero_fxhydj"
					sizes="800px"
					alt="Modern kitchen with island"
					direction="right"
					class="sticky top-[calc(var(--ui-header-height)+2rem)] h-full basis-[40%] self-center"
					:once="false"
					:duration="800"
					provider="ipx"
				/>
				<Fade class="basis-[60%] space-y-8 py-8" :delay="300">
					<h1
						class="text-shadow-secondary-800 w-[120%] -translate-x-1/5 font-serif text-5xl font-bold text-white text-shadow-lg/10"
					>
						In onze studio ontwerpen we keukens die het
						<Hand>kloppend hart</Hand>
						van je huis zijn.
					</h1>
					<p class="font-bold">
						Geen enkel huis en geen enkel gezin is hetzelfde. Daarom geloven we bij
						Keukens & Meer dat het perfecte keukenontwerp altijd start vanuit een blanco
						canvas. Zodat we concepten kunnen bedenken die jullie leefstijl en gebruik
						ondersteunen en een meerwaarde zijn voor het ritme van je leven.
					</p>
					<UButton
						to="#menko"
						label="Over Menko"
						icon="heroicons:chevron-double-down-20-solid"
						trailing
						size="xl"
						:ui="{
							base: 'py-5 px-8 group',
							trailingIcon: 'transition-transform group-hover:translate-x-1',
						}"
						color="primary"
					/>
				</Fade>
			</UContainer>
		</section>
		<section
			id="menko"
			class="relative grid min-h-[calc(100dvh-var(--ui-header-height))] snap-center py-8"
		>
			<UContainer class="flex h-full flex-row items-center gap-16">
				<AnimatedImage
					src="images/modern_hero_fxhydj"
					provider="ipx"
					sizes="800px"
					alt="Modern kitchen with island"
					direction="right"
					class="sticky top-[calc(var(--ui-header-height)+2rem)] h-full basis-[40%] self-center"
					:once="false"
					:duration="800"
					:pan="true"
				/>
				<Fade class="basis-[60%] space-y-8 py-8" :delay="300">
					<h1
						class="text-shadow-secondary-800 w-[120%] -translate-x-1/5 font-serif text-5xl font-bold text-white text-shadow-lg/10"
					>
						In onze studio ontwerpen we keukens die het
						<Hand>kloppend hart</Hand>
						van je huis zijn.
					</h1>
					<p class="font-bold">
						Geen enkel huis en geen enkel gezin is hetzelfde. Daarom geloven we bij
						Keukens & Meer dat het perfecte keukenontwerp altijd start vanuit een blanco
						canvas. Zodat we concepten kunnen bedenken die jullie leefstijl en gebruik
						ondersteunen en een meerwaarde zijn voor het ritme van je leven.
					</p>
					<UButton
						to="#menko"
						label="Over Menko"
						icon="heroicons:chevron-double-down-20-solid"
						trailing
						size="xl"
						:ui="{
							base: 'py-5 px-8 group',
							trailingIcon: 'transition-transform group-hover:translate-x-1',
						}"
						color="primary"
					/>
				</Fade>
			</UContainer>
		</section>
		<section
			class="relative grid min-h-[calc(100dvh-var(--ui-header-height))] snap-center py-8"
		>
			<UContainer class="flex h-full flex-row items-center gap-16">
				<AnimatedImage
					src="images/modern_hero_fxhydj"
					provider="ipx"
					sizes="800px"
					alt="Modern kitchen with island"
					direction="right"
					class="sticky top-[calc(var(--ui-header-height)+2rem)] h-full basis-[40%] self-center"
					:once="false"
					:duration="800"
					:pan="true"
				/>
				<Fade class="basis-[60%] space-y-8 py-8" :delay="300">
					<h1
						class="text-shadow-secondary-800 w-[120%] -translate-x-1/5 font-serif text-5xl font-bold text-white text-shadow-lg/10"
					>
						In onze studio ontwerpen we keukens die het
						<Hand>kloppend hart</Hand>
						van je huis zijn.
					</h1>
					<p class="font-bold">
						Geen enkel huis en geen enkel gezin is hetzelfde. Daarom geloven we bij
						Keukens & Meer dat het perfecte keukenontwerp altijd start vanuit een blanco
						canvas. Zodat we concepten kunnen bedenken die jullie leefstijl en gebruik
						ondersteunen en een meerwaarde zijn voor het ritme van je leven.
					</p>
					<UButton
						to="#menko"
						label="Over Menko"
						icon="heroicons:chevron-double-down-20-solid"
						trailing
						size="xl"
						:ui="{
							base: 'py-5 px-8 group',
							trailingIcon: 'transition-transform group-hover:translate-x-1',
						}"
						color="primary"
					/>
				</Fade>
			</UContainer>
		</section>
	</div>
</template>
