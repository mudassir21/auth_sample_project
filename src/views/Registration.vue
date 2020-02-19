<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col col-lg-6">
        <div class="card mb-5">
          <div class="card-header">
            <h1 class="text-center">Registration</h1>
          </div>
          <form>
            <div class="card-body">
              <div class="" v-if="step === 1">
                <div class="form-group">
                  <input type="email" class="form-control" placeholder="Enter your Email" v-model="user.email" @change="validate()">
                  <div class="invalid-feedback" :class="{ 'd-flex' : error }">
                    Please enter your email address.
                  </div>
                  <div class="invalid-feedback" :class="{ 'd-flex' : error4 }">
                    Please enter valid email address.
                  </div>
                </div>
                <div class="form-group">
                  <input type="email" class="form-control" placeholder="Confirm Email" v-model="user.confirmEmail" @change="match()">
                  <div class="invalid-feedback" :class="{ 'd-flex' : error2 }">
                    Please confirm your email address.
                  </div>
                  <div class="invalid-feedback" :class="{ 'd-flex' : error3 }">
                    Email does not match!!!
                  </div>
                </div>
              </div>
              <div class="" v-if="step === 2">
                <h2 class="text-center">Check your email!</h2>
                <p class="text-center">
                  We've sent a 6-digit confirmation code to <strong>{{this.user.email}}</strong>. It will expire shortly, so enter it soon.
                </p>
                <Sms v-model="verificationDigits"></Sms>
                <div class="invalid-feedback justify-content-center">
                  Please enter valid verification code.
                </div>
                <p class="text-center mt-2">
                  Keep this window open while checking for your code. Remember to try your Spam folder!
                </p>
              </div>
              <div class="" v-if="step === 3">
                <div class="form-group">
                  <input type="text" class="form-control" placeholder="Enter your Fisrt Name" v-model="user.firstName">
                  <div class="invalid-feedback">
                    Please enter your First Name.
                  </div>
                </div>
                <div class="form-group">
                  <input type="text" class="form-control" placeholder="Enter your Last Name" v-model="user.lastName">
                  <div class="invalid-feedback">
                    Please enter your Last Name.
                  </div>
                </div>
              </div>
              <div class="" v-if="step === 4">
                <h2 class="text-center">Registration Successful</h2>
                <div class="text-center mt-3">
                  <a href="/login">Go to login</a>
                </div>
              </div>
              <div class="text-center">
                <button v-if="step === 1" class="btn btn-primary" @click.prevent="userSignUp(1)">Submit</button>
                <button v-if="step === 2" class="btn btn-primary" @click.prevent="userSignUp(2)">Submit</button>
                <button v-if="step === 3" class="btn btn-primary" @click.prevent="userSignUp(3)">Submit</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sms from 'ofcold-security-code'

export default {
  name: 'home',
  components: {
    Sms
  },
  data () {
    return {
      step: 1,
      error: false,
      error2: false,
      error3: false,
      error4: false,
      user: {
        email: '',
        confirmEmail: '',
        firstName: '',
        lastName: ''
      },
      verificationDigits: ''
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
      this.error4 = false
      if (!this.validateEmail(this.user.email)) {
        this.error4 = true
      }
    },
    match () {
      this.error3 = false
      if (this.user.confirmEmail !== this.user.email) {
        this.error3 = true
      }
    },
    countryChanged (country) {
      this.country_code = '+' + country.dialCode
    },
    fetchData () {
    },
    userSignUp (step) {
      if (step === 1) {
        if (this.user.email === undefined || this.user.email === null || this.user.email.trim() === '') {
          this.error = true
        } else if (this.user.confirmEmail === undefined || this.user.confirmEmail === null || this.user.confirmEmail.trim() === '') {
          this.error = false
          this.error2 = true
        } else {
          this.error = false
          this.error2 = false
        }
      } else if (step === 2) {
      } else if (step === 3) {
      }
    },
    prev () {
      this.step--
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

<style>
.ofcold__security-code-wrapper .ofcold__security-code-field {
  width: 35px !important;
}
@media only screen and (max-width: 736px) {
  .ofcold__security-code-wrapper .ofcold__security-code-field .form-control {
    width: 38px !important;
    height: 38px !important;
  }
}
.ofcold__security-code-wrapper .ofcold__security-code-field .form-control {
  border: 1px solid #dbdbdb !important;
  border-radius: 3px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
