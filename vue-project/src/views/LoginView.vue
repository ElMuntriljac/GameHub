
<template>
  <div class="container mt-5">
    <h2>Prijava</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" class="form-control mb-2" />
      <input v-model="lozinka" type="password" placeholder="Lozinka" class="form-control mb-3" />
      <button type="submit" class="btn btn-success">Prijavi se</button>
    </form>
    <p v-if="greska" class="text-danger mt-2">{{ greska }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'
const router = useRouter()

const email = ref('')
const lozinka = ref('')
const greska = ref('')

const login = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: lozinka.value
  })

  if (error) {
    greska.value = error.message
  } else {
    greska.value = ''
  router.push('/')
  }
}
</script>
