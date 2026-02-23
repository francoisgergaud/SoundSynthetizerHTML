import { SynthBaseNode, type NodeBaseConfig } from "./synthNodes"

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

    getInputs(){
        return {
            "input": this.filter,
            "cutoffFrequency": this.filter.frequency,
            "Q": this.filter.Q,
            "filterGain": this.filter.gain,
            "cutoffFrequencyDetune": this.filter.detune
        }
    }

    getOutputs():  { [outputName: string]: { node: AudioNode; index: number; }; }{
        return {
            "output": {
                "node": this.filter,
                "index": 0,
            }
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