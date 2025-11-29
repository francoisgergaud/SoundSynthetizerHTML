

<script setup lang="ts">
  import { ref, computed, type ComputedRef } from "vue"
  import VCOComponent from "./synth-modules/vco.vue"
  import LFOComponent from "./synth-modules/lfo.vue"
  import DelayComponent from "./synth-modules/delay.vue"
  import FilterComponent from "./synth-modules/filter.vue"
  import SequencerComponent from "./synth-modules/sequencer.vue"
  import AnalyzerComponent from "./synth-modules/analyzer.vue"
  import { SynthBaseNode, VCO, LFO, Delay, Filter, MusicSequence } from "./synth-modules/synthNodes"
  import { Graph } from "./graph"
  import type { Sequencer } from "./synth-modules/sequencer-node"
  import type { Analyzer } from "./synth-modules/analyzer-node"

  const audioContext = new AudioContext()
  const nodeName = ref<string>("")
  const loadedFile = ref<string>("")
  const nodeType = ref<string>("vco")
  const source = ref<{node: SynthBaseNode, outputName: string} | null>(null)
  const destination = ref<{node: SynthBaseNode, inputName: string} | null>(null)

  let graph = ref<Graph>(new Graph(audioContext))


  function addNode() {
    graph.value.addNode(nodeName.value,nodeType.value, {})
  }

  function linkNodes() {
    Graph.linkNodes(source.value!.node, source.value!.outputName, destination.value!.node, destination.value!.inputName)
  }

  function exportGraph() {
    const content = graph.value.export()
    const fileName = "synthModules.json"
    const jsonContent = JSON.stringify(content)
    const blob = new Blob([jsonContent], {type: 'application/json'});
    if((window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveBlob(blob, fileName);
    }
    else{
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = fileName;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
  }

  function importGraph(event: Event){
    if ((event.target as HTMLInputElement).files && (event.target as HTMLInputElement).files!.length) {
      const file = (event.target as HTMLInputElement).files?.item(0)
      if (file) {
        let reader = new FileReader();
        reader.onload = function (event) {
          const fileContent = JSON.parse(event.target!.result! as string); //UTF-8 content should be automatically decoded as string by browser (no array-buffer)
          graph.value.import(fileContent)
        }
        reader.onerror = function (event) {
          document.getElementById("fileUpload")!.innerHTML = "error reading file";
        }
        reader.readAsText(file, "UTF-8");
      }
    }

  }

  const allInputs: ComputedRef<{[inputName:string]: {node: SynthBaseNode, inputName: string} }> = computed( () =>{
    return graph.value.getAllInputs();
  })

  const allOutputs: ComputedRef<{[outputName:string]: {node: SynthBaseNode, outputName: string}}> = computed( () => {
    return graph.value.getAllOutputs();
  })

</script>


<template>
  <header>
    <ul class="nav">
        <li class="navlink">
          <label for="fileUpload" class="custom-file-upload">Import</label>
          <input type="file" id="fileUpload" accept="application/json" @change="(event) => importGraph(event)"></input>
        </li>
        <li class="navlink">
          <a id="exportGraph" @click="(event) => exportGraph()">Export</a>
        </li>
    </ul>
  </header>
  <div class="control-group">
    <select id="nodeType" v-model="nodeType">
      <option value="vco">Sound Oscillator</option>
      <option value="lfo">Low Freq. Oscillator</option>
      <option value="delay">Delay</option>
      <option value="filter">Filter</option>
      <option value="sequencer">Sequencer</option>
      <option value="analyzer">Analyzer</option>
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
        <SequencerComponent v-if="nodeData.type === 'sequencer' " :node="nodeData.node as Sequencer"></SequencerComponent>
        <AnalyzerComponent v-if="nodeData.type === 'analyzer' " :node="nodeData.node as Analyzer"></AnalyzerComponent>
    </div>
  </div>
 
</template>
