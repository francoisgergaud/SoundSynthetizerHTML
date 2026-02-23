import { Analyzer } from "./synth-modules/analyzer-node"
import { CarrierOscillator, type CarrierOscillatorConfig } from "./synth-modules/carrier-oscillator-node"
import { ADSR, type ADSRConfig } from "./synth-modules/adsr-node"
import { type AudibleFrequencyBaseNode, type NodeBaseConfig, type NodeConfig, type SynthBaseNode, type TriggerBaseNode, isFrequencyBasedOnPitchNode, isTriggerableBaseNode } from "./synth-modules/synthNodes"
import { OperatorOscillator, type OperatorOscillatorConfig } from "./synth-modules/operator-oscillator-node"
import { Filter, type FilterConfig } from "./synth-modules/filter-node"
import { Delay, type DelayConfig } from "./synth-modules/delay-node"

export type GraphConfig = {[nodeName:string]: {nodeType: string} & NodeConfig}


export class Graph {

    nodes: { [nodeName:string]: {node: SynthBaseNode, type: string }}
    triggerableNodes: { [nodeName:string]: TriggerBaseNode}
    adujustableFrequencyOscillators: { [nodeName:string]: AudibleFrequencyBaseNode }
    audioContext: AudioContext
    trackOutNode: SynthBaseNode
    
    constructor(audioContext: AudioContext, trackOutNode: SynthBaseNode){
        this.nodes = {}
        this.triggerableNodes = {}
        this.adujustableFrequencyOscillators = {}
        this.audioContext = audioContext
        this.trackOutNode = trackOutNode
    }

    addNode(nodeName: string, nodeType: string, nodeConfiguration: NodeBaseConfig | null) {
        switch(nodeType) {
        case "carrier-oscillator":
            const vco = new CarrierOscillator(nodeName, this.audioContext, nodeConfiguration as CarrierOscillatorConfig | null)
            this.nodes[nodeName] = {"node": vco, "type" : nodeType}
            break
        case "operator-oscillator":
            const modulator = new OperatorOscillator(nodeName, this.audioContext, nodeConfiguration as OperatorOscillatorConfig | null)
            this.nodes[nodeName] = {"node": modulator, "type" : nodeType}
            break
        case "delay":
            const delay = new Delay(nodeName, this.audioContext, nodeConfiguration as DelayConfig | null)
            this.nodes[nodeName] = {"node": delay, "type" : nodeType}
            break
        case "filter":
            const filter = new Filter(nodeName, this.audioContext, nodeConfiguration as FilterConfig | null)
            this.nodes[nodeName] = {"node": filter, "type" : nodeType}
            break
        case "analyzer":
            const analyzer = new Analyzer(nodeName, this.audioContext, nodeConfiguration as NodeBaseConfig | null)
            this.nodes[nodeName] = {"node": analyzer, "type" : nodeType}
            break
        case "adsr":
            const adsr = new ADSR(nodeName, this.audioContext, nodeConfiguration as ADSRConfig | null)
            this.nodes[nodeName] = {"node": adsr, "type" : "adsr"}
            break
        default:
            console.error(`addNode: unknown node-type ${nodeType}`)
        }
        //add the node to be triggered on event
        if(this.nodes[nodeName] && isTriggerableBaseNode(this.nodes[nodeName]["node"])) {
            this.triggerableNodes[nodeName] = this.nodes[nodeName]["node"]
        }
        if(this.nodes[nodeName] && isFrequencyBasedOnPitchNode(this.nodes[nodeName]["node"])) {
            this.adujustableFrequencyOscillators[nodeName] = this.nodes[nodeName]["node"]
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
        for(const inputName in this.trackOutNode.getInputs()){
            result["track-out"] = {
                node: this.trackOutNode,
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

    export(): GraphConfig {
        const result: GraphConfig = {}
        for(const nodeName in this.nodes) {
            const synthNode = this.nodes[nodeName]!.node
            const synthNodeType = this.nodes[nodeName]!.type
            result[nodeName] = {
                ...synthNode.export(),
                nodeType: synthNodeType
            }
            //add the node-type: it is a property of the node reauired only in the context of a graph.
            result[nodeName]["nodeType"] = synthNodeType
        }
        //manually add the speaker as it is a default node in the graph (it is not in the nodes-list).
        // it is exported only to have its inputs to import it later
        result["trackOut"] = {
            ...this.trackOutNode.export(),
            nodeType : "trackOut"
        }
        return result
    }

    import(configuration: GraphConfig) {
        //reset the nodes
        this.nodes = {}
        //add the nodes from config
        const inputLinksConfiguration:{nodeName:string, inputName:string, sourceNodeName:string, sourceOutputName:string}[] = []
        for(const nodeName in configuration){
            const nodeConfiguration = configuration[nodeName]!
            const nodeType = nodeConfiguration["nodeType"]
            // ignore the speaker: we only use its input to link it after all nodes are created
            if(nodeType != "trackOut"){
                this.addNode(nodeName, nodeType, nodeConfiguration["nodeData"] as NodeBaseConfig)
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
            //exception if made for 'track-out' node. This is a default node and does not appear int he graph's nodes
            let destinationNode: SynthBaseNode = this.trackOutNode
            if(destinationNodeName != "trackOut") {
                destinationNode = this.nodes[inputLinkConfiguration["nodeName"]]!.node
            }
            const destinationInputName = inputLinkConfiguration["inputName"]
            Graph.linkNodes(sourceNode, sourceOutputName, destinationNode, destinationInputName)
        }
    }

    trigger(enabled: boolean, frequency: number | null): void {
        /**
         * trigger and set frequencies on the related nodes in the graph.
         * Frequency is set on carrier and modulator oscillator (but not LFOs). Trigger is invoked on envelop
         * and oscillators. For oscillators, their trigger method checks if an envelop is already connected. If it is the case,
         * their trigger does not do anything as their envelop is executed instead.
         */
        // if frequency must be set on oscillators
        if(frequency != null) {
            for(const nodeName in this.adujustableFrequencyOscillators) {
                this.adujustableFrequencyOscillators[nodeName]!.setFrequency(frequency)
            }
        }
        //trigger the envelops and oscillators without envelop
        for(const nodeName in this.triggerableNodes) {
            this.triggerableNodes[nodeName]!.trigger(enabled)
        }
    }
}