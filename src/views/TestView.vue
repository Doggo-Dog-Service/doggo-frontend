<script setup>
import { reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
const authStore = useAuthStore()
const clientStore = useClientStore()

const data = reactive({
  email: '',
  password: '',
})

function login() {
  authStore.login(data)
}

function deleteMe(id) {
    authStore.deleteUser(id)
}

onMounted(() => {
    clientStore.fetchClients()
})
</script>
<template>
  <form @submit.prevent="login" class="flex flex-col gap-2">
    <input class="border px-4 py-2 text-xl rounded-xl" placeholder="" type="text" v-model="data.email" />
    <input class="border px-4 py-2 text-xl rounded-xl" placeholder="" type="text" v-model="data.password" />
    <button type="submit" class="cursor-pointer border px-4 py-2 rounded-xl">Logar</button>
    <p>current user: {{ authStore.user ?? 'Nenhum usuário logado'}}</p>
  </form>

  <h2 class="text-xl">Clients</h2>

  <div v-for="(client, index) in clientStore.clients" :key="index">
    {{ client.user?.email }}
  </div>

  <button class="bg-red-400 text-white text-xl rounded-xl px-4 py-2 cursor-pointer" @click="deleteMe(authStore.user?.id)">Me Deletar</button>
</template>
