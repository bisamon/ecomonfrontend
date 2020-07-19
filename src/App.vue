<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />

        <v-toolbar-title>EcoMon</v-toolbar-title>
      </div>

      <v-spacer></v-spacer>
      <v-container>
        <v-row justify="end">
          <v-col cols="3" align-self="end">
      {{curUserName}}
          </v-col>
        </v-row>
      </v-container>
      <v-btn to="/login" color="primary" v-if="loginBtnText == 'Войти'">
        {{loginBtnText}}
      </v-btn>
      <v-btn @click="logout" color="primary" v-if="loginBtnText == 'Выйти'">
        {{loginBtnText}}
      </v-btn>


    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      color="primary"
      dark
    >
      <v-list
        nav
        dense
      >
        <v-list-item-group
          v-model="group"
        >
          <div v-for="item in menuItems" :key="item.name">
          <v-list-item v-if="item.userTypes.includes(curUserType)" :to="item.path">
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{item.name}}</v-list-item-title>
          </v-list-item>
          </div>

        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  components: {
  },

  data: () => ({
    drawer: false,
    loginBtnText: 'Войти',
    curUserType: 'guest',
    curUserName: '',
    menuItems: [
      {
        name: 'Главная',
        path: '/',
        icon: 'mdi-home',
        userTypes: [
          'guest',
          'Эколог',
          'Администрато'
        ]
      },
      {
        name: 'Справочники',
        path: '/tables',
        icon: 'mdi-book-open-page-variant',
        userTypes: [
          'Эколог',
          'Администратор'
        ]
      },
      {
        name: 'Регистрация',
        path: '/signup',
        icon: 'mdi-account-plus',
        userTypes: [
          'Администратор'
        ]
      },
      {
        name: 'Статистика',
        path: '/charts',
        icon: 'mdi-chart-line',
        userTypes: [
          'guest',
          'Эколог',
          'Администратор'
        ]
      },


    ]
    //
  }),

  created() {
    this.$isAuth = localStorage.isAuth
    if (this.$isAuth == 1) {
      this.loginBtnText = 'Выйти'
    } else {
      this.loginBtnText = 'Войти'
    }
    this.$userType = localStorage.userType
    this.$userName = localStorage.userName
    this.curUserType = this.$userType
    this.curUserName = this.$userName
  },

  watch: {
    '$isAuth'(val) {
      if (val == 1) {
        this.loginBtnText = 'Выйти'
      } else {
        this.loginBtnText = 'Войти'
      }
    },

    '$userType'(val) {
      this.curUserType = val
    },

    '$userName'(val) {
      this.curUserName = val
    }

  },


  methods: {
    logout() {
      localStorage.userType = 'guest'
      localStorage.userName = ''
      localStorage.isAuth = 0
      this.$userType = 'guest'
      this.$userName = ''
      this.$apiAuthInstance.defaults.headers.common['Authorization'] = ''
      this.$isAuth = 0
      console.log(this.$isAuth)
      this.$router.push('/')
    }
  }
};
</script>
