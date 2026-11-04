import { Analyzer } from "./synth-modules/analyzer-node"
import { CarrierOscillator, type CarrierOscillatorConfig } from "./synth-modules/carrier-oscillator-node"
import { ADSR, type ADSRConfig } from "./synth-modules/adsr-node"
import { AudioNodeInput, type NodeBaseConfig, type NodeConfig, SynthBaseNode, type SynthBaseNodeInput, type SynthBaseNodeOutput } from "./synth-modules/synthNodes"
import { OperatorOscillator, type OperatorOscillatorConfig } from "./synth-modules/operator-oscillator-node"
import { Filter, type FilterConfig } from "./synth-modules/filter-node"
import { Delay, type DelayConfig } from "./synth-modules/delay-node"
import { Sequencer, type SequencerConfig } from "./sequencer/sequencer"

export type GraphConfig = {[nodeName:string]: {nodeType: string} & NodeConfig}

class SpeakerNode extends SynthBaseNode {

    constructor(name: string, audioContext: AudioContext) {
        super(name, audioContext)
    }

    getInputs(): {[inputName:string]: SynthBaseNodeInput} {
        return {"input": new AudioNodeInput(this.audioContext.destination, this.name)}
    }

    getOutputs(): { [outputName: string]: SynthBaseNodeOutput} {
        return {}
    }

    exportNodeData(): NodeBaseConfig {
        return this.baseExportNodeData()
    }
}   

export class Graph {

    nodes: { [nodeName:string]: {node: SynthBaseNode, type: string}}
    audioContext: AudioContext
    speakerNode: SpeakerNode
    
    constructor(audioContext: AudioContext){
        this.nodes = {}
        this.audioContext = audioContext
        this.speakerNode = new SpeakerNode("speaker", this.audioContext)
    }

    addNode(nodeName: string, nodeType: string, nodeConfiguration: NodeBaseConfig | null): SynthBaseNode {
        switch(nodeType) {
            case "carrier-oscillator":
                const vco = new CarrierOscillator(nodeName, this.audioContext, nodeConfiguration as CarrierOscillatorConfig | null)
                this.nodes[nodeName] = {"node": vco, "type" : nodeType}
                return vco
            case "operator-oscillator":
                const modulator = new OperatorOscillator(nodeName, this.audioContext, nodeConfiguration as OperatorOscillatorConfig | null)
                this.nodes[nodeName] = {"node": modulator, "type" : nodeType}
                return modulator
            case "delay":
                const delay = new Delay(nodeName, this.audioContext, nodeConfiguration as DelayConfig | null)
                this.nodes[nodeName] = {"node": delay, "type" : nodeType}
                return delay
            case "filter":
                const filter = new Filter(nodeName, this.audioContext, nodeConfiguration as FilterConfig | null)
                this.nodes[nodeName] = {"node": filter, "type" : nodeType}
                return filter
            case "analyzer":
                const analyzer = new Analyzer(nodeName, this.audioContext, nodeConfiguration as NodeBaseConfig | null)
                this.nodes[nodeName] = {"node": analyzer, "type" : nodeType}
                return analyzer
            case "adsr":
                const adsr = new ADSR(nodeName, this.audioContext, nodeConfiguration as ADSRConfig | null)
                this.nodes[nodeName] = {"node": adsr, "type" : "adsr"}
                return adsr
            case "sequencer":
                const sequencer = new Sequencer(nodeName, this.audioContext, nodeConfiguration as SequencerConfig | null)
                this.nodes[nodeName] = {"node": sequencer, "type" : "sequencer"}
                return sequencer
            default:
                throw new Error(`addNode: unknown node-type ${nodeType}`)
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
        for(const inputName in this.speakerNode.getInputs()){
            result["speaker"] = {
                node: this.speakerNode,
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
        sourceOutput.connectTo(destinationInput)
        //add link information on each node
        sourceNode.linkOutput(destinationNode, destinationInputName, sourceOutputName)
        destinationNode.linkInput(sourceNode, sourceOutputName, destinationInputName)
    }

    static unlinkNode(sourceNode: SynthBaseNode, sourceOutputName: string, destinationNode: SynthBaseNode, destinationInputName: string){
        const sourceOutput = sourceNode.getOutputs()[sourceOutputName]!
        const destinationInput = destinationNode.getInputs()[destinationInputName]!
        sourceOutput.disconnect(destinationInput);
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
        result["speaker"] = {
            ...this.speakerNode.export(),
            nodeType : "speaker"
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
            if(nodeType != "speaker"){
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
            let destinationNode: SynthBaseNode = this.speakerNode
            if(destinationNodeName != "speaker") {
                destinationNode = this.nodes[inputLinkConfiguration["nodeName"]]!.node
            }
            const destinationInputName = inputLinkConfiguration["inputName"]
            Graph.linkNodes(sourceNode, sourceOutputName, destinationNode, destinationInputName)
        }
    }
}
