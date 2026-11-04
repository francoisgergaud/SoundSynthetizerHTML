import { AudioNodeInput, AudioNodeOutput, SynthBaseNode, type NodeBaseConfig, type SynthBaseNodeInput, type SynthBaseNodeOutput } from "./synthNodes"

export type FilterConfig = {
    cutoffFrequency: number;
    filterType: BiquadFilterType;
    q: number;
    filterGain: number;
    filterDetune: number;
} & NodeBaseConfig;

export class Filter extends SynthBaseNode {

    filter: BiquadFilterNode
        
    constructor(name: string, audioContext: AudioContext, config : FilterConfig | null){
        const cutoffFrequency: number = config ? config.cutoffFrequency : 440
        const filterType: BiquadFilterType = config ? config.filterType : "lowpass"
        const q: number = config ? config.q : 1
        const filterGain: number = config ? config.filterGain : 1
        const filterDetune: number = config? config.filterDetune: 1
        super(name, audioContext);
        this.filter = audioContext.createBiquadFilter();
        this.filter.frequency.value = cutoffFrequency;
        this.filter.type = filterType
        this.filter.Q.value = q;
        this.filter.gain.value = filterGain
        this.filter.detune.value = filterDetune
    }

    getInputs():  { [inputName: string]: SynthBaseNodeInput}{
        return {
            "input": new AudioNodeInput(this.filter, "input"),
            "cutoffFrequency": new AudioNodeInput(this.filter.frequency, "cutoffFrequency"),
            "Q": new AudioNodeInput(this.filter.Q, "Q"),
            "filterGain": new AudioNodeInput(this.filter.gain, "filterGain"),
            "cutoffFrequencyDetune": new AudioNodeInput(this.filter.detune, "cutoffFrequencyDetune")
        }
    }

    getOutputs():  { [outputName: string]: SynthBaseNodeOutput} {
        return {
            "output": new AudioNodeOutput(this.filter, "output", 0)
        }
    }

    getFilterType(): BiquadFilterType {
        return this.filter.type;
    }

    setFilterType(value: BiquadFilterType) {
        this.filter.type = value;
    }

    getCutoffFrequency(): number {
        return this.filter.frequency.value
    }

    setCutoffFrequency(value: number) {
        this.filter.frequency.value = value
    }

    getQ(): number {
        return this.filter.Q.value
    }

    setQ(value: number) {
        this.filter.Q.value = value
    }

    getFilterGain(): number {
        return this.filter.gain.value
    }

    setFilterGain(value: number) {
        this.filter.gain.value = value
    }

    getFilterDetune(): number {
        return this.filter.detune.value
    }

    setFilterDetune(value: number) {
        this.filter.detune.value = value
    }

    exportNodeData(): FilterConfig {
        return {
            ...super.baseExportNodeData(),
            filterType: this.getFilterType(),
            cutoffFrequency: this.getCutoffFrequency(),
            q: this.getQ(),
            filterGain: this.getFilterGain(),
            filterDetune: this.getFilterDetune()
        }
    }
}