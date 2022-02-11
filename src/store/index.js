import Vue from 'vue'
import Vuex from 'vuex'
import {apiCall} from "@/api.js";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tableData: [],
    error: null
  },
  mutations: {
    SET_TABLE_DATA(state, {data}) {
      state.tableData = data
    },
    REMOVE_TABLE_ROWS(state, {id}) {
      state.tableData = state.tableData.filter(row=>{
        return !id.includes(row.id)
      })
    },
    HIDE_ERROR(state){
      state.error = null
    },
    SET_ERROR(state,{error}){
      state.error = error
    }
  },
  actions: {
    getTableData({dispatch}) {
      return new Promise((resolve,reject)=>{
        // load data from API
        apiCall('get')
        .then(response=>{
          dispatch('setTableData',{data:response.data})
          resolve(response.data)
        })
        .catch(e=>{
          dispatch('setError',{error:e.error})
          reject(e)
        })
      })
    },
    
    setTableData({commit},{data}) {
      commit('SET_TABLE_DATA', {data})
    },
    
    removeTableRows({commit,dispatch},{id}) {
      return new Promise((resolve,reject)=>{
        // load data from API
        apiCall('delete',id)
        .then(()=>{
          resolve(true)
          // if ok - remove from cache
          commit('REMOVE_TABLE_ROWS',{id})
        })
        .catch(e=>{
          dispatch('setError',{error:e.error})
          reject(e)
        })
      })

    },

    hideError({commit}) {
      commit('HIDE_ERROR')
    },

    setError({commit},{error}) {
      commit("SET_ERROR",{error})
    }

  },
  getters: {
    tableData(state) {
      return state.tableData
    },
    isError(state) {
      return !!state.error
    },
    error(state) {
      return state.error
    }
  }
})
