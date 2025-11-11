import { SynthBaseNode } from "./synthNodes"

export class Sequencer extends SynthBaseNode {
    
    name: string
    audioContext: AudioContext
    currentStep: number // playing current index
    intervalId: number | null // id of the timer use to sequence the beats' steps
    numberOfStep: number // the number of steps
    tracks: {track: Track, audioNode: ConstantSourceNode}[]
    stepDurationTimeSeconds: number // the step time in seconds
    nextNoteTimeSeconds: number | null
    numberOfBeat: number
    numberOfStepsPerBeat: number
    tempo: number
    trackDurationSeconds: number
    _intervalId: number | null

    constructor(name: string, audioContext: AudioContext, config : {[parameterName: string]: any}  | null) {
        super(name, audioContext)
        this.name = name
        this.audioContext = audioContext
        this.currentStep = 0
        this.intervalId = null
        this.numberOfBeat = config?.numberOfBeat as number ?? 4 // 4 beats
        this.numberOfStepsPerBeat = config?.numberOfStepsPerBeat as number ?? 4 //16th notes (4 sub-division in a beat)
        this.tempo = config?.tempo as number ?? 90
        this.trackDurationSeconds = this.numberOfBeat * (60/this.tempo)
        this.numberOfStep = this.numberOfBeat * this.numberOfStepsPerBeat
        this.stepDurationTimeSeconds = 60/(this.tempo * this.numberOfStepsPerBeat)
        this.tracks = []
        if(config?.tracks) {
            for(const trackConfig of config!.tracks as {name: string, steps: {number:number}}[]) {
                this.addTrack(trackConfig.name, trackConfig.steps)
            }
        }
        this.nextNoteTimeSeconds = null
        this._intervalId = null
    }


    scheduleNextStep() {
        console.debug(`${this.name}: play step ${this.currentStep} at ${this.nextNoteTimeSeconds}`)
        for(const track of this.tracks){
            const value = track!.track.getStepValue(this.currentStep)
            console.debug(`${this.name}: ${track.track.name} value ${value}`)
            track!.audioNode.offset.setValueAtTime(value, this.nextNoteTimeSeconds!)

        }
        this.currentStep = (this.currentStep + 1) % this.numberOfStep
        this.nextNoteTimeSeconds! += this.stepDurationTimeSeconds
    }

    start() {
        this.currentStep = 0
        this.nextNoteTimeSeconds = this.audioContext.currentTime
        const stepDurationTimeMs = this.stepDurationTimeSeconds *1000
        this._intervalId = setInterval(this.scheduleNextStep.bind(this), stepDurationTimeMs)
        this.scheduleNextStep()
    }

    stop() {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = null;
            this.currentStep = 0;
            // reset the constant-souce audio-nodes
            for(const track of this.tracks){
                track!.audioNode.offset.setValueAtTime(0, this.audioContext.currentTime)
            }
            console.log("Sequencer stopped.");
        }
    }

    addTrack(trackName: string, steps: {number:number} | null) {
        const constantSourceNode = new ConstantSourceNode(this.audioContext, {offset:0})
        constantSourceNode.start();
        const track =  new Track(trackName, steps)
        this.tracks.push({
            track: track,
            audioNode: constantSourceNode
        })
        return track
    }

    getTracks(): Track[] {
        const result = this.tracks.map(
            (trackInfo: {track: Track, audioNode: ConstantSourceNode}): Track => {
                return trackInfo.track
            }
        )
        return result
    }

    getInputs(): { [inputName: string]: AudioParam | AudioNode } {
        return {}
    }
    getOutputs(): { [outputName: string]: { node: AudioNode; index: number } } {
        const result: { [outputName: string]: { node: AudioNode; index: number } } = {}
        for(const track of this.tracks){
            result[`${track?.track.name}`] = {node: track!.audioNode, index: 0 }
        }
        return result
    }
    exportNodeData(): { [propertyName: string]: any } {
        let result: {[propertyName: string]: any} = {
            "tracks": [],
            "tempo": this.tempo,
            "numberOfBeat": this.numberOfBeat,
            "numberOfStepsPerBeat": this.numberOfStepsPerBeat,
        }
        for(const track of this.tracks){
            result["tracks"].push(track.track.exportNodeData())
        }
        return result;
    }
}

export class Track {

    name: string
    steps: {[stepId:number]: number}

    constructor(name: string, steps: {number: number} | null) {
        this.name = name
        this.steps = {}
        if(steps) {
            this.steps = steps
        }
    }

    getStepValue(step: number): number {
        return this.steps[step] || 0
    }

    setStepValue(step: number, value: number) {
        this.steps[step] = value
    }

    exportNodeData(): { [propertyName: string]: any } {
        return {
            "name": this.name,
            "steps": this.steps
        }
    }

}