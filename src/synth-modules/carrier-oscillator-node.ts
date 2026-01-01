import { SynthBaseNode, type AudibleFrequencyBaseNode, type TriggerBaseNode } from "./synthNodes"

export class CarrierOscillator extends SynthBaseNode implements AudibleFrequencyBaseNode, TriggerBaseNode{
    
    oscillator: OscillatorNode
    gainForEnvelop: GainNode
    isFrequencyBasedOnPitch: boolean
    static readonly ENVELOP_INPUT_NAME: string = "envelop"
    // is the "envelop" input controled by another node?
    isEnvelopInputConnected: boolean

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: string | number | boolean | null}) {
        super(name, audioContext)
        const oscillatorType: OscillatorType = config.oscillatorType as OscillatorType ?? "sine"
        this.gainForEnvelop = audioContext.createGain()
        this.gainForEnvelop.gain.value = 1;
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = config.frequency as number ?? 0
        this.oscillator.detune.value = config.detune as number ?? 0
        this.oscillator.type = oscillatorType
        this.oscillator.connect(this.gainForEnvelop)
        this.oscillator.start()
        this.isFrequencyBasedOnPitch = true
        this.isEnvelopInputConnected = false
    }

    getFrequency(): number {
        return this.oscillator.frequency.value
    }

    setFrequency(value: number) {
        this.oscillator.frequency.setValueAtTime(value, this.audioContext.currentTime)
    }

    getDetune(): number {
        return this.oscillator.detune.value
    }

    setDetune(value: number) {
       this.oscillator.detune.setValueAtTime(value, this.audioContext.currentTime)
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        const result: {[inputName:string]: AudioParam | AudioNode} = {
            "frequency": this.oscillator.frequency,
            "detune": this.oscillator.detune,
        }
        result[CarrierOscillator.ENVELOP_INPUT_NAME]=this.gainForEnvelop.gain
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
        return {
            "frequency": this.getFrequency(),
            "oscillatorType": this.getType(),
            "detune": this.getDetune()
        }
    }

    linkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        super.linkInput(sourceNode, sourceOutputName, inputName)
        this.isEnvelopInputConnected = this.linkedInputs.has(CarrierOscillator.ENVELOP_INPUT_NAME)
    }

    unlinkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        super.unlinkInput(sourceNode, sourceOutputName, inputName)
        this.isEnvelopInputConnected = this.linkedInputs.has(CarrierOscillator.ENVELOP_INPUT_NAME)
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
            this.gainForEnvelop.gain.setValueAtTime(enabled ? 1: 0, this.audioContext.currentTime)
        }
    }
}