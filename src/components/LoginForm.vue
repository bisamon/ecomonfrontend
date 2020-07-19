<template>
    <v-container>
        <v-row 
        class="text-center" 
        justify="center"
        >
            <v-form>
                <v-text-field
                label="Login"
                v-model="authData.login"
                >
                </v-text-field>
                <v-text-field
                label="Password"
                :type="show1 ? 'text' : 'password'"
                v-model="authData.password"
                >
                </v-text-field>
                <v-btn @click="tryAuth">
                    Войти
                </v-btn>
            </v-form>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'LoginForm',

    data: ()=> ({
        authData: {
            login: '',
            password: ''
        },
        show1: false
    }),

    methods: {
        tryAuth() {
            this.$apiInstance.post('/auth/', this.authData)
                .then(response => {
                    if (response.status == 200) {
                        localStorage.token = response.data.token
                        localStorage.userType = response.data.userType
                        localStorage.userName = response.data.userName
                        localStorage.isAuth = 1
                        this.$userType = response.data.userType
                        this.$userName = response.data.userName
                        this.$apiAuthInstance.defaults.headers.common['Authorization'] = `${localStorage.token}`
                        this.$isAuth = 1
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }
}
</script>>