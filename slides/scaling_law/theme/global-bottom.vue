<script setup lang="ts">
import type { SlideRoute } from '@slidev/types'
import { useNav } from '@slidev/client'
import { computed, onBeforeUnmount, onMounted } from 'vue'

const nav = useNav()

function isVertical(route: SlideRoute | undefined) {
  return !!(
    route?.meta?.jyyVertical
    || route?.meta?.slide?.frontmatter?.jyyVertical
  )
}

const currentIndex = computed(() => nav.currentSlideNo.value - 1)

const groupStart = computed(() => {
  let index = currentIndex.value
  while (index > 0 && isVertical(nav.slides.value[index]))
    index--
  return index
})

const groupEnd = computed(() => {
  let index = groupStart.value
  while (index + 1 < nav.slides.value.length && isVertical(nav.slides.value[index + 1]))
    index++
  return index
})

const prevGroupStart = computed(() => {
  if (groupStart.value <= 0)
    return undefined
  let index = groupStart.value - 1
  while (index > 0 && isVertical(nav.slides.value[index]))
    index--
  return index
})

const nextGroupStart = computed(() => {
  const index = groupEnd.value + 1
  return index < nav.slides.value.length ? index : undefined
})

const canGoLeft = computed(() => prevGroupStart.value !== undefined)
const canGoDown = computed(() => currentIndex.value < groupEnd.value)
const canGoRight = computed(() => nextGroupStart.value !== undefined)

function goLeft() {
  if (prevGroupStart.value !== undefined)
    nav.go(prevGroupStart.value + 1)
}

function goDown() {
  if (canGoDown.value)
    nav.go(nav.currentSlideNo.value + 1)
}

function canGoUp() {
  return currentIndex.value > groupStart.value
}

function goUp() {
  if (canGoUp())
    nav.go(nav.currentSlideNo.value - 1)
}

function goRight() {
  if (nextGroupStart.value !== undefined)
    nav.go(nextGroupStart.value + 1)
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement))
    return false

  return (
    target.isContentEditable
    || target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.tagName === 'SELECT'
  )
}

function handleKeydown(event: KeyboardEvent) {
  if (
    event.defaultPrevented
    || event.altKey
    || event.ctrlKey
    || event.metaKey
    || event.shiftKey
    || isEditableTarget(event.target)
  ) {
    return
  }

  if (event.key === 'ArrowLeft') {
    goLeft()
  }
  else if (event.key === 'ArrowRight') {
    goRight()
  }
  else if (event.key === 'ArrowUp') {
    goUp()
  }
  else if (event.key === 'ArrowDown') {
    goDown()
  }
  else {
    return
  }

  event.preventDefault()
  event.stopImmediatePropagation()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown, { capture: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown, { capture: true })
})
</script>

<template>
  <nav
    class="pku-reveal-controls"
    data-controls-back-arrows="faded"
    aria-label="Slide navigation"
  >
    <button
      type="button"
      class="navigate-left"
      :class="{ enabled: canGoLeft }"
      aria-label="Previous horizontal slide"
      title="Previous horizontal slide"
      :disabled="!canGoLeft"
      @click="goLeft"
    >
      <span class="controls-arrow" />
    </button>
    <button
      type="button"
      class="navigate-down"
      :class="{ enabled: canGoDown }"
      aria-label="Next vertical slide"
      title="Next vertical slide"
      :disabled="!canGoDown"
      @click="goDown"
    >
      <span class="controls-arrow" />
    </button>
    <button
      type="button"
      class="navigate-right"
      :class="{ enabled: canGoRight }"
      aria-label="Next horizontal slide"
      title="Next horizontal slide"
      :disabled="!canGoRight"
      @click="goRight"
    >
      <span class="controls-arrow" />
    </button>
  </nav>
</template>
