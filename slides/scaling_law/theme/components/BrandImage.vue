<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<{
  src: string
  alt?: string
}>(), {
  alt: '',
})

function withBase(path: string) {
  if (/^(https?:|data:)/.test(path))
    return path
  return `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, '')}`
}
</script>

<template>
  <img v-bind="$attrs" :src="withBase(props.src)" :alt="props.alt">
</template>
