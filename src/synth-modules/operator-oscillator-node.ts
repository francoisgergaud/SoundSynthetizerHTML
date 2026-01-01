import { SynthBaseNode, type AudibleFrequencyBaseNode, type TriggerBaseNode } from "./synthNodes"


export class OperatorOscillator extends SynthBaseNode implements AudibleFrequencyBaseNode, TriggerBaseNode {
    oscillator: OscillatorNode
    gainForModulationIndex: GainNode
    gainForEnvelop: GainNode
    isFrequencyBasedOnPitch: boolean
    isEnvelopInputConnected: boolean
    ratio: number
    static readonly ENVELOP_INPUT_NAME: string = "envelop"

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}) {
        super(name, audioContext)
        const oscillatorType: OscillatorType = config.oscillatorType as OscillatorType ?? "sine"
        this.gainForEnvelop = audioContext.createGain()
        this.gainForModulationIndex = audioContext.createGain()
        this.gainForModulationIndex.gain.value = config.modulationIndex as number ?? 1;
        this.gainForEnvelop.gain.value = 1;
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = config.frequency as number ?? 0
        this.oscillator.type = oscillatorType
        this.oscillator.connect(this.gainForEnvelop)
        this.oscillator.start()
        this.isFrequencyBasedOnPitch = true
        this.isEnvelopInputConnected = false
        this.ratio = 1
    }

    setFrequency(value: number) {
        const frequency = value * this.ratio
        console.debug(`${this.name}: change frequency to ${frequency}`)
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    }

    getRatio(): number {
        return this.ratio
    }

    setRatio(value: number): void {
        this.ratio = value
    }

    setModulationIndex(value: number) {
        this.gainForModulationIndex.gain.setValueAtTime(this.audioContext.currentTime, value)
    }

    getModulationIndex(): number {
        return this.gainForModulationIndex.gain.value
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        const result: {[inputName:string]: AudioParam | AudioNode} = {
            "frequency": this.oscillator.frequency
        }
        result[OperatorOscillator.ENVELOP_INPUT_NAME]=this.gainForEnvelop.gain
        return result
    }

    getOutputs(): { [outputName: string]: { node: AudioNode; index: number } } {
        return {
            "output": {
                "node": this.gainForEnvelop,
                "index": 0
            }
        }
    }

    getType() : OscillatorType {
        return this.oscillator.type
    }

    setType(value: OscillatorType) {
        this.oscillator.type=value
    }

    exportNodeData(): {[isPropertyNamee: string]: string|number|boolean} {
        const result = super.baseExportNodeData()
        result["frequency"] = this.oscillator.frequency.value
        result["oscillatorType"] = this.getType()
        result["ratio"] = this.getRatio()
        result["modulationIndex"] = this.getModulationIndex()
        return result
    }

    linkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        super.linkInput(sourceNode, sourceOutputName, inputName)
        this.isEnvelopInputConnected = this.linkedInputs.has(OperatorOscillator.ENVELOP_INPUT_NAME)
    }

    unlinkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        super.unlinkInput(sourceNode, sourceOutputName, inputName)
        this.isEnvelopInputConnected = this.linkedInputs.has(OperatorOscillator.ENVELOP_INPUT_NAME)
    }

    /**
     * triggers check if there is an node connected tot he envelop input. If this is the case,
     * we do nothing as the node connected tot he envelop input is supposed to activate the gain.
     * If there is nothing connected tot the envelop input, we simulate a dummy envelop with immediate attack, no decay an immediate release.
     * The sustain is set to full gain.
     */
    trigger(enabled: boolean) {
        console.debug(`${this.name}: trigger ${enabled}`)
        if(! this.isEnvelopInputConnected) {
            this.gainForEnvelop.gain.setValueAtTime(this.audioContext.currentTime, enabled ? 1 : 0)
        }
    }
}