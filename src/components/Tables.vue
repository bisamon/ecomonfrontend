<template>
    <v-container>
        <v-autocomplete
        v-model="currentTable"
        :items="tables"
        item-value="table_name"
        label="Выберите справочник"
        >
        </v-autocomplete>
        <v-data-table
        :headers="tableDefinition"
        :items="tableData"
        class="elevation-1"
        :search="searchText"
        >
            <template v-slot:top>
                <v-toolbar flat color="white">
                    <v-container>
                        <v-text-field
                        v-model="searchText"
                        append-icon="mdi-magnify"
                        label="Поиск"
                        single-line
                        hide-details
                        ></v-text-field>
                    </v-container>
                    <v-dialog v-model="dialogItem" max-width="500px">
                        <template v-slot:activator="{ on }">
                            <v-btn color="primary" dark class="mb-2" v-on="on">Добавить</v-btn>
                        </template>
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
                                        v-if="field.text!=='' && field.value == field.realName"></v-text-field>
                                        <v-autocomplete
                                        v-else-if="field.text!==''"
                                        v-model="editedItem[field.realName]"
                                        :items="relationTables[field.realName]"
                                        :item-text="field.value"
                                        :label="field.text">
                                        </v-autocomplete>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" dark text @click="closeItem">Отмена</v-btn>
                                <v-btn color="primary" dark text @click="saveItem">Сохранить</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>
            <template v-slot:item.action="{ item }">
                <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                >
                    mdi-pencil
                </v-icon>
                <v-icon
                small
                @click="deleteItem(item)"
                >
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>
    </v-container>
</template>

<script>
export default {
    data: () => ({
        tables: [],
        currentTable: null,
        currentRussianTable: '',
        tableDefinition: [],
        tableData: [],
        actionField: { text: '', value: 'actions', sortable: false },
        searchText: '',
        dialogItem: false,
        editedItem: {},
        editedIndex: -1,
        editedID: -1,
        originTableDefinition: [],
        isEdit: false,
        relationTables: {}
    }),

    watch: {
        currentTable: function(val) {
            this.getTableDefiniton(val)
            this.getTableData(val)
            this.currentRussianTable = this.getRussianTable(val)
            this.getRelationTables(val)
        },
        
        dialogItem: function(val) {
            if (!val) {
                this.editedItem = {}
                console.log(this.editedItem)
                this.isEdit = false
                this.editedID = -1
                this.originTableDefinition.forEach(element => {
                    if (!element.is_primary_key) {
                        this.editedItem[element.name] = ''
                    }
                });
            }
            console.log(this.editedItem)
        }
    },

    created () {
      this.getAllTables()
    },

    methods: {
        getRussianTable(tableName) {
            let result = ''
            this.tables.forEach(element => {
                if (element.table_name == tableName) {
                    result = element.russian_table_name
                }
            })
            return result
        },

        getAllTables() {
            this.$apiAuthInstance.get('/objects')
                .then(response => {
                    this.tables = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        },

        getTableDefiniton(tableName) {
            this.$apiAuthInstance.get(`/definitions/${tableName}`)
                .then(response => {
                    this.tableDefinition = []
                    this.tableID = ''
                    let buffDef = []
                    this.editedItem = {}
                    this.originTableDefinition = response.data
                    this.originTableDefinition.forEach(element => {
                        if (!element.is_primary_key) {
                            buffDef.push({text: element.russian_names, value: element.alias, realName: element.name})
                            this.editedItem[element.name] = ''
                        } else {
                            this.tableID = element.name
                        }
                    });
                    buffDef.push(this.actionField)
                    this.tableDefinition = buffDef
                })
                .catch(error => {
                    console.log(error);
                })
        },

        getTableData(tableName) {
            this.$apiAuthInstance.get(`/extended/object/${tableName}`)
                .then(response => {
                    this.tableData = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        },

        getRelationTables(tableName) {
            this.$apiAuthInstance.get(`/extended/object/${tableName}/relations`)
                .then(response => {
                    this.relationTables = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        },

        editItem(item) {
            this.editedIndex = this.tableData.indexOf(item)
            this.editedID = item[this.tableID]
            this.editedItem = Object.assign({}, item)
            this.isEdit = true
            this.dialogItem = true
        },

        deleteItem(item) {
            if (confirm(`Уверены, что хотите удалить ${this.currentRussianTable}?`)) {
                this.$apiAuthInstance.delete(`/object/${this.currentTable}/${item[this.tableID]}`)
                    .then(response => {
                        if (response.status == 200) {
                            this.getTableData(this.currentTable)
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        },

        closeItem() {
            this.dialogItem = false
        },

        saveItem() {
            if (!this.isEdit) {
                this.$apiAuthInstance.post(`/object/${this.currentTable}`, this.editedItem)
                    .then(response => {
                        if (response.status == 400) {
                            this.getTableData(this.currentTable)
                            this.dialogItem = false
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
            } else {
                this.$apiAuthInstance.put(`/object/${this.currentTables}/${this.editedID}`, this.editedItem)
                    .then(response => {
                        if (response.status == 200) {
                            this.getTableData(this.currentTable)
                            this.dialogItem = false
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        }

    }
}
</script>