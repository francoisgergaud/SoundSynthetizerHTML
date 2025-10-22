export abstract class SynthBaseNode {
    
    audioContext: AudioContext
    inputs:  {[inputName: string]:  { sourceNode: SynthBaseNode; sourceOutputName: string} }
    outputs:  {[outputName: string]:  { destinationNode: SynthBaseNode; destinationInputName: string} }


    constructor(audioContext: AudioContext){
        this.audioContext = audioContext
        this.inputs = {}
        this.outputs={}
    }

    abstract getInputs() : {[inputName:string]: AudioParam | AudioNode}
    abstract getOutputs() : {[outputName:string]: {node: AudioNode, index: number }}


    linkInput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        this.inputs[inputName] =
        {
            "sourceNode": sourceNode,
            "sourceOutputName": sourceOutputName,
        }
        
    }

    linkOutput(sourceNode: SynthBaseNode, sourceOutputName:string, inputName: string){
        this.inputs[inputName] =
        {
            "sourceNode": sourceNode,
            "sourceOutputName": sourceOutputName,
        }
        
    }
}

abstract class Gain extends SynthBaseNode{
    name: string
    gain: GainNode
    muter: GainNode
    isMuted: boolean

    constructor(name: string, audioContext: AudioContext, gain: number) {
        super(audioContext);
        this.name = name

        this.gain = audioContext.createGain()
        this.gain.gain.value = gain;

        this.muter = audioContext.createGain()
        this.muter.gain.value = 1
        this.isMuted = false

        this.gain.connect(this.muter)
    }

    getGain(): number {
        return this.gain.gain.value
    }

    setGain(value: number) {
        this.gain.gain.setValueAtTime(value, this.audioContext.currentTime);
    }

    isMute(): boolean {
        return this.isMuted
    }

    unmute() {
        this.muter.gain.value= 1;
        this.isMuted = false;
    }

    mute() {
        this.muter.gain.value= 0;
        this.isMuted = true;
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        return {
            "gain": this.gain.gain,
        }
    }

    getOutputs() : {[outputName:string]: {node: AudioNode, index: number }}{
        return {
            "output": {
                "node": this.muter,
                "index": 0
            }
        }
    }
}

abstract class BaseOscillator extends Gain {
    oscillator: OscillatorNode

    constructor(name: string, audioContext: AudioContext, frequency: number, gain: number) {
        super(name, audioContext, gain)
        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = frequency
        this.oscillator.connect(this.gain)
        this.oscillator.start()
    }

    getFrequency(): number {
        return this.oscillator.frequency.value
    }

    setFrequency(value: number) {
        this.oscillator.frequency.setValueAtTime(value, this.audioContext.currentTime)
    }

    getInputs() : {[inputName:string]: AudioParam | AudioNode}{
        const inputs = super.getInputs()
        inputs["frequency"] = this.oscillator.frequency
        return inputs
    }

    getType() : OscillatorType {
        return this.oscillator.type
    }

    setType(value: OscillatorType) {
        this.oscillator.type=value
    }
}

export class LFO extends BaseOscillator{
    
    constructor(name: string, audioContext: AudioContext) {
        super(name, audioContext, 1, 0);
    }
}

export class VCO extends BaseOscillator{

    constructor(name: string, audioContext: AudioContext) {
        super(name, audioContext, 440, 1);
    }

    getInputs(){
        const inputs = super.getInputs();
        inputs["detune"] = this.oscillator.detune;
        return inputs;
    }

}

export class Speaker extends SynthBaseNode {

    constructor(audioContext: AudioContext){
        super(audioContext)
    }
    
    getInputs(): { [inputName: string]: AudioNode; } {
        return {"speakers": this.audioContext.destination}
    }
   
    getOutputs(): { [outputName: string]: { node: AudioNode; index: number; }; } {
        return {};
    }

}

export class Delay extends Gain {

    delay: DelayNode

    constructor(name: string, audioContext: AudioContext){
        super(name, audioContext,0);
        this.delay = audioContext.createDelay();
        this.delay.delayTime.value = 0.25;
        this.delay.connect(this.gain);
    }

    getInputs(): {[inputName:string]: AudioParam|AudioNode} {
        const inputs = super.getInputs();
        inputs["input"] = this.delay
        inputs["delayTime"] = this.delay.delayTime
        return inputs
    }

    getOutputs():  { [outputName: string]: { node: AudioNode; index: number; }; }{
        const outputs = super.getOutputs();

        outputs["oscillator"] = {
            "node": this.delay,
            "index": 0,
        }

        return outputs;
    }

    getDelayTime(): number {
        return this.delay.delayTime.value
    }

    setDelayTime(seconds: number) {
        this.delay.delayTime.setValueAtTime(seconds, this.audioContext.currentTime);
    }
}

export class Filter extends Gain {

    filter: BiquadFilterNode
        
    constructor(name: string, audioContext: AudioContext){
        super(name, audioContext, 1);
        this.filter = audioContext.createBiquadFilter();
        this.filter.frequency.value = 440;
        this.filter.Q.value = 1;
        this.filter.connect(this.gain);
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
}

abstract class FrequencySequencer {
    
    name: string
    context: AudioContext
    currentStep: number // current detune index
    intervalId: number | null // id of the timer use to sequence the frequencies
    nextNoteTime: number // The precise context.currentTime when the next note should play
    noteDurationMs: number // The length of a single note in milliseconds
    oscillator: OscillatorNode // the oscillator used to output the frequency

    constructor(name: string, audioContext: AudioContext) {
        this.name = name
        this.context = audioContext
        this.currentStep = 0
        this.intervalId = null
        this.nextNoteTime = 0.0
        this.noteDurationMs = 0.0

        this.oscillator = audioContext.createOscillator()
        this.oscillator.frequency.value = 440
        this.oscillator.start()
    }

    abstract getMelody(): number[]

    scheduler() {
        this.currentStep = (this.currentStep + 1) % this.getMelody().length;
        this.nextNoteTime += this.noteDurationMs;
        this._scheduleNoteChange(this.nextNoteTime)
        this.intervalId = setTimeout(this.scheduler.bind(this), this.noteDurationMs)
    }

    _scheduleNoteChange(scheduleTime: number) {
        const noteInCents = this.getMelody()[this.currentStep];
        //input qre detune in cents, hence the use of the oscillator's detune parameter
        this.oscillator.detune.setValueAtTime(noteInCents!, scheduleTime/1000);
    }

    start(bpm: number, noteDuration = 4) {
        if (this.intervalId) this.stop();
        // Calculate note length in seconds
        const beatDuration = 60 / bpm;
        this.noteDurationMs = beatDuration * (4 / noteDuration) *1000
        // Initialize the next note time to the current context time
        this.nextNoteTime = this.context.currentTime
        // Run scheduler once immediately to schedule the very first note
        this._scheduleNoteChange(0)
        // Trigger the scheduler, which trigger itself infinitly
        this.scheduler()
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.currentStep = 0;
            console.log("Melody stopped.");
        }
    }
}


class Melody extends FrequencySequencer{

    getMelody(): number[] {
        return [
            0,    // A3
            1200, // A4 (+1 octave)
            1000, // G4 (+10 semitones)
            700,  // E4 (+7 semitones)
            1000, // G4
            700,  // E4
            500,  // D4 (+5 semitones)
            300   // C4 (+3 semitones)
        ];
    }
}

class Bass extends FrequencySequencer{
    getMelody(): number[] {
        return [
            0,    // A
            200,  // B
            300,  // C
            500,  // D
        ];
    }
}

export class MusicSequence extends SynthBaseNode {

    name: string
    melody: Melody
    bass: Melody
    
    constructor(name: string, audioContext: AudioContext) {
        super(audioContext);
        this.name = name;

        this.melody = new Melody(`${name}/melody`, audioContext);
        this.bass = new Bass(`${name}/bass`, audioContext);

        this.start(90);
    }

    getOutputs():  { [outputName: string]: { node: AudioNode; index: number; }; } {
        return {
            "melody": {
                "node": this.melody.oscillator,
                "index": 0,
            },
            "bass": {
                "node": this.bass.oscillator,
                "index": 0,
            },
        }
    }

    getInputs() {
        return {}
    }

    start(bpm: number) {
            this.melody.start(bpm, 16);
            this.bass.start(bpm, 2);
    }

    stop() {
            this.melody.stop();
            this.bass.stop();
    }
}