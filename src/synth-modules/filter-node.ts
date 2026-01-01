import { SynthBaseNode } from "./synthNodes"

export class Filter extends SynthBaseNode {

    filter: BiquadFilterNode
        
    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}){
        const cutoffFrequency: number = config.cutoffFrequency as number ?? 440
        const filterType: BiquadFilterType = config.filterType as BiquadFilterType ?? "lowpass"
        const q: number = config.q as number ?? 1
        const filterGain: number = config.filterGain as number ?? 1
        const filterDetune: number = config.filterDetune as number ?? 1
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
        this.filter.frequency.setValueAtTime(value, this.audioContext.currentTime);
    }

    getQ(): number {
        return this.filter.Q.value
    }

    setQ(value: number) {
        this.filter.Q.setValueAtTime(value, this.audioContext.currentTime);
    }

    getFilterGain(): number {
        return this.filter.gain.value
    }

    setFilterGain(value: number) {
        this.filter.gain.setValueAtTime(value, this.audioContext.currentTime);
    }

    getFilterDetune(): number {
        return this.filter.gain.value
    }

    setFilterDetune(value: number) {
        this.filter.gain.setValueAtTime(value, this.audioContext.currentTime);
    }

    exportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        return {
            "filterType": this.getFilterType(),
            "cutoffFrequency": this.getCutoffFrequency(),
            "q": this.getQ(),
            "filterGain": this.getFilterGain(),
            "filterDetune": this.getFilterDetune()
        }
    }
}