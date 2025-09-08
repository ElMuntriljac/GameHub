<template>
  <div class="container mt-5">
    <h2>Registracija</h2>
    <form @submit.prevent="register">
      <input v-model="ime" placeholder="Ime" class="form-control mb-2" />
      <input v-model="prezime" placeholder="Prezime" class="form-control mb-2" />
      <input v-model="email" type="email" placeholder="Email" class="form-control mb-2" />
      <input v-model="lozinka" type="password" placeholder="Lozinka" class="form-control mb-3" />
      <button type="submit" class="btn btn-primary">Registriraj se</button>
    </form>
    <p v-if="greska" class="text-danger mt-2">{{ greska }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'
const router = useRouter()

const ime = ref('')
const prezime = ref('')
const email = ref('')
const lozinka = ref('')
const greska = ref('')

const register = async () => {  
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: lozinka.value,
  })

  if (error) {
    greska.value = error.message
    return
  }

  // Dodaj u korisnici tablicu
  const { error: insertError } = await supabase.from('korisnici').insert([{
    id: data.user.id,
    ime: ime.value,
    prezime: prezime.value,
    admin: false
  }])

  if (insertError) {
    greska.value = insertError.message
  } else {
     greska.value = ''
  router.push('/')
  }
}
</script>
