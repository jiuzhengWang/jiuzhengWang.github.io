<template>
  <div
    class="slidev-layout section pku-theme"
    :style="{ '--pku-primary': $slidev.themeConfigs.primary || '#94070A' }"
  >
    <div class="pku-section-content">
      <slot />
    </div>
  </div>
</template>
