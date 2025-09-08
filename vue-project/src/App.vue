<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const korisnik = ref(null)

const testKonekcija = async () => {
  const { data, error } = await supabase.from('racunala').select('*')
  if (error) {
    console.error('Greška:', error.message)
  } else {
    console.log('Podaci iz baze:', data)
  }
}

const provjeriKorisnika = async () => {
  const { data } = await supabase.auth.getUser()
  korisnik.value = data.user
}

const odjavi = async () => {
  await supabase.auth.signOut()
  korisnik.value = null
  router.push('/login')
}

supabase.auth.onAuthStateChange(() => {
  provjeriKorisnika()
})

onMounted(() => {
  testKonekcija()
  provjeriKorisnika()
})
</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light px-4 py-2 shadow-sm">
      <div class="container-fluid d-flex justify-content-between">
        <router-link to="/" class="navbar-brand fw-bold">GameHub</router-link>
        <div>
          <template v-if="korisnik">
            <button class="btn btn-outline-danger" @click="odjavi">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-outline-primary me-2">Login</router-link>
            <router-link to="/register" class="btn btn-outline-success">Registracija</router-link>
          </template>
        </div>
      </div>
    </nav>

    <router-view />
  </div>
</template>
