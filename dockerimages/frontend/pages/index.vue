<template>
  <div class="container" id="app">
    <p></p>
    <v-container>
      <v-layout row wrap>
        <v-flex xs1 sm5 mx-3>
          <button @click="createMessage">New Message</button>
          <v-text-field
            @keyup.enter="createMessage"
            v-model="input_text"
            label="Create Message, then Enter"
          />
        </v-flex>
      </v-layout>
      <div id="counts">
        <p class="text-black-50" :key="index" :ref="`${index}`" v-show="data">
          {{ data.length }} messages are registered
        </p>
      </div>
      <v-app>
        <v-data-table
          :headers="headers"
          :items="data"
          :loading="loading"
          class="elevation-1"
          sort-by="user"
        >
          <template v-slot:item.action="{ item }">
            <v-icon small @click="deleteMessage(item)">
              delete
            </v-icon>
          </template>
          <template v-slot:no-data>
            <v-alert :value="true" color="warning" icon=" ">
              Data not found.
            </v-alert>
          </template>
        </v-data-table>
      </v-app>
    </v-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      index: "",
      user: "guest",
      input_text: "",
      response: {
        id: "",
        text: ""
      },
      headers: [
        { text: "User", value: "user" },
        { text: "Text", value: "text" },
        { text: "Actions", value: "action", sortable: false }
      ],
      loading: false
    };
  },
  async asyncData({ $axios, error }) {
    const response = await $axios
      .$get("/messages")
      .catch(e => {
        console.log("Error: Query Messages", e);
        error({ statusCode: 504 });
        return false;
      }
  );
    return { data: response };
  },
  methods: {
    async createMessage() {
      this.loading = true;
      await this.$axios
        .$post("/messages", {
          user: this.user,
          text: this.input_text
        })
        .catch(e => {
          console.log("Error: Create Message", e);
          return false;
        });
      location.reload();
      this.loading = false;
    },
    async deleteMessage(item) {
      this.loading = true;
      confirm("Are you sure you want to delete this item ?") &&
        (await this.$axios.$delete("/messages/" + item.id).catch(e => {
          console.log("Error: Delete Message", e);
          return false;
        }));
      location.reload();
      this.loading = false;
    }
  }
};

</script>

<style>
#counts p {
  display: inline-block;
}
</style>
