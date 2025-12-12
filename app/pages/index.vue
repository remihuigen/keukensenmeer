<script lang="ts" setup></script>

<template>
	<div>
		<Fluid class="grid min-h-[calc(100dvh-var(--ui-header-height))]">
			<div class="absolute inset-0 bottom-(--ui-header-height) left-1/3 grid">
				<AnimatedImage
					src="/images/modern_hero_fxhydj.jpg"
					sizes="800px"
					alt="Modern kitchen with island"
					direction="left"
					class="h-full w-full"
					:once="true"
					:duration="800"
					:pan="true"
					provider="ipx"
				/>
			</div>
			<UContainer class="relative flex min-h-full items-center">
				<Fade class="max-w-3xl space-y-12" :duration="750">
					<h1
						class="text-shadow-secondary-800 font-serif text-5xl font-bold text-white text-shadow-lg/30"
					>
						Maatwerk keukens die het ritme van
						<Hand>jouw leven</Hand>
						volgen.
					</h1>
					<UButton
						to="/studio"
						label="Volg jouw ritme"
						icon="heroicons:chevron-double-right-20-solid"
						trailing
						size="xl"
						:ui="{
							base: 'py-5 px-8 group',
							trailingIcon: 'transition-transform group-hover:translate-x-1',
						}"
						color="neutral"
					/>
				</Fade>
			</UContainer>
		</Fluid>

		<UContainer class="py-(--ui-section-padding)">
			<div class="grid grid-cols-8 gap-12">
				<AnimatedImage
					src="/images/modern_hero_fxhydj.jpg"
					sizes="800px"
					alt="Modern kitchen with island"
					direction="down"
					class="col-span-3 h-full w-full"
					:once="true"
					:duration="800"
					:pan="true"
					provider="ipx"
				/>
				<Fade class="col-span-5 space-y-6 py-12 md:py-20" :delay="150">
					<h2 class="text-4xl font-bold"><Hand no-margin>Over onze studio</Hand></h2>
					<p class="text-lg font-bold">
						Met onze keukenstudio bedenken, ontwerpen en bouwen we keukens op maat. Door
						het ritme van het leven centraal te stellen in ons designproces, zorgen we
						ervoor dat ons ontwerp altijd aansluit op jullie woonsituatie en gebruik.
					</p>

					<p class="text-lg">
						Want wij geloven dat de perfecte keuken meer is dan een plek is om te koken.
						De keuken is het hart van je huis, de plek waar je leeft, bij elkaar komt en
						elkaar spreekt. Daarom houdt ons werk ook niet op bij jullie keuken, maar
						doen we meer.
					</p>

					<UButton
						to="/studio"
						label="De meerwaarde van onze studio"
						icon="heroicons:chevron-double-right-20-solid"
						trailing
						size="xl"
						:ui="{
							base: 'py-5 px-8 group',
							trailingIcon: 'transition-transform group-hover:translate-x-1',
						}"
						color="primary"
					/>
				</Fade>
			</div>
		</UContainer>

		<Fluid class="space-y-20 bg-white py-(--ui-section-padding) md:space-y-32">
			<section class="relative grid min-h-[80dvh]">
				<div class="absolute inset-0 bottom-(--ui-header-height) left-[50%] grid">
					<AnimatedImage
						src="/images/modern_hero_fxhydj.jpg"
						sizes="800px"
						alt="Modern kitchen with island"
						direction="left"
						class="h-full w-full"
						:once="true"
						:duration="800"
						:pan="true"
						provider="ipx"
					/>
				</div>
				<UContainer class="flex items-center">
					<Fade :delay="400" class="max-w-xl space-y-6">
						<h2 class="text-secondary-900 font-serif text-5xl font-bold">
							Een
							<Hand>greep</Hand>
							uit onze projecten.
						</h2>
						<p class="text-secondary-800">
							Of je nu op zoek bent naar een <strong>landelijke</strong> keuken, iets
							<strong>moderns</strong> of juist lekker <strong>robuust</strong>: bij
							Keukens & Meer ben je aan het juiste adres.
						</p>
						<UButton
							to="/projecten"
							label="Bekijk meer projecten"
							icon="heroicons:chevron-double-right-20-solid"
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
			<UContainer class="pb-(--ui-section-padding)">
				<Fade class="max-w-6xl space-y-8 text-center" :delay="150">
					<h2 class="text-4xl font-bold">
						<Hand no-margin>Hoe onze projecten tot stand komen</Hand>
					</h2>
					<p class="text-secondary-800">
						Bij Keukens & Meer werken we op een andere manier dan andere
						keukenspeciaalzaken. Dat begint bij een
						<strong>eerlijke en transparante</strong> prijsberekening, vindt zijn
						vervolg in een <strong>gezamenlijk ontwerpproces</strong> - waarin elk
						detail met de hand wordt ingevuld - en eindigt bij
						<strong>productie en montage</strong> waar tijd en aandacht wordt
						vrijgemaakt om deze details tot leven te brengen. gerust contact met ons op
						voor een vrijblijvend gesprek in onze keukenstudio.
					</p>
					<div class="mx-auto flex flex-wrap justify-center gap-4">
						<UButton
							to="/werkwijze"
							label="Over onze werkwijze"
							size="xl"
							color="secondary"
						/>
						<UButton
							to="/contact"
							label="Plan een afspraak"
							size="xl"
							color="primary"
						/>
					</div>
				</Fade>
			</UContainer>
		</Fluid>
		<Footer />
	</div>
</template>
