import { Delay, Filter, LFO, MusicSequence, Speaker, VCO, type SynthBaseNode } from "./synth-modules/synthNodes"

export class Graph {

    nodes: { [nodeName:string]: {node: SynthBaseNode, type: string }}
    audioContext: AudioContext
    speaker: Speaker
    
    constructor(audioContext: AudioContext){
        this.nodes = {}
        this.audioContext = audioContext
        this.speaker = new Speaker(audioContext)
    }

    addNode(nodeName: string, nodeType: string) {
        switch(nodeType) {
        case "vco":
            const vco = new VCO(nodeName, this.audioContext)
            this.nodes[nodeName] = {"node": vco, "type" : nodeType}
            break
        case "lfo":
            const lfo = new LFO(nodeName, this.audioContext)
            this.nodes[nodeName] = {"node": lfo, "type" : nodeType}
            break
        case "delay":
            const delay = new Delay(nodeName, this.audioContext)
            this.nodes[nodeName] = {"node": delay, "type" : nodeType}
            break
        case "filter":
            const filter = new Filter(nodeName, this.audioContext)
            this.nodes[nodeName] = {"node": filter, "type" : nodeType}
            break
        case "music":
            const musicSequence = new MusicSequence(nodeName, this.audioContext)
            this.nodes[nodeName] = {"node": musicSequence, "type" : nodeType}
            break
        default:
            console.error(`addNode: unknown node-type ${nodeType}`)
        }
    }

    getAllInputs(){
        const result: {[inputName:string]: {node: SynthBaseNode, inputName: string} } = {}
        for(const nodeName in this.nodes) {
        const synthNode = this.nodes[nodeName]!.node
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
        for(const inputName in this.speaker.getInputs()){
        result["speakers"] = {
            node: this.speaker,
            inputName: inputName
        }
        }
        return result;
    }

    getAllOutputs(){
        const result: {[outputName:string]: {node: SynthBaseNode, outputName: string} } = {}
        for(const nodeName in this.nodes) {
        const synthNode = this.nodes[nodeName]!.node
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
    }

    static linkNodes(sourceNode: SynthBaseNode, sourceOutputName: string, destinationNode: SynthBaseNode, destinationInputName: string){
        const sourceOutput = sourceNode.getOutputs()[sourceOutputName]!
        const destinationInput = destinationNode.getInputs()[destinationInputName]!
        // below 'if' does not make sense, it is only for Typescript...
        if(destinationInput instanceof AudioNode){
            sourceOutput.node.connect(destinationInput, sourceOutput.index);
        } else{
            sourceOutput.node.connect(destinationInput, sourceOutput.index);
        }
        //add link information on each node
        sourceNode.linkOutput(destinationNode, destinationInputName, sourceOutputName)
        destinationNode.linkInput(sourceNode, sourceOutputName, destinationInputName)
    }

    static unlinkNode(sourceNode: SynthBaseNode, sourceOutputName: string, destinationNode: SynthBaseNode, destinationInputName: string){
        const sourceOutput = sourceNode.getOutputs()[sourceOutputName]!
        const destinationInput = destinationNode.getInputs()[destinationInputName]!
        // below 'if' does not make sense, it is only for Typescript...
        if(destinationInput instanceof AudioNode){
            sourceOutput.node.disconnect(destinationInput, sourceOutput.index);
        } else{
            sourceOutput.node.disconnect(destinationInput, sourceOutput.index);
        }
        //remove link information on each node
        sourceNode.unlinkOutput(destinationNode, destinationInputName, sourceOutputName)
        destinationNode.unlinkInput(sourceNode, sourceOutputName, destinationInputName)
    }
}