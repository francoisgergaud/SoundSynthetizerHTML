

<script setup lang="ts">
  import { ref, computed, type ComputedRef } from "vue"
  import VCOComponent from "./synth-modules/vco.vue"
  import LFOComponent from "./synth-modules/lfo.vue"
  import DelayComponent from "./synth-modules/delay.vue"
  import FilterComponent from "./synth-modules/filter.vue"
  import MusicSequencerComponent from "./synth-modules/musicSequencer.vue"
  import { SynthBaseNode, VCO, LFO, Delay, Filter, MusicSequence } from "./synth-modules/synthNodes"
  import { Graph } from "./graph"

  const audioContext = new AudioContext()
  const nodeName = ref<string>("")
  const nodeType = ref<string>("vco")
  const source = ref<{node: SynthBaseNode, outputName: string} | null>(null)
  const destination = ref<{node: SynthBaseNode, inputName: string} | null>(null)

  let graph = ref<Graph>(new Graph(audioContext))


  function addNode() {
    graph.value.addNode(nodeName.value,nodeType.value )
  }

  function linkNodes() {
    Graph.linkNodes(source.value!.node, source.value!.outputName, destination.value!.node, destination.value!.inputName)
  }

  const allInputs: ComputedRef<{[inputName:string]: {node: SynthBaseNode, inputName: string} }> = computed( () =>{
    return graph.value.getAllInputs();
  })

  const allOutputs: ComputedRef<{[outputName:string]: {node: SynthBaseNode, outputName: string}}> = computed( () => {
    return graph.value.getAllOutputs();
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
    <div v-for="(nodeData,nodeName) in graph.nodes" v-bind:key="nodeName">
        <VCOComponent v-if="nodeData.type === 'vco' " :node="nodeData.node as VCO"></VCOComponent>
        <LFOComponent v-if="nodeData.type === 'lfo' " :node="nodeData.node as LFO"></LFOComponent>
        <DelayComponent v-if="nodeData.type === 'delay' " :node="nodeData.node as Delay"></DelayComponent>
        <FilterComponent v-if="nodeData.type === 'filter' " :node="nodeData.node as Filter"></FilterComponent>
        <MusicSequencerComponent v-if="nodeData.type === 'music' " :node="nodeData.node as MusicSequence"></MusicSequencerComponent>
    </div>
  </div>
 
</template>
