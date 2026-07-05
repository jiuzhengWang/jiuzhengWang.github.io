<template>
  <div
    class="slidev-layout center pku-theme"
    :style="{ '--pku-primary': $slidev.themeConfigs.primary || '#94070A' }"
  >
    <div class="pku-center-content">
      <slot />
    </div>
  </div>
</template>
