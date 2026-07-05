<script setup lang="ts">
withDefaults(defineProps<{
  src?: string
  alt?: string
}>(), {
  src: 'brand/pku-lockup-horizontal.png',
  alt: '北京大学'
})

function withBase(path: string) {
  if (/^(https?:|data:)/.test(path))
    return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, '')}`
}
</script>

<template>
  <img class="pku-brand-lockup" :src="withBase(src)" :alt="alt">
</template>
