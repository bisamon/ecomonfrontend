import Vue from 'vue'
import axios from 'axios'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router'
import YmapPlugin from 'vue-yandex-maps'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import Tables from './components/Tables'
import Index from './components/Index'
import Charts from './components/Charts'

const settings = {
  apiKey: '',
  lang: 'ru_RU',
  coordorder: 'latlong',
  version: '2.1'
}
Vue.use(YmapPlugin, settings)

Vue.use(VueRouter)

Vue.prototype.$apiInstance = axios.create({
  baseURL: 'http://62.109.1.190:5000/api/'
})

Vue.prototype.$apiAuthInstance = axios.create({
  baseURL: 'http://62.109.1.190:5000/api/',
})

if (typeof localStorage.token !== 'undefined') {
  Vue.prototype.$apiAuthInstance.defaults.headers.common['Authorization'] = `${localStorage.token}`
}

const ifAuthenticated = (to, from, next) => {
  if (typeof localStorage.token !== 'undefined') {
    axios.get('http://62.109.1.190:5000/api/auth/check', { headers: { Authorization: `${localStorage.token}` } })
      .then(response => {
        if (response.data.check) {
          next()
        }
      })
      .catch(error => {
        console.log(error)
        next('login')
      })
  } else {
    next('/login')
  }
}

const isAuth = Vue.observable({ isAuth: {} });
Object.defineProperty(Vue.prototype, '$isAuth', {
  get() {
    return isAuth.isAuth;
  },
  set(value) {
    isAuth.isAuth = value;
  }
})

const userType = Vue.observable({ userType: {} });
Object.defineProperty(Vue.prototype, '$userType', {
  get() {
    return userType.userType;
  },
  set(value) {
    userType.userType = value;
  }
})

const userName = Vue.observable({ userName: {} });
Object.defineProperty(Vue.prototype, '$username', {
  get() {
    return userName.userName;
  },
  set(value) {
    userName.userName = value;
  }
})

if (typeof localStorage.userName === 'undefined') {
  localStorage.userName = ''
}

if (typeof localStorage.userType === 'undefined') {
  localStorage.userType = 'guest'
}

if (typeof localStorage.isAuth === 'undefined') {
  localStorage.isAuth = 1
}

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/login',
      name: 'login',
      component: LoginForm
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupForm,
      beforeEnter: ifAuthenticated
    },
    {
      path: '/tables',
      name: 'tables',
      component: Tables,
      beforeEnter: ifAuthenticated
    },
    {
      path: '/charts',
      name: 'charts',
      component: Charts
    }
  ]
})


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')