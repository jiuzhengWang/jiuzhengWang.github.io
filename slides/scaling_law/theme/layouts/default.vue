<template>
  <div
    class="slidev-layout default pku-theme"
    :style="{ '--pku-primary': $slidev.themeConfigs.primary || '#94070A' }"
  >
    <slot />
  </div>
</template>
