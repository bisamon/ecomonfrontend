<template>
  <v-container>
    <v-row v-for="(element, index) in curElements" :key="index">
      <v-col cols="7" v-if="!isCompare">
        <v-autocomplete
          :items="tableData"
          item-text="Name"
          return-object
          label="Выберите точку"
          dense
          filled
          v-model="curElements[index].point"
        >
          <template
            v-slot:item="data"
          >{{`${data.item.Name} Lat: ${data.item.Latitude} Lon: ${data.item.Longitude}`}}</template>
        </v-autocomplete>
      </v-col>
      <v-col cols="4" v-if="!isCompare">
        <v-autocomplete
          :items="tableDataMeas"
          item-text="Measurement_type_name"
          return-object
          label="Выберите измерение"
          dense
          filled
          v-model="curElements[index].meas"
        ></v-autocomplete>
      </v-col>
      <v-col cols="1" v-if="!isCompare">
        <v-btn-toggle mandatory>
          <v-btn @click="deleteElement(index)" v-if="index !== 0">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-tooltip bottom v-if="(index === 0)&&(!isForecast)">
            <template v-slot:activator="{ on }">
          <v-btn @click="printForecast()" v-on="on" v-if="(index === 0)&&(!isForecast)">
            <v-icon>mdi-chart-areaspline</v-icon>
          </v-btn>
            </template>
            <span>Отобразить прогноз</span>
          </v-tooltip>
          <v-tooltip bottom v-if="(index === 0)&&(isForecast)">
            <template v-slot:activator="{ on }">
          <v-btn @click="dropForecast()" v-on="on" v-if="(index === 0)&&(isForecast)">
            <v-icon>mdi-close-box</v-icon>
          </v-btn>
            </template>
            <span>Убрать прогноз</span>
          </v-tooltip>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="2" v-if="!isCompare">
        <v-btn @click="addElement()" color="primary" dark>Добавить график</v-btn>
      </v-col>
      <v-col cols="2" v-if="loaded">
        <v-btn @click="comparePeriods()" color="primary" dark>{{ compareBtnText }}</v-btn>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="2" v-if="loaded">
        <v-btn @click="showDate()" color="primary" dark>Доступные даты</v-btn>
      </v-col>
      <v-col cols="2">
        <v-menu
          ref="fromDateMenu"
          v-model="fromDateMenu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field v-model="fromEditDate" label="Дата от" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="fromEditDate" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="fromDateMenu = false">Отмена</v-btn>
            <v-btn text color="primary" @click="$refs.fromDateMenu.save(fromEditDate)">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="2">
        <v-menu
          ref="toDateMenu"
          v-model="toDateMenu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field v-model="toEditDate" label="Дата до" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="toEditDate" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="toDateMenu = false">Отмена</v-btn>
            <v-btn text color="primary" @click="$refs.toDateMenu.save(toEditDate)">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <line-chart
          v-if="loaded&&!isCompare"
          :chartdata="chartdata"
          height="300px"
          width="100%"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <line-chart
          v-if="loaded&&isCompare"
          :chartdata="chartdata"
          height="150px"
          width="100%"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <line-chart
          v-if="loadedCompare&&isCompare"
          :chartdata="chartdataCompare"
          height="150px"
          width="100%"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-spacer></v-spacer>
      <v-col cols="2" v-if="isCompare">
        <v-menu
          ref="fromDateMenu"
          v-model="fromDateMenuCompare"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field v-model="fromEditDateCompare" label="Дата от" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="fromEditDateCompare" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="fromDateMenuCompare = false">Отмена</v-btn>
            <v-btn text color="primary" @click="$refs.fromDateMenuCompare.save(fromEditDateCompare)">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="2" v-if="isCompare">
        <v-menu
          ref="toDateMenu"
          v-model="toDateMenuCompare"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field v-model="toEditDateCompare" label="Дата до" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="toEditDateCompare" no-title scrollable>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="toDateMenuCompare = false">Отмена</v-btn>
            <v-btn text color="primary" @click="$refs.toDateMenuCompare.save(toEditDateCompare)">OK</v-btn>
          </v-date-picker>
        </v-menu>
      </v-col>
    </v-row>

    <v-row v-if="(curCorr.length !== 0)&&!isCompare">
      <v-col cols="8" align-content="center">
        Корреляция {{ curElements[0].meas.Measurement_type_name }} ({{ curElements[0].point.Name }}) с:
      </v-col>
    </v-row>
    <v-row v-if="(curCorr.length !== 0)&&!isCompare">
      <v-col cols="8">
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Измерение</th>
                <th class="text-left">Корреляция</th>
                <th class="text-left">Оценка по Чеддоку</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="corr in curCorr" :key="corr.meas">
                <td>{{ corr.meas }}</td>
                <td>{{ corr.cor }}</td>
                <td>{{ corr.grade }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
      <v-col cols="4">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header>
              Шкала Чеддока
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">От</th>
                      <th class="text-left">До</th>
                      <th class="text-left">Оценка</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="gr in cheddok" :key="gr.desc">
                      <td>{{ gr.grade.from }}</td>
                      <td>{{ gr.grade.to }}</td>
                      <td>{{ gr.desc }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-dialog v-model="isAllowDates" max-width="800px">
      <v-card>
        <v-card-title>
          По выбранным измерениям есть данные за следующие даты:
        </v-card-title>
        <v-card-text>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Измерение</th>                      
                      <th class="text-left">От</th>
                      <th class="text-left">До</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="gr in allowDates" :key="gr.name">
                      <td>{{ gr.name }}</td>
                      <td>{{ gr.min }}</td>
                      <td>{{ gr.max }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>

        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import LineChart from "./LineChart.vue";

export default {
  name: "LineChartContainer",
  components: { LineChart },
  data: () => ({
    loaded: false,
    chartdata: null,
    options: null,
    tableData: [],
    curPoint: [],
    tableName: "point",
    tableDataMeas: [],
    curMeas: [],
    curElements: [],
    curCorr: [],
    fromDateMenu: false,
    fromEditDate: null,
    toDateMenu: false,
    toEditDate: null,
    isForecast: false,
    isCompare: false,
    compareBtnText: "Сравнить периоды",
    graphicHeight: "300px",
    chartdataCompare: null,
    loadedCompare: null,
    fromDateMenuCompare: false,
    fromEditDateCompare: null,
    toDateMenuCompare: false,
    toEditDateCompare: null,
    optionsCompare: null,
    isAllowDates: false,
    allowDates: [],
    cheddok: [
      {
        grade: {from: 0, to: 0.3},
        desc: 'Очень слабая'
      },
      {
        grade: {from: 0.3, to: 0.5},
        desc: 'Слабая'
      },
      {
        grade: {from: 0.5, to: 0.7},
        desc: 'Средняя'
      },
      {
        grade: {from: 0.7, to: 0.9},
        desc: 'Высокая'
      },
      {
        grade: {from: 0.9, to: 1},
        desc: 'Очень высокая'
      }
    ]
  }),
  async mounted() {
    this.loaded = false;
    try {
      this.options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                unit: "hour",
                tooltipFormat : 'YYYY-MM-DD HH:mm'
              }
            }
          ]
        }
      };
      this.optionsCompare = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: "time",
              time: {
                unit: "hour",
                tooltipFormat : 'YYYY-MM-DD HH:mm'
              }
            }
          ]
        }
      };
      //this.loaded = true
    } catch (e) {
      console.error(e);
    }
  },

  watch: {
    curElements: {
      handler: function(val) {
        console.log(val);
        if (this.checkElements()&&!this.isForecast) {
          if (val.length === 1) {
            this.curCorr = [];
            this.refreshOneGraphic();
            this.refreshOneGraphicCompare();
          } else {
            this.refreshGraphics();
            this.refreshGraphicsCompare();
          }
        }
        if (this.checkElements()&&this.isForecast) {
          this.printForecast()
        }
      },
      deep: true
    },

    fromEditDate(val) {
      console.log(val);
      if (this.checkElements()&&!this.isForecast) {
        if (this.curElements.length === 1) {
          this.curCorr = [];
          this.refreshOneGraphic();
        } else {
          this.refreshGraphics();
        }
      }
        if (this.checkElements()&&this.isForecast) {
          this.printForecastSimple()
        }
    },

    toEditDate(val) {
      console.log(val);
      if (this.checkElements()&&!this.isForecast) {
        if (this.curElements.length === 1) {
          this.curCorr = [];
          this.refreshOneGraphic();
        } else {
          this.refreshGraphics();
        }
      }
        if (this.checkElements()&&this.isForecast) {
          this.printForecastSimple()
        }
    },

    fromEditDateCompare(val) {
      console.log(val);
      if (this.checkElements()&&!this.isForecast) {
        if (this.curElements.length === 1) {
          this.curCorr = [];
          this.refreshOneGraphicCompare();
        } else {
          this.refreshGraphicsCompare();
        }
      }
        if (this.checkElements()&&this.isForecast) {
          this.printForecastCompare()
        }
    },

    toEditDateCompare(val) {
      console.log(val);
      if (this.checkElements()&&!this.isForecast) {
        if (this.curElements.length === 1) {
          this.curCorr = [];
          this.refreshOneGraphicCompare();
        } else {
          this.refreshGraphicsCompare();
        }
      }
        if (this.checkElements()&&this.isForecast) {
          this.printForecastCompare()
        }
    }
  },

  created() {
    this.curElements.push({ point: 0, meas: 0 });
    this.getTableData(this.tableName);
    this.getTableDataMeas(this.tableNameMeas);
    let cur_date = new Date();
    this.fromEditDate = `${cur_date.getFullYear()}-${(
      "0" +
      (cur_date.getMonth() + 1)
    ).slice(-2)}-${("0" + cur_date.getDate()).slice(-2)}`;
    this.toEditDate = `${cur_date.getFullYear()}-${(
      "0" +
      (cur_date.getMonth() + 1)
    ).slice(-2)}-${("0" + (cur_date.getDate() + 1)).slice(-2)}`;
    this.fromEditDateCompare = `${cur_date.getFullYear()}-${(
      "0" +
      (cur_date.getMonth() + 1)
    ).slice(-2)}-${("0" + cur_date.getDate()).slice(-2)}`;
    this.toEditDateCompare = `${cur_date.getFullYear()}-${(
      "0" +
      (cur_date.getMonth() + 1)
    ).slice(-2)}-${("0" + (cur_date.getDate() + 1)).slice(-2)}`;

  },

  methods: {
    getTableData(tableName) {
      let searchString = "";
      this.$apiInstance
        .get(`/filter/unauth/${tableName}${searchString}`)
        .then(response => {
          this.tableData = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    },

    getTableDataMeas(tableName) {
      let searchString = "";
      this.$apiInstance
        .get(`/filter/unauth/${tableName}${searchString}`)
        .then(response => {
          this.tableDataMeas = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    },

    addElement() {
      this.curElements.push({ point: 0, meas: 0 });
    },

    deleteElement(index) {
      let tempElements = this.curElements;
      tempElements.splice(index, 1);
      this.curElements = tempElements;
    },

    checkElements() {
      for (let i = 0; i < this.curElements.length; i++) {
        if (this.curElements[i].point === 0 || this.curElements[i].meas === 0) {
          return false;
        }
      }
      return true;
    },

    refreshOneGraphic() {
      let datasets = [];
      this.loaded = false;
      if (
        (new Date(this.toEditDate) - new Date(this.fromEditDate)) /
          1000 /
          3600 /
          24 >
        60
      ) {
        this.options.scales.xAxes[0].time.unit = "month";
      } else {
        if (
          (new Date(this.toEditDate) - new Date(this.fromEditDate)) /
            1000 /
            3600 /
            24 >
          2
        ) {
          this.options.scales.xAxes[0].time.unit = "day";
        } else {
          this.options.scales.xAxes[0].time.unit = "hour";
        }
      }
      this.$apiInstance
        .get(
          `/statistic/point/${this.curElements[0].point.Point_ID}/measurement_type/${this.curElements[0].meas.Measurement_type_ID}?fromDate=${this.fromEditDate}&toDate=${this.toEditDate}`
        )
        .then(response => {
          let resrData = response.data;
          let tempData = resrData;
          let tempNormData = [];
          let pdkData = [];
          tempData.forEach(function(point) {
            tempNormData.push({
              x: new Date(Date.parse(point.x)).toISOString(),
              y: point.y
            });
            pdkData.push({
              x: new Date(Date.parse(point.x)).toISOString(),
              y: this.curElements[0].meas.PDK
            });
          }, this);
          let dataset = {
            label: `${this.curElements[0].point.Name} (${this.curElements[0].meas.Measurement_type_name})`,
            data: tempNormData,
            backgroundColor: "transparent",
            borderColor: "rgba(1, 256, 1, 0.50)",
            pointBackgroundColor: "rgba(256, 1, 256, 1)",
            showLine: true
          };
          let datasetPdk = {
            label: `ПДК`,
            data: pdkData,
            backgroundColor: "transparent",
            borderColor: "rgba(255, 1, 1, 0.50)",
            pointBackgroundColor: "rgba(255, 1, 1, 1)",
            showLine: true,
            pointRadius: 0
          };
          this.chartdata = { datasets: datasets };
          this.loaded = true;
        })
        .catch(error => {
          console.log(error);
        });
    },

    refreshGraphics() {
      let datasets = [];
      let reqData = [];
      for (let i = 0; i < this.curElements.length; i++) {
        reqData.push({
          point: this.curElements[i].point.Point_ID,
          meas: this.curElements[i].meas.Measurement_type_ID,
          fromDate: this.fromEditDate,
          toDate: this.toEditDate
        });
      }
      this.loaded = false;
      if (
        (new Date(this.toEditDate) - new Date(this.fromEditDate)) /
          1000 /
          3600 /
          24 >
        60
      ) {
        this.options.scales.xAxes[0].time.unit = "month";
      } else {
        if (
          (new Date(this.toEditDate) - new Date(this.fromEditDate)) /
            1000 /
            3600 /
            24 >
          2
        ) {
          this.options.scales.xAxes[0].time.unit = "day";
        } else {
          this.options.scales.xAxes[0].time.unit = "hour";
        }
      }
      this.$apiInstance
        .post(`/statistic/normalize`, reqData)
        .then(response => {
          let resrData = response.data;
          for (let i = 0; i < this.curElements.length; i++) {
            let tempData = resrData[i];
            let tempNormData = [];
            tempData.forEach(function(point) {
              tempNormData.push({
                x: new Date(Date.parse(point.x)).toISOString(),
                y: point.y
              });
              point.x = new Date(Date.parse(point.x));
            });
            let dataset = {
              label: `${this.curElements[i].meas.Measurement_type_name} (${this.curElements[i].point.Name})`,
              data: tempNormData,
              backgroundColor: "transparent",
              borderColor: `rgba(${Math.floor(
                Math.random() * Math.floor(256)
              )}, ${Math.floor(Math.random() * Math.floor(256))}, ${Math.floor(
                Math.random() * Math.floor(256)
              )}, 0.50)`,
              pointBackgroundColor: `rgba(${Math.floor(
                Math.random() * Math.floor(256)
              )}, ${Math.floor(Math.random() * Math.floor(256))}, ${Math.floor(
                Math.random() * Math.floor(256)
              )}, 1)`,
              showLine: true
            };
            datasets.push(dataset);
          }
          this.chartdata = { datasets: datasets };
        })
        .catch(error => {
          console.log(error);
        });
      this.$apiInstance
        .post(`/statistic/correlations`, reqData)
        .then(response => {
          this.curCorr = []
          for (let i = 1; i < response.data.length; i++) {
            this.curCorr.push({meas: `${this.curElements[i].point.Name} (${this.curElements[i].meas.Measurement_type_name})`, cor: response.data[i], grade: this.checkGrade(response.data[i])})
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    checkGrade(corr) {
      let napr = ' прямая'
      if (corr < 0) {
        napr = ' обратная'
      }
      for(let i = 0; i < this.cheddok.length; i++) {
        if ((Math.abs(corr) >= this.cheddok[i].grade.from)&&(Math.abs(corr) < this.cheddok[i].grade.to)) {
          return this.cheddok[i].desc + napr
        }
      }
    },

    printForecast() {
      this.isForecast = true
      this.printForecastSimple()
      this.printForecastCompare()
    },

    printForecastSimple(){
      let datasets = [];
      let reqData = [];
      let pdkData = [];
      for (let i = 0; i < this.curElements.length; i++) {
        reqData.push({
          point: this.curElements[i].point.Point_ID,
          meas: this.curElements[i].meas.Measurement_type_ID,
          fromDate: this.fromEditDate,
          toDate: this.toEditDate
        });
      }
      this.loaded = false;
      if (
        (new Date(this.toEditDate) - new Date(this.fromEditDate)) /
          1000 /
          3600 /
          24 >
        60
      ) {
        this.options.scales.xAxes[0].time.unit = "month";
      } else {
        if (
          (new Date(this.toEditDate) - new Date(this.fromEditDate)) /
            1000 /
            3600 /
            24 >
          2
        ) {
          this.options.scales.xAxes[0].time.unit = "day";
        } else {
          this.options.scales.xAxes[0].time.unit = "hour";
        }
      }
      this.$apiInstance
        .post(`/forecast`, reqData)
        .then(response => {
          let resrData = response.data;
          for (let i = 0; i < 2; i++) {
            let tempData = resrData[i];
            let tempNormData = [];
            tempData.forEach(function(point) {
              tempNormData.push({
                x: new Date(Date.parse(point.x)).toISOString(),
                y: point.y
              });
              if (i === 1) {
              pdkData.push({
                x: new Date(Date.parse(point.x)).toISOString(),
                y: this.curElements[0].meas.PDK
              });
              }
            }, this);
            let cur_label = `${this.curElements[0].meas.Measurement_type_name} (${this.curElements[0].point.Name})`
            if (i === 1) {
              cur_label = `Прогноз ${cur_label}`
            }
            let dataset = {
              label: cur_label,
              backgroundColor: "transparent",
              borderColor: `rgba(${Math.floor(
                Math.random() * Math.floor(256)
              )}, ${Math.floor(Math.random() * Math.floor(256))}, ${Math.floor(
                Math.random() * Math.floor(256)
              )}, 0.50)`,
              pointBackgroundColor: `rgba(${Math.floor(
                Math.random() * Math.floor(256)
              )}, ${Math.floor(Math.random() * Math.floor(256))}, ${Math.floor(
                Math.random() * Math.floor(256)
              )}, 1)`,
              showLine: true
            };
            datasets.push(dataset);
          }
          let datasetPdk = {
            label: `ПДК`,
            data: pdkData,
            backgroundColor: "transparent",
            borderColor: "rgba(255, 1, 1, 0.50)",
            pointBackgroundColor: "rgba(255, 1, 1, 1)",
            showLine: true,
            pointRadius: 0
          };
          datasets.push(datasetPdk);
          this.chartdata = { datasets: datasets };
          this.loaded = true;
        })
        .catch(error => {
          console.log(error);
        });
        this.curCorr = []
    },

    printForecastCompare(){
      let datasetsCompare = [];
      let reqDataCompare = [];
      let pdkDataCompare = [];
      for (let i = 0; i < this.curElements.length; i++) {
        reqDataCompare.push({
          point: this.curElements[i].point.Point_ID,
          meas: this.curElements[i].meas.Measurement_type_ID,
          fromDate: this.fromEditDateCompare,
          toDate: this.toEditDateCompare
        });
      }
      this.loadedCompare = false;
      if (
        (new Date(this.toEditDateCompare) - new Date(this.fromEditDateCompare)) /
          1000 /
          3600 /
          24 >
        60
      ) {
        this.optionsCompare.scales.xAxes[0].time.unit = "month";
      } else {
        if (
          (new Date(this.toEditDateCompare) - new Date(this.fromEditDateCompare)) /
            1000 /
            3600 /
            24 >
          2
        ) {
          this.optionsCompare.scales.xAxes[0].time.unit = "day";
        } else {
          this.optionsCompare.scales.xAxes[0].time.unit = "hour";
        }
      }
      this.$apiInstance
        .post(`/forecast`, reqDataCompare)
        .then(response => {
          let resrDataCompare = response.data;
          for (let i = 0; i < 2; i++) {
            let tempNormDataCompare = [];
            tempDataCompare.forEach(function(point) {
              tempNormDataCompare.push({
                x: new Date(Date.parse(point.x)).toISOString(),
                y: point.y
              });
              if (i === 1) {
              pdkDataCompare.push({
                x: new Date(Date.parse(point.x)).toISOString(),
                y: this.curElements[0].meas.PDK
              });
              }
            }, this);
            let cur_labelCompare = `${this.curElements[0].meas.Measurement_type_name} (${this.curElements[0].point.Name})`
            if (i === 1) {
              cur_labelCompare = `Прогноз ${cur_labelCompare}`
            }
            let datasetCompare = {
              label: cur_labelCompare,
              data: tempNormDataCompare,
              backgroundColor: "transparent",
              borderColor: `rgba(${Math.floor(
                Math.random() * Math.floor(256)
              )}, ${Math.floor(Math.random() * Math.floor(256))}, ${Math.floor(
                Math.random() * Math.floor(256)
              )}, 0.50)`,
              pointBackgroundColor: `rgba(${Math.floor(
                Math.random() * Math.floor(256)
              )}, ${Math.floor(Math.random() * Math.floor(256))}, ${Math.floor(
                Math.random() * Math.floor(256)
              )}, 1)`,
              showLine: true
            };
            datasetsCompare.push(datasetCompare);
          }
          let datasetPdkCompare = {
            label: `ПДК`,
            data: pdkDataCompare,
            backgroundColor: "transparent",
            borderColor: "rgba(255, 1, 1, 0.50)",
            pointBackgroundColor: "rgba(255, 1, 1, 1)",
            showLine: true,
            pointRadius: 0
          };
          datasetsCompare.push(datasetPdkCompare);
          this.chartdataCompare = { datasets: datasetsCompare };
          this.loadedCompare = true;
        })
        .catch(error => {
          console.log(error);
        });


    },


    dropForecast() {
      this.isForecast = false
        if (this.checkElements()&&!this.isForecast) {
          if (this.curElements.length === 1) {
            this.curCorr = [];
            this.refreshOneGraphic();
            this.refreshOneGraphicCompare();
          } else {
            this.refreshGraphics();
            this.refreshGraphicsCompare();
          }
        }
    },

    comparePeriods() {
      if (this.isCompare) {
        this.compareBtnText = "Сравнить периоды"
        this.isCompare = false
      } else {
        this.compareBtnText = "Назад"
        this.isCompare = true
      }
    },

    refreshOneGraphicCompare() {
      let datasets = [];
      this.loadedCompare = false;
      if (
        (new Date(this.toEditDateCompare) - new Date(this.fromEditDateCompare)) /
          1000 /
          3600 /
          24 >
        60
      ) {
        this.optionsCompare.scales.xAxes[0].time.unit = "month";
      } else {
        if (
          (new Date(this.toEditDateCompare) - new Date(this.fromEditDateCompare)) /
            1000 /
            3600 /
            24 >
          2
        ) {
          this.optionsCompare.scales.xAxes[0].time.unit = "day";
        } else {
          this.optionsCompare.scales.xAxes[0].time.unit = "hour";
        }
      }
      this.$apiInstance
        .get(
          `/statistic/point/${this.curElements[0].point.Point_ID}/measurement_type/${this.curElements[0].meas.Measurement_type_ID}?fromDate=${this.fromEditDateCompare}&toDate=${this.toEditDateCompare}`
        )
        .then(response => {
          let resrData = response.data;
          let tempData = resrData;
          let tempNormData = [];
          let pdkData = [];
          tempData.forEach(function(point) {
            tempNormData.push({
              x: new Date(Date.parse(point.x)).toISOString(),
              y: point.y
            });
            pdkData.push({
              x: new Date(Date.parse(point.x)).toISOString(),
              y: this.curElements[0].meas.PDK
            });
          }, this);
          let dataset = {
            label: `${this.curElements[0].point.Name} (${this.curElements[0].meas.Measurement_type_name})`,
            data: tempNormData,
            borderColor: "rgba(1, 256, 1, 0.50)",
            pointBackgroundColor: "rgba(256, 1, 256, 1)",
            showLine: true
          };
          let datasetPdk = {
            label: `ПДК`,
            data: pdkData,
            borderColor: "rgba(255, 1, 1, 0.50)",
            pointBackgroundColor: "rgba(255, 1, 1, 1)",
            showLine: true,
            pointRadius: 0
          };
          datasets.push(dataset);
          datasets.push(datasetPdk);
          this.chartdataCompare = { datasets: datasets };
        })
        .catch(error => {
          console.log(error);
        });
    },

    refreshGraphicsCompare() {
      let datasets = [];
      let reqData = [];
      for (let i = 0; i < this.curElements.length; i++) {
        reqData.push({
          point: this.curElements[i].point.Point_ID,
          meas: this.curElements[i].meas.Measurement_type_ID,
          fromDate: this.fromEditDateCompare,
          toDate: this.toEditDateCompare
        });
      }
      if (
        (new Date(this.toEditDateCompare) - new Date(this.fromEditDateCompare)) /
          1000 /
          3600 /
          24 >
        60
      ) {
        this.optionsCompare.scales.xAxes[0].time.unit = "month";
      } else {
        if (
          (new Date(this.toEditDateCompare) - new Date(this.fromEditDateCompare)) /
            1000 /
            3600 /
            24 >
          2
        ) {
          this.optionsCompare.scales.xAxes[0].time.unit = "day";
        } else {
          this.optionsCompare.scales.xAxes[0].time.unit = "hour";
        }
      }
      this.$apiInstance
        .post(`/statistic/normalize`, reqData)
        .then(response => {
          let resrData = response.data;
          for (let i = 0; i < this.curElements.length; i++) {
            let tempData = resrData[i];
            let tempNormData = [];
            tempData.forEach(function(point) {
              tempNormData.push({
                x: new Date(Date.parse(point.x)).toISOString(),
                y: point.y
              });
              point.x = new Date(Date.parse(point.x));
            });
            let dataset = {
              label: `${this.curElements[i].meas.Measurement_type_name} (${this.curElements[i].point.Name})`,
              data: tempNormData,
              backgroundColor: "transparent",
              borderColor: `rgba(${Math.floor(
                Math.random() * Math.floor(256)
              )}, ${Math.floor(Math.random() * Math.floor(256))}, ${Math.floor(
                Math.random() * Math.floor(256)
              )}, 0.50)`,
              pointBackgroundColor: `rgba(${Math.floor(
                Math.random() * Math.floor(256)
              )}, ${Math.floor(Math.random() * Math.floor(256))}, ${Math.floor(
                Math.random() * Math.floor(256)
              )}, 1)`,
              showLine: true
            };
            datasets.push(dataset);
          }
          this.chartdataCompare = { datasets: datasets };
          this.loadedCompare = true;
        })
        .catch(error => {
          console.log(error);
        });
    },

    showDate() {      
      let reqData = [];
      for (let i = 0; i < this.curElements.length; i++) {
        reqData.push({
          point: this.curElements[i].point.Point_ID,
          meas: this.curElements[i].meas.Measurement_type_ID,
        });
      }
      this.$apiInstance
        .post(`/statistic/periods`, reqData)
        .then(response => {
          this.allowDates = []
          for (let i = 0; i < response.data.length; i++) {
            let minDate = `${new Date(Date.parse(response.data[i].min)).getFullYear()}-${new Date(Date.parse(response.data[i].min)).getMonth()+1}-${new Date(Date.parse(response.data[i].min)).getDate()}`
            let maxDate = `${new Date(Date.parse(response.data[i].max)).getFullYear()}-${new Date(Date.parse(response.data[i].max)).getMonth()+1}-${new Date(Date.parse(response.data[i].max)).getDate()}`
            this.allowDates.push({name: `${this.curElements[i].point.Name} (${this.curElements[i].meas.Measurement_type_name})`, min: minDate, max: maxDate})
          }
          this.isAllowDates = true
        })
        .catch(error => {
          console.log(error);
        });

    }


  }
};
</script>