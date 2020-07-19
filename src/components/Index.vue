<template>
<v-container>
    <v-row>
        <v-col cols="3">
          <v-autocomplete
          :items="relationTables.Point_type_ID"
          item-text="Point_type_name"
          return-object
          label="Тип точки"
          dense
          filled
          v-model="curPointType">
          </v-autocomplete>
        </v-col>
        <v-col cols="7">
        <v-autocomplete
        :items="tableData"
        item-text="Name"
        return-object
        label="Выберите точку"
        dense
        filled
        v-model="curPoint">
        <template v-slot:item="">
            {{`${data.item.Name} Lat: ${data.item.Latitude} Lon: ${data.item.Longitude}`}}
        </template>
        </v-autocomplete>
        </v-col>
        <v-col cols="2">
            <v-btn-toggle
            mandatory>
            <v-tooltip bottom>
            <template v-slot:activator="{ on }">
            <v-btn @click="edidItem(curPoint)" v-on="on" :disabled="buttonsDisabled">
                <v-icon>
                    mdi-pencil
                </v-icon>
            </v-btn>
            </template>
            <span>Редактировать точку</span>
            </v-tooltip>
                    <v-dialog v-model="dialogItem" max-width="500px">
                        <template v-slot:activator="{ on: dialog }">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on: tooltip }">
                            <v-btn v-on="{...dialog, ...tooltip}" :disabled="buttonsDisabled"><v-icon>mdi-plus</v-icon></v-btn>
                            </template>
                            <span>Добавить новую точку</span>
                          </v-tooltip>
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
                                        :item-value="field.realName"
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
            <v-tooltip bottom>
            <template v-slot:activator="{ on }">
            <v-btn @click="deleteItem(curPoint)" v-on="on" :disabled="buttonsDisabled">
                <v-icon>
                    mdi-delete
                </v-icon>
            </v-btn>
            </template>
            <span>Удалить точку</span>
            </v-tooltip>
            
            <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
            <v-btn v-on="{...tooltip}" @click="insertTry" :disabled="buttonsDisabled||tryBtnDisabled">
                <v-icon>
                    mdi-flask-empty-plus-outline
                </v-icon>
            </v-btn>
            </template>
            <span>Внести пробу</span>
            </v-tooltip>
                <v-dialog v-model="dialogTry" max-width="700px">
                <v-card>
                    <v-card-title>
                        <span class="headline">Внесите пробу</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="6">
                                    <v-menu
                                        ref="tryDateMenu"
                                        v-model="tryDateMenu"
                                        :close-on-content-click="false"
                                        :return-value.sync="date"
                                        transition="scale-transition"
                                        offset-y
                                        min-width="290px"
                                    >
                                        <template v-slot:activator="{ on }">
                                        <v-text-field
                                            v-model="tryEditItem['Start_time']"
                                            label="Дата"
                                            readonly
                                            v-on="on"
                                        ></v-text-field>
                                        </template>
                                        <v-date-picker v-model="tryEditItem['Start_time']" no-title scrollable>
                                        <v-spacer></v-spacer>
                                        <v-btn text color="primary" @click="tryDateMenu = false">Отмена</v-btn>
                                        <v-btn text color="primary" @click="$refs.tryDateMenu.save(tryEditItem['Start_time'])">OK</v-btn>
                                        </v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="3">
                                    <v-autocomplete
                                    :items="hours"
                                    v-model="tryEditItem['hour']"
                                    label="Часы"
                                    >
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="3">
                                    <v-autocomplete
                                    :items="minutes"
                                    v-model="tryEditItem['minutes']"
                                    label="Минуты"
                                    >
                                    </v-autocomplete>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="5">
                                    <v-text-field
                                    v-model="tryEditItem['Duration']"
                                    label="Продолжительность(мин)">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field
                                    v-model="tryEditItem['Cicle_number']"
                                    label="Номер прохода">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="3">
                                    <v-checkbox
                                    v-model="tryEditItem['Is_public']"
                                    label="Публичность">
                                    </v-checkbox>
                                </v-col>
                            </v-row>
                            <v-divider></v-divider>
                            <v-card>
                            <v-container>
                            <v-row justify="center">
                                    <v-btn @click="addMeasurement()" color="primary" dark>
                                        Добавить измерение
                                    </v-btn>
                            </v-row>
                            <v-row v-for="(measurement) in measurementsEditItem" :key="index">
                                <v-col cols="7">
                                    <v-autocomplete
                                    :items="measurementTypes"
                                    item-text="Measurement_type_name"
                                    item-value="Measurement_type_ID"
                                    label="Тип измерения"
                                    v-model="measurementsEditItem[index].Measurement_type_ID">
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="3">
                                    <v-text-field
                                    v-model="measurementsEditItem[index].Value"
                                    label="Значение">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-btn @click="deleteMeasurement(index)">
                                        <v-icon>
                                            mdi-delete
                                        </v-icon>
                                    </v-btn>
                                </v-col>
                            </v-row>
                            </v-container>
                            </v-card>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" dark text @click="closeTry">Отмена</v-btn>
                        <v-btn color="primary" dark text @click="saveTry">Сохранить</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            </v-btn-toggle>
        </v-col>
    </v-row>
    <v-row>
    <v-col cols="12">
      <div>
        <yandex-map :coords="coords" @click="onClick" :zoom="mapZoom">
            <ymap-marker
            marker-id="0"
            marker-type="circle"
            :circle-radius="mapZoom-11">
            </ymap-marker>
          <ymap-marker v-for="(point, index) in tableData" :key="index"
            :coords="[point.Latitude, point.Longitude]"
            @click="choosePoint(point)"
            @dblclick="dbchoosePoint(point)"
          ></ymap-marker>
        </yandex-map>
      </div>
    </v-col>
  </v-row>
  <v-dialog v-model="dialogPoint" max-width="500px">
      <v-card>
          <v-card-title>
              {{curPointTypeName}}: {{curPoint.Name}}
          </v-card-title>
          <v-card-text>
              <v-container>
                  <v-row>
              Широта: {{curPoint.Latitude}}
                  </v-row>
                  <v-row>
              Долгота: {{curPoint.Longitude}}
                  </v-row>
              </v-container>
          </v-card-text>
      </v-card>
  </v-dialog>
</v-container>
</template>

<script>
export default {
  data: () => ({
    coords: [43.10562, 131.87353],
        tableName: 'point',
        relationTables: {},
        tableDefinition: [],
        tableData: [],
        editedItem: {},
        originTableDefinition: [],
        tableID: '',
        show1: false,
        currentRussianTable: 'Точка на карте',
        dialogItem: false,
        isEdit: false,
        curPointType: 0,
        curPoint: 0,
        editedIndex: -1,
        editedID: -1,
        dialogTry: false,
        tryEditItem: {},
        measurementsEditItem: [],
        hours: [],
        minutes: [],
        measurementTypes: [],
        tryDateMenu: false,
        buttonsDisabled: true,
        mapZoom: 18,
        dialogPoint: false,
        tryBtnDisabled: true,
        curPointTypeName: ''
  }),
  computed: {
    balloonTemplate() {
      return `
      `
    },
  },

    watch: {
      curPointType (val) {
        console.log(val)
        if (val.Point_type_name == 'Источник загрязнения') {
            this.tryBtnDisabled = true
        } else {
            this.tryBtnDisabled = false
        }
        this.getTableDatas(this.tableName)
      },

      dialogItem (val) {
          if(val){
              this.editedItem['Latitude'] = this.coords[0]
              this.editedItem['Longitude'] = this.coords[1]
          } else {
              this.editedItem = {}
              this.editedIndex = -1
              this.editedID = -1
          }
      },

      dialogTry (val) {
          if (!val) {
              this.tryEditItem = {}
              this.measurementsEditItem = []
          }
      },

      curPoint (val) {
        this.coords = [val.Latitude, val.Longitude]
      },



    '$isAuth'(val) {
      if (val == 1) {
        this.buttonsDisabled = false
      } else {
        this.buttonsDisabled = true
      }
    },
    },

    created () {
      this.getTableDefiniton(this.tableName)
      this.getRelationTables(this.tableName)
      this.getTableData(this.tableName)
      for (var i = 0; i < 15; i++) {
          this.hours.push(i)
      }
      for (var j = 0; j < 40; j++) {
          this.minutes.push(j)
      }
      this.getMeasurementTypes()
      if (this.$isAuth == 1) {
        this.buttonsDisabled = false
      } else {
        this.buttonsDisabled = true
      }    },

  methods: {
        onClick(e) {
          this.coords = e.get('coords');
        },

        getRelationTables(tableName) {
            this.$apiInstance.get(`/extended/object/unauth/${tableName}`)
                .then(response => {
                    this.relationTables = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        },

        getTableDefiniton(tableName) {
            this.$apiInstance.get(`/definition/unauth/${tableName}`)
                .then(response => {
                    this.tableDefinition = []
                    this.tableID = ''
                    let buffDef = []
                    this.editedItem = {}
                    this.originTableDefinition = response.data
                    this.originTableDefinition.forEach(element => {
                        if (!element.is_primary_key) {
                            buffDef.push({text: element.russian_name, value: element.alias, realName: element.name})
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

        getTableData(tableName) {
            let searchString = ''
            if (this.curPointType !== 0) {
              searchString = `?Point_type_ID=${this.curPointType.Point_type_ID}`
            }
            this.$apiInstance.get(`/filter/auth/${tableName}${searchString}`)
                .then(response => {
                    this.tableData = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        },

        closeItem() {
            this.dialogItem = false
        },

        editItem(item) {
            if (this.curPoint != 0) {
                this.editedIndex = this.tableData.indexOf(item)
                this.editedID = item[this.tableID]
                this.editedItem = Object.assign({}, item)
                this.isEdit = true
                this.dialogItem = true
            } else {
                alert('Выберите точку, которую необходимо отредактировать.')
            }
        },

        deleteItem(item) {
            if (confirm(`Уверены, что хотите удалить ${this.currentRussianTable}?`)) {
                this.$apiAuthInstance.delete(`/object/${this.currentTable}/${item[this.tableID]}`)
                    .then(response => {
                        if (response.status == 300) {
                            this.getTableData(this.currentTable)
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        },

        saveItem() {
            if (!this.isEdit) {
                this.$apiAuthInstance.post(`/object/${this.currentTable}`, this.editedItems)
                    .then(response => {
                        if (response.status == 200) {
                            this.getTableData(this.currentTable)
                            this.dialogItem = false
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
            } else {
                this.$apiAuthInstance.put(`/object/${this.currentTable}/${this.editedID}`, this.editedItem)
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
        
        getMeasurementTypes() {
            this.$apiAuthInstance.get(`/object/measurement_type`)
                .then(response => {
                    this.measurementTypes = response.data;
                })
                .catch(error => {
                    console.log(error);
                })

        },

        addMeasurement() {
            this.measurementsEditItem.push({Measurement_type_ID: null, Value: null, Point_ID: this.curPoint.Point_ID})
        },

        deleteMeasurement(index) {
            this.measurementsEditItem.pop(index)
        },

        closeTry() {
            this.dialogTry = false
        },

        saveTry() {
            console.log({try: this.tryEditItem, measurements: this.measurementsEditItem})
                this.$apiAuthInstance.post(`/extended/object/try`, {trys: this.tryEditItem, measurements: this.measurementsEditItem})
                    .then(response => {
                        if (response.status == 200) {
                            this.dialogTry = false
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    })
        },

        insertTry() {
            if (this.curPoint == 0) {
                alert('Чтобы внести пробу, необходимо выбрать точку.')
            } else {
                this.dialogTry = true
            }
        },

        choosePoint(point) {
            this.curPoint = point
        },

        dbchoosePoint(point) {
            this.choosePoint(point)
            this.curPointTypeName = this.relationTables.Point_type_ID.find(x => x.Point_type_ID === point.Point_type_ID).Point_type_name
            this.dialogPoint = true
        }



  },
}
</script>

<style>

.ymap-container {
  height: 100px;
}
.red {
  color: red;
}

.my-div {
  height: 800px;
  overflow-y:auto;
}

</style>