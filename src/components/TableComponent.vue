<template>
  <div>
    <v-data-table
      :headers="headers"
      v-model="tableSelected"
      :items="items"
      item-key="id"
      :page="page"
      :items-per-page="itemsPerPage"
      :footer-props="{ itemsPerPageOptions: [10, 15, 20] }"
      :show-select="true"
      :loading="loading"
    >
      <template v-slot:top>
        <v-row align="center">
          <v-col cols="2">
            <v-menu offset-y :disabled="tableActionsDisabled">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  v-bind="attrs"
                  v-on="on"
                  :disabled="tableActionsDisabled"
                >
                  Actions
                </v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in tableActions"
                  :key="`action_${index}`"
                  @click="shoseAction(item.action)"
                >
                  <v-list-item-icon v-if="item.icon">
                    <v-icon v-text="item.icon"></v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    {{ item.action }}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col cols="3">
            <v-select
              label="1-st column"
              :items="selectItems"
              item-text="text"
              item-value="value"
              v-model="firstCol"
            ></v-select>
          </v-col>
          <v-col>
            <v-select
              label="Shown columns"
              :chips="true"
              :small-chips="true"
              :deletable-chips="true"
              :items="selectVisCols"
              item-text="text"
              item-value="value"
              :multiple="true"
              :value="defVisibleCols"
              @input="changeListCols($event)"
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-alert
            width="100%"
            text
            type="error"
            v-if="isError"
            :dismissible="true"
            @input="hideError"
          >
            <v-row align="center">
              <v-col class="grow">{{ error }}</v-col>
              <v-col class="shrink"
                ><v-btn color="error" @click="tryAgain" v-if="lastAction"
                  >Try again</v-btn
                ></v-col
              >
            </v-row>
          </v-alert>
        </v-row>
      </template>
    </v-data-table>

    <!-- dialog delete confirm -->
    <v-dialog v-model="showConfirmDelete" persistent max-width="290">
      <v-card>
        <v-card-title class="text-h5">
          Do you realy want to delete {{ tableSelected.length }} rows?
        </v-card-title>
        <v-card-text>
          After deleting you won't be able to restore table rows!
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="shoseAction('confirm-delete')">
            Yes
          </v-btn>
          <v-btn color="secondary" @click="showConfirmDelete = false">
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "table-component",
  //   load data
  created() {
    this.shoseAction("get");
  },
  // data
  data() {
    return {
      // all cols
      cols: ["Product", "Calories", "Fat", "Carbs", "Protein", "Iron"],
      //   1-st col
      firstCol: "Product",
      //   list of cols
      listCol: null,
      //   options table
      itemsPerPage: 5,
      page: 1,
      //   selected rows table
      tableSelected: [],
      //   show confirmation delete rows dialog
      showConfirmDelete: false,
      //   loading
      loading: true,
      //   last api action
      lastAction: null,
    };
  },

  methods: {
    ...mapActions(["getTableData", "removeTableRows", "hideError"]),
    // when visible columns changed
    changeListCols(cols) {
      this.listCol = cols;
      // firstCol hided?
      if (!cols.includes(this.firstCol)) this.firstCol = cols[0];
    },

    // chose action with table rows
    shoseAction(action) {
      this.lastAction = action;
      switch (action) {
        case "get":
          {
            this.loading = true;
            this.getTableData().finally(() => {
              this.loading = false;
            });
          }
          break;
        case "delete":
          {
            this.showConfirmDelete = true;
          }
          break;
        case "confirm-delete":
          {
            //   close dialog
            this.showConfirmDelete = false;
            // acc ids to remove
            const deleteIds = this.tableSelected.map((row) => {
              return row.id;
            });
            // remove in vuex
            this.loading = true;
            this.removeTableRows({ id: deleteIds })
              .then(() => {
                this.tableSelected = [];
              })
              .finally(() => {
                this.loading = false;
              });
          }
          break;
      }
    },
    // try last api again
    tryAgain() {
      this.hideError();
      this.shoseAction(this.lastAction);
    },
  },

  computed: {
    ...mapGetters(["tableData", "isError", "error"]),
    // headers table
    headers() {
      return this.allVisibleCols
        .map((col, i) => {
          let colValue = col.toLowerCase();
          let isFirstCol = col == this.firstCol;
          return {
            text: col,
            align: "start",
            sortable: isFirstCol,
            value: colValue,
            order: isFirstCol ? 0 : i + 1,
          };
        })
        .sort((a, b) => a.order - b.order);
    },
    // data table
    items() {
      return this.tableData;
    },
    // items for selector 1-st row
    selectItems() {
      return this.allVisibleCols.map((col) => {
        return {
          text: col,
          value: col,
        };
      });
    },
    // data for select visible cols
    selectVisCols() {
      return this.cols.map((col) => {
        return {
          text: col,
          value: col,
        };
      });
    },
    // visible cols by default
    defVisibleCols() {
      return this.cols;
    },
    // all visible cols
    allVisibleCols() {
      return this.listCol ? this.listCol : this.defVisibleCols;
    },
    // if disabled actions select
    tableActionsDisabled() {
      return !(this.tableSelected.length > 0);
    },
    // actions table
    tableActions() {
      return [{ action: "delete", icon: "mdi-delete" }];
    },
  },
};
</script>

<style lang="scss" scoped></style>
