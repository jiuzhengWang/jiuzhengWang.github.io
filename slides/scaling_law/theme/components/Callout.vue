<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'note' | 'question' | 'warning'
  title?: string
}>(), {
  type: 'note'
})
</script>

<template>
  <aside class="pku-callout" :data-type="type">
    <strong v-if="title">{{ title }}</strong>
    <slot />
  </aside>
</template>
