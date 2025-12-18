import { Analyzer } from "./synth-modules/analyzer-node"
import { CarrierOscillator } from "./synth-modules/carrier-oscillator-node"
import { Sequencer } from "./synth-modules/sequencer-node"
import { ADSR } from "./synth-modules/adsr-node"
import { type AudibleFrequencyBaseNode, Delay, Filter, Speaker, type SynthBaseNode, type TriggerBaseNode, isAudibleFrequencyNode, isTriggetBaseNode } from "./synth-modules/synthNodes"
import { OperatorOscillator } from "./synth-modules/operator-oscillator-node"

export class Graph {

    nodes: { [nodeName:string]: {node: SynthBaseNode, type: string }}
    triggerableNodes: { [nodeName:string]: {node: SynthBaseNode & TriggerBaseNode, type: string }}
    carrierOscillators: { [nodeName:string]: {node: SynthBaseNode & AudibleFrequencyBaseNode }}
    audioContext: AudioContext
    speaker: Speaker
    
    constructor(audioContext: AudioContext){
        this.nodes = {}
        this.triggerableNodes = {}
        this.carrierOscillators = {}
        this.audioContext = audioContext
        this.speaker = new Speaker(audioContext)
    }

    addNode(nodeName: string, nodeType: string, nodeConfiguration: {[parameterName: string]: string | number | boolean | null} | null) {
        nodeConfiguration = nodeConfiguration ?? {}
        switch(nodeType) {
        case "carrier-oscillator":
            const vco = new CarrierOscillator(nodeName, this.audioContext, nodeConfiguration)
            this.nodes[nodeName] = {"node": vco, "type" : nodeType}
            break
        case "operator-oscillator":
            const modulator = new OperatorOscillator(nodeName, this.audioContext, nodeConfiguration)
            this.nodes[nodeName] = {"node": modulator, "type" : nodeType}
            break
        case "delay":
            const delay = new Delay(nodeName, this.audioContext, nodeConfiguration)
            this.nodes[nodeName] = {"node": delay, "type" : nodeType}
            break
        case "filter":
            const filter = new Filter(nodeName, this.audioContext, nodeConfiguration)
            this.nodes[nodeName] = {"node": filter, "type" : nodeType}
            break
        case "sequencer":
            const sequencer = new Sequencer(nodeName, this.audioContext, nodeConfiguration)
            this.nodes[nodeName] = {"node": sequencer, "type" : nodeType}
            break
        case "analyzer":
            const analyzer = new Analyzer(nodeName, this.audioContext, nodeConfiguration)
            this.nodes[nodeName] = {"node": analyzer, "type" : nodeType}
            break
        case "adsr":
            const adsr = new ADSR(nodeName, this.audioContext, nodeConfiguration)
            this.nodes[nodeName] = {"node": adsr, "type" : "adsr"}
            break
        default:
            console.error(`addNode: unknown node-type ${nodeType}`)
        }
        //add the node to be triggered on event
        if(this.nodes[nodeName] && isTriggetBaseNode(this.nodes[nodeName]["node"])) {
            this.triggerableNodes[nodeName] = this.nodes[nodeName]
        }
        if(this.nodes[nodeName] && isAudibleFrequencyNode(this.nodes[nodeName]["node"])) {
            this.carrierOscillators[nodeName] = this.nodes[nodeName]
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

    export(): {[nodeName:string]: any} {
        const result: {[nodeName:string]:any} = {}
        for(const nodeName in this.nodes) {
            const synthNode = this.nodes[nodeName]!.node
            const synthNodeType = this.nodes[nodeName]!.type
            result[nodeName] = synthNode.export()
            //add the node-type: it is a property of the node reauired only in the context of a graph.
            result[nodeName]["nodeType"] = synthNodeType
        }
        //manually add the speaker as it is a default node in the graph (it is not in the nodes-list).
        // it is exported only to hqve its inputs to import it later
        result["speaker"] = this.speaker.export()
        result["speaker"]["nodeType"] = "speaker"
        return result
    }

    import(configuration: {[nodeMame: string]: {linkedInputs: {inputName:string, sourceNodeName:string, sourceOutputName:string}[], nodeType: string, nodeData: {[propertyName:string]: string|number|boolean} } }) {
        //reset the nodes
        this.nodes = {}
        //add the nodes from config
        const inputLinksConfiguration:{nodeName:string, inputName:string, sourceNodeName:string, sourceOutputName:string}[] = []
        for(const nodeName in configuration){
            const nodeConfiguration = configuration[nodeName]!
            const nodeType = nodeConfiguration["nodeType"]
            // ignore the speaker: we only use its input to link it after all nodes are created
            if(nodeType != "speaker"){
                this.addNode(nodeName, nodeType, nodeConfiguration["nodeData"])
            }
            for(const linkedInput of nodeConfiguration.linkedInputs){
                inputLinksConfiguration.push(
                    {
                        "nodeName": nodeName,
                        "inputName": linkedInput["inputName"],
                        "sourceNodeName": linkedInput["sourceNodeName"],
                        "sourceOutputName": linkedInput["sourceOutputName"],
                    }
                )
            }
        }

        //link the nodes
        for(const inputLinkConfiguration of inputLinksConfiguration){
            const sourceNode = this.nodes[inputLinkConfiguration["sourceNodeName"]]!.node
            const sourceOutputName = inputLinkConfiguration["sourceOutputName"]
            const destinationNodeName = inputLinkConfiguration["nodeName"]
            //exception if made for 'Speaker' node. This is a default node and does not appear int he graph's nodes
            let destinationNode: SynthBaseNode = this.speaker
            if(destinationNodeName != "speaker") {
                destinationNode = this.nodes[inputLinkConfiguration["nodeName"]]!.node
            }
            const destinationInputName = inputLinkConfiguration["inputName"]
            Graph.linkNodes(sourceNode, sourceOutputName, destinationNode, destinationInputName)
        }
    }

    trigger(enabled: boolean, frequency: number | null): void {
        // if frequency must be set on carrier oscillators
        if(enabled && frequency != null) {
            for(const nodeName in this.carrierOscillators) {
                this.carrierOscillators[nodeName]!.node.setFrequency(frequency)
            }
        }
        //trigger the envelops
        for(const nodeName in this.triggerableNodes) {
            this.triggerableNodes[nodeName]!.node.trigger(enabled)
        }
    }
}