

<script setup lang="ts">
  import { ref, computed, type ComputedRef } from 'vue'
  import VCOComponent from './synth-modules/vco.vue'
  import LFOComponent from './synth-modules/lfo.vue'
  import DelayComponent from './synth-modules/delay.vue'
  import FilterComponent from './synth-modules/filter.vue'
  import {SynthBaseNode, Speaker, VCO, LFO, Delay, Filter} from './synth-modules/synthNodes'

  const audioContext = new AudioContext()
  const nodeName = ref<string>("")
  const nodeType = ref<string>("vco")
  const source = ref<{node: SynthBaseNode, outputName: string} | null>(null)
  const destination = ref<{node: SynthBaseNode, inputName: string} | null>(null)

  let nodes = ref<{[nodeName: string]: {node: SynthBaseNode, type: string}}>({})
  let speaker = new Speaker(audioContext)

  function addNode() {
    switch(nodeType.value) {
      case "vco":
        const vco = new VCO(nodeName.value, audioContext)
        nodes.value[nodeName.value] = {"node": vco, "type" : nodeType.value}
        break
      case "lfo":
        const lfo = new LFO(nodeName.value, audioContext)
        nodes.value[nodeName.value] = {"node": lfo, "type" : nodeType.value}
        break
      case "delay":
        const delay = new Delay(nodeName.value, audioContext)
        nodes.value[nodeName.value] = {"node": delay, "type" : nodeType.value}
        break
      case "filter":
        const filter = new Filter(nodeName.value, audioContext)
        nodes.value[nodeName.value] = {"node": filter, "type" : nodeType.value}
        break
      default:
        console.error(`addNode: unknown node-type ${nodeType.value}`)
    }
  }

  function linkNodes() {
    const sourceOutput = source.value!.node.getOutputs()[source.value!.outputName]!
    const destinationInput = destination.value!.node.getInputs()[destination.value!.inputName]!
    if(destinationInput instanceof AudioNode){
      sourceOutput.node.connect(destinationInput, sourceOutput.index);
    } else{
       sourceOutput.node.connect(destinationInput, sourceOutput.index);
    } 
  }

  const allInputs: ComputedRef<{[inputName:string]: {node: SynthBaseNode, inputName: string} }> = computed( () =>{
    const result: {[inputName:string]: {node: SynthBaseNode, inputName: string} } = {}
    for(const nodeName in nodes.value) {
      const synthNode = nodes.value[nodeName]!.node
      const nodeInputs = synthNode.getInputs()
      for(const inputName in nodeInputs){
        let key = `${nodeName}/${inputName}`
        result[key] = {
          node: synthNode,
          inputName: inputName
        }
      }
    }
    //automatically add the speaker node
    for(const inputName in speaker.getInputs()){
      result["speakers"] = {
        node: speaker,
        inputName: inputName
      }
    }
    return result;
  })

  const allOutputs: ComputedRef<{[outputName:string]: {node: SynthBaseNode, outputName: string}}> = computed( () => {
    const result: {[outputName:string]: {node: SynthBaseNode, outputName: string} } = {}
    for(const nodeName in nodes.value) {
      const synthNode = nodes.value[nodeName]!.node
      const nodeOutputs = synthNode.getOutputs()
      for(const outputName in nodeOutputs){
        let key = `${nodeName}/${outputName}`
        result[key] = {
          node: synthNode,
          outputName: outputName
        }
      }
    }
    return result;
  })

</script>

<template>
  <div class="control-group">
    <select id="nodeType" v-model="nodeType">
      <option value="vco">Sound Oscillator</option>
      <option value="lfo">Low Freq. Oscillator</option>
      <option value="delay">Delay</option>
      <option value="filter">Filter</option>
      <option value="music">Music Sequence</option>
    </select>
       
    &nbsp;
    <input type="text" id="nodeName" placeholder="name" v-model="nodeName"/>
        
    &nbsp;
    <button id="addNode" @click="(event) => addNode()">Add</button>
  </div>

  <div id="nodeConnector" class="control-group">
    <label for="source">
        from
    </label>
    &nbsp;
    <select id="source" v-model="source">
      <option v-for="(output, outputName) in allOutputs" :value="output">
        {{ outputName }}
      </option>
    </select>
    &nbsp;
    <label for="destination">
        to
    </label>
    &nbsp;
    <select id="destination" v-model="destination">
      <option v-for="(input, inputName) in allInputs" :value="input">
        {{ inputName }}
      </option>
    </select>
    &nbsp;
    <button id="addLink" @click="(event) => linkNodes()">Connect nodes</button>
  </div>

  <div id="nodes">
    <div v-for="(nodeData,nodeName) in nodes" v-bind:key="nodeName">
        <VCOComponent v-if="nodeData.type === 'vco' " :node="nodeData.node as VCO"></VCOComponent>
        <LFOComponent v-if="nodeData.type === 'lfo' " :node="nodeData.node as LFO"></LFOComponent>
        <DelayComponent v-if="nodeData.type === 'delay' " :node="nodeData.node as Delay"></DelayComponent>
        <FilterComponent v-if="nodeData.type === 'filter' " :node="nodeData.node as Filter"></FilterComponent>
    </div>
  </div>
 
</template>
