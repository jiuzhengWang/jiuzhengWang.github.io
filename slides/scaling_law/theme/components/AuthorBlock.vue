<script setup lang="ts">
type Affiliation = {
  name: string
  url?: string
  img?: string
}

withDefaults(defineProps<{
  name?: string
  url?: string
  school?: string
  department?: string
  lab?: string
  email?: string
  date?: string
  affiliations?: Affiliation[]
}>(), {
  school: '北京大学'
})
</script>

<template>
  <section class="pku-author-block">
    <p class="pku-author-name">
      <a v-if="url" :href="url">{{ name }}</a>
      <span v-else>{{ name }}</span>
    </p>
    <p v-if="email" class="pku-author-line">{{ email }}</p>
    <p class="pku-author-line">
      <span>{{ school }}</span>
      <span v-if="department"> · {{ department }}</span>
      <span v-if="lab"> · {{ lab }}</span>
    </p>
    <p v-if="date" class="pku-author-line">{{ date }}</p>

    <div v-if="affiliations?.length" class="pku-affiliations">
      <a
        v-for="item in affiliations"
        :key="item.name"
        class="pku-affiliation"
        :href="item.url"
      >
        <img v-if="item.img" :src="item.img" alt="">
        <span>{{ item.name }}</span>
      </a>
    </div>
  </section>
</template>
