<template>
  <div
    class="slidev-layout cover pku-theme"
    :style="{ '--pku-primary': $slidev.themeConfigs.primary || '#94070A' }"
  >
    <div class="pku-cover-content">
      <slot />
    </div>
  </div>
</template>
