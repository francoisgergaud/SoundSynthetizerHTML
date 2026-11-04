import { AudioNodeInput, AudioNodeOutput, SynthBaseNode, type NodeBaseConfig, type SynthBaseNodeInput, type SynthBaseNodeOutput } from "./synthNodes"

export class Analyzer extends SynthBaseNode {

    analyzerNode: AnalyserNode

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: any}  | null) {
        super(name, audioContext)
        this.analyzerNode = audioContext.createAnalyser();
        this.analyzerNode.fftSize = 64
    }

    getInputs(): { [inputName: string]: SynthBaseNodeInput } {
        return {
            "in": new AudioNodeInput(this.analyzerNode, "in")
        }
    }
    getOutputs(): { [outputName: string]: SynthBaseNodeOutput } {
        return {
            "out": new AudioNodeOutput(this.analyzerNode, "out", 0)
        }
    }
    exportNodeData(): NodeBaseConfig {
        return super.baseExportNodeData()
    }

    getFrequencyValues(): Uint8Array {
        const bufferLength = this.analyzerNode.frequencyBinCount
        const result = new Uint8Array(bufferLength);
        this.analyzerNode.getByteFrequencyData(result)
        return result
    }

    getTimeValues(): Uint8Array {
        const bufferLength = this.analyzerNode.fftSize
        const result = new Uint8Array(bufferLength);
        this.analyzerNode.getByteTimeDomainData(result)
        return result
    }

}