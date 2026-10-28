<template>
  <div class="min-h-dvh bg-canvas text-fg">
    <div class="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-8">
      <RouterLink to="/" class="self-center rounded-control focus-visible:ring-2 focus-visible:ring-primary">
        <img class="h-10 w-auto" src="/logo.png" alt="Doggo" />
      </RouterLink>
      <main>
        <RouterView v-slot="{ Component }">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
            leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <component :is="Component" :key="$route.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
