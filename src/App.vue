<script setup lang="ts">
  import { ref, computed, type ComputedRef } from "vue"
  import SequencerComponent from "./sequencer/sequencer.vue"
  import { SynthBaseNode } from "./synth-modules/synthNodes"
  import { Graph } from "./graph"
  import { Sequencer, Track } from "./sequencer/sequencer"
  import { exportRackStore, importRackStore } from './synth-modules/rack-store.js'
  import Racks from "./synth-modules/racks.vue"

  const audioContext = new AudioContext()

  const source = ref<{node: SynthBaseNode, outputName: string} | null>(null)
  const destination = ref<{node: SynthBaseNode, inputName: string} | null>(null)
  const graph = ref<Graph>(new Graph(audioContext))
  // add only one sequencer node with the "sequencer" name. Sequencer node is not available for adding in the racks, 
  // it is always present in the graph and can be used to control other nodes.
  const sequencerNode = graph.value.addNode("sequencer", "sequencer", null)
  const sequencer = ref<Sequencer>(sequencerNode as Sequencer)

  function linkNodes() {
    Graph.linkNodes(source.value!.node, source.value!.outputName, destination.value!.node, destination.value!.inputName)
  }

  function exportApp() {
    const dataToExport = {
      "nodes" : graph.value.export(),
      "uiData" : exportRackStore()
    }
    const fileName = "synthModules.json"
    const jsonContent = JSON.stringify(dataToExport)
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

  function importApp(event: Event){
    if ((event.target as HTMLInputElement).files && (event.target as HTMLInputElement).files!.length) {
      const file = (event.target as HTMLInputElement).files?.item(0)
      if (file) {
        let reader = new FileReader();
        reader.onload = function (event) {
          const fileContent = JSON.parse(event.target!.result! as string); //UTF-8 content should be automatically decoded as string by browser (no array-buffer)
          //console.debug(`load content ${fileContent}`)
          graph.value.import(fileContent["nodes"])
          // a bit of a hack to get the sequencer node from the graph and set it in the sequencer ref. This is needed because the sequencer node is not added to the graph through the racks, but directly in the graph.
          sequencer.value = graph.value.nodes["sequencer"]!.node as Sequencer
          importRackStore(fileContent["uiData"], graph.value)
        }
        reader.onerror = function (event) {
          document.getElementById("fileUpload")!.innerHTML = "error reading file";
        }
        reader.readAsText(file, "UTF-8");
      }
    }
  }

  function addTrack(track: Track) {
    // adding a track into a sequencer is not caught by any proxy, so we update the graph' s sequencer with the
    // same sequencer to the proxy around graph is triggered and the list of outputs is updated. This is a bit stupid, 
    // but I don't know how to do it better.
    graph.value.nodes["sequencer"]!.node = sequencer.value
  }

  const allInputs: ComputedRef<{[inputName:string]: {node: SynthBaseNode, inputName: string} }> = computed( () =>{
    return graph.value.getAllInputs()
  })

  const allOutputs: ComputedRef<{[outputName:string]: {node: SynthBaseNode, outputName: string}}> = computed( () => {
    return graph.value.getAllOutputs()
  })

</script>


<template>
  <header>
    <ul class="nav">
        <li class="navlink">
          <label for="fileUpload" class="custom-file-upload">Import</label>
          <input type="file" id="fileUpload" accept="application/json" @change="(event) => importApp(event)"></input>
        </li>
        <li class="navlink">
          <a id="export" @click="(event) => exportApp()">Export</a>
        </li>
    </ul>
  </header>

  <div class="sequencerWrapper">
    <label class="header">
        sequencer
    </label>
    <SequencerComponent :sequencer="sequencer" @create-track="(track: Track) => addTrack(track)"/>
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

  <Racks :graph="graph"></Racks>
 
</template>
