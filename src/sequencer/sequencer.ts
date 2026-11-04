import { Graph, type GraphConfig } from "@/graph"
import { AudioNodeOutput, GateOutput, SynthBaseNode, type NodeBaseConfig, type SynthBaseNodeInput, type SynthBaseNodeOutput } from "@/synth-modules/synthNodes"

export type SequencerConfig = {
    tracks: TrackConfig[],
    tempo: number,
    numberOfBeat: number,
    numberOfStepsPerBeat: number 
} & NodeBaseConfig;

export class Sequencer extends SynthBaseNode{

    _previousStep: number // playing previous index
    _currentStep: number // playing current index
    _numberOfStep: number // the number of steps
    _tracks: Track[]
    _stepDurationTimeSeconds: number // the step time in seconds
    _nextNoteTimeSeconds: number | null
    _numberOfBeat: number
    _numberOfStepsPerBeat: number
    _tempo: number
    _trackDurationSeconds: number
    _intervalId: number | null

    constructor(name: string, audioContext: AudioContext, config : SequencerConfig | null) {
        super(name, audioContext)

        this._numberOfBeat = config ? config.numberOfBeat as number : 4
        this._numberOfStepsPerBeat = config ? config.numberOfStepsPerBeat as number : 4 //16th notes (4 sub-division in a beat)
        this._tempo = config ? config.tempo as number : 90

        this._trackDurationSeconds = this._numberOfBeat * (60/this._tempo)
        this._numberOfStep = this._numberOfBeat * this._numberOfStepsPerBeat
        this._stepDurationTimeSeconds = 60/(this._tempo * this._numberOfStepsPerBeat)

        this._tracks = []
        if(config) {
            for(const trackConfig of config.tracks) {
                this.addTrack(trackConfig.name, trackConfig)
            }
        }
        
        this._previousStep = 0
        this._currentStep = 0
        this._nextNoteTimeSeconds = null
        this._intervalId = null
    }

    getInputs(): { [inputName: string]: SynthBaseNodeInput } {
        return {}
    }
    getOutputs(): { [outputName: string]: SynthBaseNodeOutput } {
        const outputs: { [outputName: string]: SynthBaseNodeOutput } = {}
        for(const track of this._tracks) {
            const trackOutputs = track.trackOutNode.getOutputs()
            for(const outputName in trackOutputs) {
                outputs[`${track.name}-${outputName}`] = trackOutputs[outputName]!
            }
        }
        return outputs
    }

    exportNodeData(): NodeBaseConfig {
        let tracksConfig = []
        for(const track of this._tracks){
            tracksConfig.push(track.export())
        }
        let result: SequencerConfig = {
            name: this.name,
            tracks: tracksConfig,
            tempo: this._tempo,
            numberOfBeat: this._numberOfBeat,
            numberOfStepsPerBeat: this._numberOfStepsPerBeat,
        }
        return result;
    }


    scheduleNextStep() {
        console.debug(`${this.name}: play step ${this._currentStep} at ${this._nextNoteTimeSeconds}`)
        this._currentStep = (this._currentStep + 1) % this._numberOfStep
        this._nextNoteTimeSeconds! += this._stepDurationTimeSeconds
        for(const track of this._tracks){
            track.playStepAtTime(this._currentStep, this._nextNoteTimeSeconds!)
        }
    }

    start() {
        this._currentStep = -1
        // to improve: the sequencer start after an empty step duration. IT should start immediatly, schedule the next step immediatly, 
        // and then schedule the next step while the step before is played
        this._nextNoteTimeSeconds = this.audioContext.currentTime
        const stepDurationTimeMs = this._stepDurationTimeSeconds *1000
        this._intervalId = setInterval(this.scheduleNextStep.bind(this), stepDurationTimeMs)
        this.scheduleNextStep()
    }

    stop() {
        for(const track of this._tracks){
            track.stop()
        }
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
            this._currentStep = 0;
            console.log("Sequencer stopped.");
        }
    }

    addTrack(trackName: string, config: TrackConfig | null): Track {
        const track =  new Track(this.audioContext, trackName, config, this._numberOfStep)
        this._tracks.push(track)
        return track
    }

    getTracks(): Track[] {
        return this._tracks
    }

    getTrackDurationSeconds(): number {
        return this._trackDurationSeconds
    }

    getNumberOfStep(): number {
        return this._numberOfStep
    }

    getStepDurationTimeSeconds(): number {
        return this._stepDurationTimeSeconds
    }

    getCurrentStep(): number {
        return this._currentStep
    }
}

export type TrackConfig = {
    name: string,
    steps: {[stepId:number]: number| undefined},
    trackHeaderConfig: NodeBaseConfig,
}

export class Track {

    name: string
    steps: {[stepId:number]: number|undefined}
    trackOutNode: TrackOutNode
    _numberOfSteps: number

    constructor(audioContext: AudioContext, name: string, config: TrackConfig | null, numberOfSteps: number) {
        this.name = name
        this._numberOfSteps = numberOfSteps
        if(config) {
            this.steps = config.steps
        } else {
            this.steps = {}
        }
        this.trackOutNode = new TrackOutNode(audioContext, name)
    }

    playStepAtTime(stepNumber: number, time: number) {
        const previousValue = stepNumber == 0 ? this.getStepValue(this._numberOfSteps - 1) : this.getStepValue(stepNumber - 1)
        const nextStepValue = this.getStepValue(stepNumber)
        //trigger only if value changes
        if(previousValue !== nextStepValue) {
            this.trackOutNode.playValueAtTime(nextStepValue, time)
            this.trackOutNode.triggerOutput.trigger(time)
        }
    }

    stop() {
        this.trackOutNode.stop()
    }


    getStepValue(step: number): number {
        return this.steps[step] || 0
    }

    setStepValue(step: number, value: number | undefined) {
        this.steps[step] = value
    }

    export(): TrackConfig {
        return {
            name: this.name,
            steps: this.steps,
            trackHeaderConfig: this.trackOutNode.exportNodeData(),
        }
    }
}

export class TrackOutNode extends SynthBaseNode {

    outputAudioNode: ConstantSourceNode
    triggerOutput: GateOutput

    constructor(audioContext: AudioContext, trackName: string){
        super(`track ${trackName}`, audioContext)
        this.outputAudioNode = audioContext.createConstantSource();
        this.outputAudioNode.offset.value = 0;
        this.outputAudioNode.start();
        this.triggerOutput = new GateOutput("trigger");
    }

    playValueAtTime(value: number, time: number) {
        this.outputAudioNode.offset.setValueAtTime(value, time);
    }

    stop() {
        this.outputAudioNode.offset.setValueAtTime(0, this.audioContext.currentTime);
    }

    getInputs(): { [inputName: string]: SynthBaseNodeInput } {
        return {}
    }
   
    getOutputs(): { [outputName: string]: SynthBaseNodeOutput } {
        return {
            "output": new AudioNodeOutput(this.outputAudioNode, "output", 0),
            "trigger": this.triggerOutput
        }
    }

    exportNodeData(): NodeBaseConfig {
        return super.baseExportNodeData()
    }
}