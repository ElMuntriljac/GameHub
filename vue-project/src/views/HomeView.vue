<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const racunala = ref([])
const korisnik = ref(null)
const jeAdmin = ref(false)

const showModal = ref(false)
const odabranoRacunalo = ref(null)
const brojSati = ref(1)
const ukupnaCijena = ref(0)

const dohvatiKorisnika = async () => {
  const { data } = await supabase.auth.getUser()
  korisnik.value = data.user

  if (korisnik.value) {
    const { data: profil, error } = await supabase
      .from('korisnici')
      .select('admin')
      .eq('id', korisnik.value.id)
      .single()

    if (!error && profil?.admin === true) {
      jeAdmin.value = true
    }
  }
}

const novoNaziv = ref('')
const novaCijena = ref(null)

const dodajRacunalo = async () => {
  if (!novoNaziv.value || !novaCijena.value || novaCijena.value <= 0) {
    alert('Unesi naziv i pozitivnu cijenu!')
    return
  }

  const { error } = await supabase.from('racunala').insert([
    {
      naziv: novoNaziv.value,
      cijena_po_satu: novaCijena.value,
      status: 'slobodno',
      user: null,
    },
  ])

  if (error) {
    alert('Greška pri dodavanju: ' + error.message)
    return
  }

  // reset forma i osvježi
  novoNaziv.value = ''
  novaCijena.value = null
  await dohvatiRacunala()
}


const dohvatiRacunala = async () => {
  const { data, error } = await supabase.from('racunala').select('*')
  if (!error) racunala.value = data
}

const otvoriModal = (rac) => {
  odabranoRacunalo.value = rac
  brojSati.value = 1
  ukupnaCijena.value = rac.cijena_po_satu
  showModal.value = true
}

const izracunajCijenu = () => {
  if (odabranoRacunalo.value) {
    ukupnaCijena.value = brojSati.value * odabranoRacunalo.value.cijena_po_satu
  }
}

const potvrdiRezervaciju = async () => {
  if (!korisnik.value || !odabranoRacunalo.value) return

  if (brojSati.value < 1 || brojSati.value > 24 || isNaN(brojSati.value)) {
    alert('Unesi broj sati između 1 i 24!')
    return
  }

  const { data: profil, error } = await supabase
    .from('korisnici')
    .select('ime, prezime')
    .eq('id', korisnik.value.id)
    .single()

  if (error) return

  const imePrezime = `${profil.ime} ${profil.prezime}`

  await supabase
    .from('racunala')
    .update({
      status: 'zauzeto',
      user: imePrezime,
    })
    .eq('id', odabranoRacunalo.value.id)

  showModal.value = false
  await dohvatiRacunala()
}

const prekiniRezervaciju = async (racId) => {
  if (!jeAdmin.value) return

  await supabase.from('racunala').update({ status: 'slobodno', user: null }).eq('id', racId)
  await dohvatiRacunala()
}

onMounted(async () => {
  await dohvatiKorisnika()
  await dohvatiRacunala()
})
</script>

<template>
  <div class="container mt-5">
    <h1 class="text-center mb-5 display-4 fw-bold">Računala u GameHubu</h1>
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
      <div class="col d-flex justify-content-center" v-for="rac in racunala" :key="rac.id">
        <div class="card shadow p-3 bg-white rounded" style="width: 18rem">
          <div class="card-body text-center">
            <h5 class="card-title fs-4">{{ rac.naziv }}</h5>
            <p class="card-text fs-5">
              Status: <strong>{{ rac.status }}</strong
              ><br />
              Cijena: {{ rac.cijena_po_satu }} € / sat<br />
              <span v-if="rac.status === 'zauzeto' && rac.user">
                Rezervirao: <strong>{{ rac.user }}</strong>
              </span>
            </p>

            <button
              v-if="rac.status === 'slobodno'"
              class="btn btn-success mt-2"
              @click="otvoriModal(rac)"
            >
              Rezerviraj
            </button>

            <button
              v-if="rac.status === 'zauzeto' && jeAdmin"
              class="btn btn-danger mt-2"
              @click="prekiniRezervaciju(rac.id)"
            >
              Prekini rezervaciju
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content p-4">
          <h5 class="modal-title mb-3">Unesi broj sati za rezervaciju</h5>
          <div class="mb-3">
            <input
              type="number"
              v-model.number="brojSati"
              @input="izracunajCijenu()"
              min="1"
              max="24"
              class="form-control"
            />
          </div>
          <p>
            Ukupna cijena: <strong>{{ ukupnaCijena }} €</strong>
          </p>
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" @click="showModal = false">Odustani</button>
            <button class="btn btn-primary" @click="potvrdiRezervaciju">Prihvati</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ADMIN: Dodavanje novog računala -->
<div v-if="jeAdmin" class="mt-5">
  <h3 class="text-center mb-3">Dodaj novo računalo</h3>
  <div class="row justify-content-center">
    <div class="col-md-4">
      <input
        v-model="novoNaziv"
        type="text"
        placeholder="Naziv računala"
        class="form-control mb-2"
      />
      <input
        v-model.number="novaCijena"
        type="number"
        placeholder="Cijena po satu (€)"
        class="form-control mb-3"
        min="0.01"
        step="0.01"
      />
      <button class="btn btn-primary w-100" @click="dodajRacunalo">Dodaj računalo</button>
    </div>
  </div>
</div>

  </div>
</template>
