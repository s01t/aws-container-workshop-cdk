<template>
  <div>
    <Header />
    <nuxt />
  </div>
</template>

<script>
import Header from '~/components/Header.vue'

export default {
  name: 'default',
  components: {
    Header,
  }
}
</script>

<style>
.application{
  font-family: "Roboto";
}
</style>
