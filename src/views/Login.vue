<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col col-lg-6">
        <div class="card mb-5">
          <div class="card-header">
            <h1 class="text-center">Login</h1>
          </div>
          <form>
            <div class="card-body">
              <div>
                <div class="form-group">
                  <input type="email" class="form-control" placeholder="Enter your Email" v-model="user.email" @change="validate()">
                  <div class="invalid-feedback" :class="{ 'd-flex' : error }">
                    Please enter your email address.
                  </div>
                  <div class="invalid-feedback" :class="{ 'd-flex' : error3 }">
                    Please enter valid email address.
                  </div>
                </div>
                <div class="form-group">
                  <input type="password" class="form-control" placeholder="Password" v-model="user.password">
                  <div class="invalid-feedback" :class="{ 'd-flex' : error2 }">
                    Wrong Password
                  </div>
                </div>
              </div>
              <div class="text-center">
                <button class="btn btn-primary" @click.prevent="login()">Login</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'login',
  components: {
  },
  data () {
    return {
      error: false,
      error2: false,
      error3: false,
      user: {
        email: '',
        password: ''
      }
    }
  },
  mounted () {
  },
  created () {
    this.fetchData()
  },
  methods: {
    validateEmail (email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return re.test(email)
    },
    validate () {
      this.error3 = false
      if (!this.validateEmail(this.user.email)) {
        this.error3 = true
      }
    },
    login () {
      if (this.user.email === undefined || this.user.email === null || this.user.email.trim() === '') {
        this.error = true
      } else if (this.user.password === undefined || this.user.password === null || this.user.password.trim() === '') {
        this.error = false
        this.error2 = true
      }
    },
    fetchData () {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
