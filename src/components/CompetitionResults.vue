<template>
  <div v-if="results">
    <b-row>
      <b-col>
        <h3>{{ $tc("result.result", 2) }}</h3>
      </b-col>
      <b-col v-if="editPermission">
        <b-button
          v-if="$store.state.editMode"
          :to="{
            name: 'result-import',
            params: { competition_id: $route.params.competition_id }
          }"
          variant="light"
          class="btn-orange float-right"
          >{{ $tc("result.import", 2) }}
        </b-button>
        <b-button
          v-if="$store.state.editMode && $store.state.user.is_staff"
          variant="outline-success"
          v-on:click="approveAll()"
          class="space-right float-right"
        >
          {{ $t("result.approve_all") }}
        </b-button>
        <b-button
          variant="outline-info"
          v-on:click="getMediaResults()"
          class="space-right float-right"
        >
          {{ $t("result.media_results") }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-alert v-if="errors.main" variant="danger" show>
          <ul>
            <li v-for="e in errors.main" v-bind:key="e">{{ e }}</li>
          </ul>
        </b-alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <div v-show="loading">
          <b-spinner label="Loading..."></b-spinner>
        </div>
        <div v-for="category in results" :key="category.id">
          <h4 class="bg-sal-orange">
            {{ category[0].category | splitFilter("(") }}
          </h4>
          <div v-for="(block, index) in resultBlocks" :key="index">
            <h5 v-if="category[0].max_rounds >= 1">
              <div v-if="block['label'] === 'final'">
                {{ $tc("result.final", 2) }}
              </div>
              <div v-else-if="block['label'] === 'preliminary'">
                {{ $t("result.preliminary") }}
              </div>
              <div v-else>{{ block["label"] }}</div>
            </h5>
            <b-table
              :items="limitResults(category, block['col'])"
              :fields="resultFields[index + 1]"
              sort-by="position"
              sort-null-last
              responsive="sm"
              @row-clicked="linkTo"
              @row-middle-clicked="linkToNewTab"
              hover
              small
              v-if="
                block['name'] === 'nolimit' ||
                  getMaxRounds(category, block['name']) >= 1
              "
            >
              <template
                v-for="field in resultColsExtra[index + 1][1]"
                v-slot:[field.slot]="data"
              >
                <div
                  v-for="row in resultColsExtra[index + 1][0][field.col]"
                  v-bind:key="row"
                >
                  {{
                    data.item.partial
                      | partialValue(getPartialField(index + 1, row, field.col))
                  }}
                </div>
              </template>
              <template v-slot:cell(athlete)="data">
                <div v-if="data.item.athlete">
                  {{ data.item.athlete.first_name }}
                  {{ data.item.athlete.last_name }}
                </div>
                <div v-else>
                  {{ $t("team") }}: {{ data.item.last_name }}
                  <ul>
                    <li
                      v-for="member in data.item.team_members"
                      :key="member.id"
                    >
                      <router-link
                        tag="a"
                        :to="{
                          name: 'athlete',
                          params: { athlete_id: member.id }
                        }"
                      >
                        {{ member.first_name }} {{ member.last_name }}
                      </router-link>
                    </li>
                  </ul>
                </div>
              </template>
              <template v-slot:cell(result)="data">
                <div v-if="data.item.result_code && !data.item.result">
                  {{ data.item.result_code }}
                </div>
                <div v-else-if="data.item.result_code && data.item.result">
                  {{ data.item.result_code }}
                  ({{ data.item.result | roundValue(data.item.decimals) }})
                </div>
                <div v-else>
                  {{ data.item.result | roundValue(data.item.decimals) }}
                </div>
              </template>
              <template v-slot:cell(pos)="data">
                <div>{{ $t("result.kneeling") }}</div>
                <div>{{ $t("result.prone") }}</div>
                <div>{{ $t("result.standing") }}</div>
              </template>
              <template v-slot:cell(empty)="data"> </template>
              <template v-slot:cell(wtype)="data">
                {{
                  data.item.category | splitFilter("(", 1) | splitFilter(")")
                }}
              </template>
              <template v-slot:cell(info)="data">
                {{ data.item.info }}
                {{ data.item.record | parseRecords(true) }}
                <div v-if="!data.item.approved">
                  ({{ $t("result.unconfirmed") }})
                </div>
              </template>
              <template v-slot:cell(detail)="data">
                <b-button
                  size="sm"
                  v-b-modal="data.item.id.toString()"
                  variant="outline-info"
                >
                  {{ $t("result.details") }} </b-button
                >&nbsp;
                <b-button
                  v-if="editPermission && $store.state.editMode"
                  size="sm"
                  variant="outline-success"
                  :to="{
                    name: 'result-update',
                    params: {
                      result_id: data.item.id
                    }
                  }"
                >
                  {{ $t("edit") }} </b-button
                >&nbsp;
                <b-button
                  v-if="
                    $store.state.editMode &&
                      $store.state.user.is_staff &&
                      !data.item.approved
                  "
                  size="sm"
                  variant="outline-success"
                  v-on:click="toggleApproval(data)"
                >
                  {{ $t("result.approve") }}
                </b-button>
                <b-button
                  v-if="
                    $store.state.editMode &&
                      $store.state.user.is_staff &&
                      data.item.approved
                  "
                  size="sm"
                  variant="outline-danger"
                  v-on:click="toggleApproval(data)"
                >
                  {{ $t("result.cancel_approval") }}
                </b-button>
              </template>
            </b-table>
          </div>
          <div v-for="result in category" :key="result.id">
            <CompetitionResultsDetail
              :customFields="customFields"
              :maxBlock="maxBlock"
              :result="result"
              :resultBlocks="resultBlocks"
            />
          </div>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
/**
 * Displays results list for a single competition
 */
import { HTTP } from "../api/BaseApi.js";
import groupArrayByKey from "../utils/GroupArrayByKey";
import parseRecords from "../utils/ParseRecordsFilter";
import partialValue from "../utils/PartialValueFilter";
import roundValue from "../utils/RoundValueFilter";
import getCookie from "../utils/GetCookie";
import splitFilter from "../utils/SplitFilter";
import errorParser from "../utils/ErrorParser";
import CompetitionResultsDetail from "@/components/CompetitionResultsDetail.vue";

export default {
  name: "CompetitionResults",
  components: {
    CompetitionResultsDetail
  },
  filters: {
    parseRecords,
    partialValue,
    roundValue,
    splitFilter
  },
  props: {
    competition: {},
    editPermission: Boolean
  },
  data() {
    return {
      config: {
        headers: {
          "X-CSRFToken": getCookie("csrftoken")
        }
      },
      customFields: [],
      errors: {},
      loading: true,
      maxBlock: 2,
      results: [],
      selectMode: "single"
    };
  },
  computed: {
    /**
     * Sets result blocks information based on layout
     * i.e. preliminary competition, finals etc.
     *
     * @returns {array} blocks
     */
    resultBlocks: function() {
      return this.customFields.filter(f => f.block === 0);
    },
    /**
     * Sets table fields for each result block, based on result columns
     *
     * @returns {[]|*[]} - array of table field arrays for each block
     */
    resultFields: function() {
      let fields = [];
      for (let block = 1; block <= this.maxBlock; block++) {
        fields[block] = [];
        if (
          this.resultCols.length >= block &&
          this.resultCols[block].length > 0
        ) {
          for (const order in this.resultCols[block]) {
            let field = {};
            field.key = this.resultCols[block][order].name;
            switch (this.resultCols[block][order].name) {
              case "athlete":
                field.label = this.$tc("athlete.athlete", 1);
                break;
              case "organization":
                field.label = this.$tc("athlete.club", 1);
                break;
              case "result":
                field.label = this.$tc("result.result", 1);
                break;
              case "pos":
                field.label = this.$tc("result.position", 1);
                break;
              case "info":
                field.label = this.$tc("result.info", 1);
                break;
              case "detail":
                field.label = this.$tc("result.details", 1);
                break;
              default:
                field.label = this.resultCols[block][order].label;
            }
            if (
              "hide" in this.resultCols[block][order] &&
              this.resultCols[block][order]["hide"]
            ) {
              field["thClass"] =
                "d-none d-" +
                this.resultCols[block][order]["hide"] +
                "-table-cell";
              field["tdClass"] =
                "d-none d-" +
                this.resultCols[block][order]["hide"] +
                "-table-cell";
            }
            field["sortable"] = true;
            fields[block].push(field);
          }
        }
      }
      return fields;
    },
    resultCols: function() {
      /**
       * Filters result columns from layout
       *
       * @returns {[]|*[]} - array of column arrays for each block
       */
      if (!this.customFields || this.customFields.length === 0) {
        return [];
      }
      let filtered = [];
      for (let i = 1; i <= this.maxBlock; i++) {
        filtered[i] = this.customFields.filter(
          f => f.block === i && f.row === 1
        );
      }
      return filtered;
    },
    /**
     * Filters extra fields, ones including '-' symbol, from layout
     * - Adds slot information for each field
     *
     * @returns {[]|*[]} - array of extra column arrays for each block
     */
    resultColsExtra: function() {
      if (!this.customFields || this.customFields.length === 0) {
        return [];
      }
      let filtered = [];
      for (let i = 1; i <= this.maxBlock; i++) {
        filtered[i] = [];
        filtered[i][0] = {};
        for (let r = 1; r <= 4; r++) {
          filtered[i][r] = this.customFields.filter(
            f => f.block === i && f.row === r && f.name && f.name.includes("-")
          );
          filtered[i][r].forEach(
            item => (item.slot = "cell(" + item.name.toString() + ")")
          );
          filtered[i][r].forEach(item => (filtered[i][0][item.col] = r));
        }
      }
      return filtered;
    }
  },
  watch: {
    /**
     * Fetch layout information when competition information exists
     */
    competition: {
      handler: function() {
        if (this.competition && this.competition.type) {
          this.getCompetitionTypeLayout(this.competition);
        }
      }
    }
  },
  mounted() {
    this.getResults(this.$route.params.competition_id);
    if (this.competition && this.competition.type) {
      this.getCompetitionTypeLayout(this.competition);
    }
  },
  methods: {
    /**
     * Approves all unapproved results
     */
    approveAll: function() {
      this.$set(this.errors, "main", null);
      for (const category in this.results) {
        for (const result in this.results[category]) {
          if (
            !this.results[category][result].approved &&
            !this.results[category][result].athlete.organization_info.external
          ) {
            this.approveResult(category, result);
          }
        }
      }
    },
    /**
     * Sets result as approved (API patch)
     *
     * @param {string} category code
     * @param {number} result id
     * @returns {Promise<void>}
     */
    approveResult: async function(category, result) {
      await HTTP.patch(
        "results/" + this.results[category][result].id + "/",
        { approved: true },
        this.config
      )
        .then(response => {
          this.results[category][result].approved = response.data.approved;
        })
        .catch(error => {
          this.$set(this.errors, "main", errorParser.generic.bind(this)(error));
        });
    },
    /**
     * Fetch layout information for a competition
     *
     * Set default layout if not found
     *
     * @param {object} competition
     * @returns {Promise<void>}
     */
    async getCompetitionTypeLayout(competition) {
      HTTP.get("competitionlayouts/?type=" + competition.layout)
        .then(response => {
          if (response.data.results.length > 0) {
            this.customFields = response.data.results;
          } else {
            this.customFields = [
              {
                label: "",
                name: "nolimit",
                block: 0,
                row: 0,
                col: 0,
                hide: "",
                show: ""
              },
              {
                label: "#",
                name: "position",
                block: 1,
                row: 1,
                col: 1,
                hide: "",
                show: ""
              },
              {
                label: "Athlete",
                name: "athlete",
                block: 1,
                row: 1,
                col: 2,
                hide: "",
                show: ""
              },
              {
                label: "Club",
                name: "athlete",
                block: 1,
                row: 1,
                col: 3,
                hide: "",
                show: ""
              },
              {
                label: "Result",
                name: "result",
                block: 1,
                row: 1,
                col: 4,
                hide: "",
                show: ""
              }
            ];
          }
          this.maxBlock = this.customFields[this.customFields.length - 1].block;
        })
        .catch(error => {
          this.$set(this.errors, "main", errorParser.generic.bind(this)(error));
        });
    },
    /**
     * Get number of results including a single partial result type
     *
     * @param {array} results
     * @param {string} partial_type
     * @returns {number}
     */
    getMaxRounds(results, partial_type) {
      let order = 0;
      results.forEach(item => {
        if (item.partial) {
          if (
            item.partial.filter(f => f.type.abbreviation.includes(partial_type))
              .length > 0
          ) {
            order += 1;
          }
        }
      });
      return order;
    },
    /**
     * Creates CSV string containing results in media format and uploads it to user
     */
    getMediaResults() {
      let content = "data:text/csv;charset=utf-8,";
      for (const category in this.results) {
        content +=
          this.competition.type_info.name +
          ", " +
          this.$t("result.category") +
          " " +
          category +
          ": ";
        let first = true;
        for (const result in this.results[category]) {
          const r = this.results[category][result];
          if (!first) {
            content += ", ";
          } else {
            first = false;
          }
          content += r.position + ") ";
          if (r.team) {
            content += r.last_name;
          } else {
            content += r.first_name + " " + r.last_name + " " + r.organization;
          }
          if (r.result_code) {
            content += " " + r.result_code;
          } else {
            content += " " + roundValue(r.result, r.decimals);
          }
          if ("record" in r && r.record.length > 0) {
            content += " " + parseRecords(r.record, true, true);
          }
        }
        content += "\r\n";
      }
      var encodedContent = encodeURI(content);
      window.open(encodedContent);
    },
    /**
     * Get a field name for a partial value field
     *
     * @param {number} block
     * @param {number} row
     * @param {number} col
     * @returns {null|string}
     */
    getPartialField(block, row, col) {
      const partialField = this.resultColsExtra[block][row].find(
        f => f.col === col
      );
      if (partialField) {
        return partialField.name;
      }
      return null;
    },
    /**
     * Fetch results for a single competition
     * - Groups results by category
     *
     * @param {number} id
     * @returns {Promise<void>}
     */
    async getResults(id) {
      this.results = [];
      this.loading = true;
      HTTP.get(
        "resultlist/?fields!=competition&ordering=team,category,position&external=1&competition=" +
          id
      )
        .then(response => {
          this.results = groupArrayByKey(response.data, "category", "fin");
        })
        .catch(error => {
          this.$set(this.errors, "main", errorParser.generic.bind(this)(error));
        })
        .finally(() => (this.loading = false));
    },
    /**
     * Get x first results from a list
     *
     * @param {array} results
     * @param {number} limit
     * @returns {array} sliced results list
     */
    limitResults(results, limit) {
      if (limit > 0) {
        return results.slice(0, limit);
      }
      return results;
    },
    /**
     * Routes to athlete information when row is clicked
     *
     * @param {object} item - athlete object
     */
    linkTo(item) {
      if (item.athlete) {
        this.$router.push({
          name: "athlete",
          params: { athlete_id: item.athlete.id }
        });
      }
    },
    /**
     * Opens athlete information in new window when row is clicked
     *
     * @param {object} item - athlete object
     */
    linkToNewTab(item) {
      if (item.athlete) {
        let routeData = this.$router.resolve({
          name: "athlete",
          params: { athlete_id: item.athlete.id }
        });
        window.open(routeData.href, "_blank");
      }
    },
    /**
     * Toggle approval status for a single result (API patch)
     *
     * @param {object} data - result object
     * @returns {Promise<void>}
     */
    toggleApproval: async function(data) {
      this.$set(this.errors, "main", null);
      await HTTP.patch(
        "results/" + data.item.id + "/",
        { approved: !data.item.approved },
        this.config
      )
        .then(response => {
          data.item.approved = response.data.approved;
        })
        .catch(error => {
          this.$set(this.errors, "main", errorParser.generic.bind(this)(error));
        });
    }
  }
};
</script>

<style scoped></style>
