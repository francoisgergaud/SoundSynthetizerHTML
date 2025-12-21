<script setup lang="ts">
  import { ref, computed, type ComputedRef } from "vue"
  import CarrierOscillatorComponent from "./synth-modules/carrier-oscillator.vue"
  import OperatorOscillatorComponent from "./synth-modules/operator-oscillator.vue"
  import DelayComponent from "./synth-modules/delay.vue"
  import FilterComponent from "./synth-modules/filter.vue"
  import SequencerComponent from "./sequencer/sequencer.vue"
  import AnalyzerComponent from "./synth-modules/analyzer.vue"
  import ADSRComponent from "./synth-modules/adsr.vue"
  import { SynthBaseNode, Delay, Filter } from "./synth-modules/synthNodes"
  import { Graph } from "./graph"
  import { Sequencer, Track } from "./sequencer/sequencer"
  import type { Analyzer } from "./synth-modules/analyzer-node"
  import type { CarrierOscillator } from "./synth-modules/carrier-oscillator-node"
  import type { ADSR } from "./synth-modules/adsr-node"
  import type { OperatorOscillator } from "./synth-modules/operator-oscillator-node"

  const audioContext = new AudioContext()
  const nodeName = ref<string>("")
  const nodeType = ref<string>("vco")
  const source = ref<{node: SynthBaseNode, outputName: string} | null>(null)
  const destination = ref<{node: SynthBaseNode, inputName: string} | null>(null)
  const sequencer = ref<Sequencer>(new Sequencer("sequencer", audioContext))
  const selectedTrack = ref<Track | null>(null)


  function addNode() {
    if(selectedTrack.value) {
      selectedTrack.value.getGraph().addNode(nodeName.value,nodeType.value, {})
    }
  }

  function linkNodes() {
    Graph.linkNodes(source.value!.node, source.value!.outputName, destination.value!.node, destination.value!.inputName)
  }

  function exportSequencer() {
    const content = sequencer.value.export()
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

  function importSequencer(event: Event){
    if ((event.target as HTMLInputElement).files && (event.target as HTMLInputElement).files!.length) {
      const file = (event.target as HTMLInputElement).files?.item(0)
      if (file) {
        let reader = new FileReader();
        reader.onload = function (event) {
          const fileContent = JSON.parse(event.target!.result! as string); //UTF-8 content should be automatically decoded as string by browser (no array-buffer)
          sequencer.value.import(fileContent)
        }
        reader.onerror = function (event) {
          document.getElementById("fileUpload")!.innerHTML = "error reading file";
        }
        reader.readAsText(file, "UTF-8");
      }
    }
  }

  function changeSelectedTrack(trackIndex: number) {
    selectedTrack.value = sequencer.value.getTracks()[trackIndex]!
  }

  const allInputs: ComputedRef<{[inputName:string]: {node: SynthBaseNode, inputName: string} }> = computed( () =>{
    if(selectedTrack.value) {
      return selectedTrack.value.getGraph().getAllInputs()
    } else {
      return {}
    }
  })

  const allOutputs: ComputedRef<{[outputName:string]: {node: SynthBaseNode, outputName: string}}> = computed( () => {
    if(selectedTrack.value) {
      return selectedTrack.value.getGraph().getAllOutputs()
    } else {
      return {}
    }
  })

</script>


<template>
  <header>
    <ul class="nav">
        <li class="navlink">
          <label for="fileUpload" class="custom-file-upload">Import</label>
          <input type="file" id="fileUpload" accept="application/json" @change="(event) => importSequencer(event)"></input>
        </li>
        <li class="navlink">
          <a id="export" @click="(event) => exportSequencer()">Export</a>
        </li>
    </ul>
  </header>

    <div class="sequencerWrapper">
      <label class="header">
          sequencer
      </label>
      <SequencerComponent :node="sequencer" @select-track="(trackIndex: number) => changeSelectedTrack(trackIndex)"/>
    </div>  

  <div class="control-group">
    <select id="nodeType" v-model="nodeType">
      <option value="carrier-oscillator">Carrier Oscillator</option>
      <option value="operator-oscillator">Operator Oscillator</option>
      <option value="delay">Delay</option>
      <option value="filter">Filter</option>
      <option value="analyzer">Analyzer</option>
      <option value="adsr">Envelop</option>
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
  <div id="nodes" v-if="selectedTrack != null">
    <div v-for="(nodeData,nodeName) in selectedTrack.getGraph().nodes" :key="selectedTrack.name + '-' + nodeName">
        <CarrierOscillatorComponent v-if="nodeData.type === 'carrier-oscillator'" :node="nodeData.node as CarrierOscillator" :id="selectedTrack.name + '-' + nodeName"></CarrierOscillatorComponent>
        <OperatorOscillatorComponent v-if="nodeData.type === 'operator-oscillator' " :node="nodeData.node as OperatorOscillator" :id="selectedTrack.name + '-' + nodeName"></OperatorOscillatorComponent>
        <DelayComponent v-if="nodeData.type === 'delay' " :node="nodeData.node as Delay" :id="selectedTrack.name + '-' + nodeName"></DelayComponent>
        <FilterComponent v-if="nodeData.type === 'filter' " :node="nodeData.node as Filter" :id="selectedTrack.name + '-' + nodeName"></FilterComponent>
        <AnalyzerComponent v-if="nodeData.type === 'analyzer' " :node="nodeData.node as Analyzer" :id="selectedTrack.name + '-' + nodeName"></AnalyzerComponent>
        <ADSRComponent v-if="nodeData.type === 'adsr' " :node="nodeData.node as ADSR" :id="selectedTrack.name + '-' + nodeName"></ADSRComponent>
    </div>
  </div>
 
</template>
