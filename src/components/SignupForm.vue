<template>
    <v-container>
        <v-row 
        class="text-center" 
        align="center" 
        justify="center"
        >
            <v-col cols="6">
                        <v-card>
                            <v-card-title>
                                <span class="headline">{{currentRussianTable}}</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-row v-for="field in tableDefinition" :key="field.text">
                                        <v-text-field
                                        v-model="editedItem[field.realName]" 
                                        :label="field.text" 
                                        clearable
                                        v-if="field.value == field.realName && field.value !=='Password_hash'"></v-text-field>
                                        <v-autocomplete
                                        v-else-if="field.value !=='Password_hash'"
                                        v-model="editedItem[field.realName]"
                                        :items="relationTables[field.realName]"
                                        :item-text="field.value"
                                        :item-value="field.realName"
                                        :label="field.text">
                                        </v-autocomplete>
                                        <v-text-field
                                        v-model="editedItem[field.realName]" 
                                        label="Пароль" 
                                        :type="show1 ? 'text' : 'password'"
                                        :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append="show1 = !show1"
                                        v-else></v-text-field>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" dark text @click="closeItem">Отмена</v-btn>
                                <v-btn color="primary" dark text @click="saveItem">Сохранить</v-btn>
                            </v-card-actions>
                        </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'SignupForm',

    data: ()=> ({
        tableName: 'user',
        relationTables: {},
        tableDefinition: [],
        tableData: [],
        editedItem: {},
        originTableDefinition: [],
        tableID: '',
        show1: false,
        currentRussianTable: 'Регистрация пользователя',
    }),

    created() {
        this.getRelationTables(this.tableName)
        this.getTableDefiniton(this.tableName)
    },

    methods: {
        getRelationTables(tableName) {
            this.$apiAuthInstance.get(`/extended/object/${tableName}`)
                .then(response => {
                    this.relationTables = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        },

        getTableDefiniton(tableName) {
            this.$apiAuthInstance.get(`/definition/${tableName}`)
                .then(response => {
                    this.tableDefinition = []
                    this.tableID = ''
                    let buffDef = []
                    this.editedItem = {}
                    this.originTableDefinition.forEach(element => {
                        if (!element.is_primary_key) {
                            buffDef.push({text: element.russian_name, value: element.alias, realName: element.name})
                            this.editedItem[element.name] = ''
                        } else {
                            this.tableID = element.name
                        }
                    });
                    this.tableDefinition = buffDef
                })
                .catch(error => {
                    console.log(error);
                })
        },

        saveItem() {
            let savedItem = this.editedItem
                console.log(this.editedItem)
                this.$apiAuthInstance.post(`/sign`, savedItem)
                    .then(response => {
                        if (response.status == 200) {
                            this.closeItem()
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
        },

        closeItem() {
            this.editedItem = {}
        },
    }
}
</script>>