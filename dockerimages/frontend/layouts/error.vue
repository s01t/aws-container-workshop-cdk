<template>
  <v-container>
    <v-app>
      <h1 v-if="error.statusCode === 404">
        {{ pageNotFound }}
      </h1>
      <h1 v-else>
        {{ otherError }}
      </h1>
      <NuxtLink to="/">
        Return to Home Page
      </NuxtLink>
    </v-app>
  </v-container>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title
    }
  },
  data() {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'Error occurred'
    }
  },
  created() {
    this.$vuetify.theme.dark = false
  },
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
