<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  image?: string
  caption?: string
}>()

function withBase(path: string | undefined) {
  if (!path)
    return path
  if (/^(https?:|data:)/.test(path))
    return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, '')}`
}

const imageSrc = computed(() => withBase(props.image))
</script>

<template>
  <div
    class="slidev-layout image-right pku-theme"
    :style="{ '--pku-primary': $slidev.themeConfigs.primary || '#94070A' }"
  >
    <main class="pku-image-right-content">
      <slot />
    </main>
    <figure v-if="imageSrc" class="pku-image-right-media">
      <img :src="imageSrc" alt="">
      <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
  </div>
</template>
