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

abstract class SynthGainNode extends SynthBaseNode{
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

    getOutputs() : {[outputName:string]: {node: AudioNode, index: number }}{
        return {
            "output": {
                "node": this.muter,
                "index": 0
            }
        }
    }
}

abstract class BaseOscillator extends SynthGainNode {
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

    getInputs() : {[inputName:string]: AudioParam}{
        return {
            "frequency": this.oscillator.frequency,
            "gain": this.gain.gain,
        }
    }

    getType() : OscillatorType {
        return this.oscillator.type
    }

    setType(value: OscillatorType) {
        this.oscillator.type=value
    }
}

export class LFONode extends BaseOscillator{
    
    constructor(name: string, audioContext: AudioContext) {
        super(name, audioContext, 1, 0);
    }
}

export class VCONode extends BaseOscillator{

    constructor(name: string, audioContext: AudioContext) {
        super(name, audioContext, 440, 1);
    }

    getInputs(){
        let result = super.getInputs();
        result["detune"] = this.oscillator.detune;
        return result;
    }

    getOutputs(){
        const outputs = super.getOutputs();

        outputs["oscillator"] = {
            "node": this.oscillator,
            "index": 0,
        }

        return outputs;
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

// class Delay extends GainNode {
//     constructor(name, audioContext){
//         super(name, audioContext);
//         this.delay = audioContext.createDelay();
//         this.delay.delayTime.value = 0.25;
//         this.delay.connect(this.gain);
//     }

//     getInputs(){
//         return {
//             "input": this.delay,
//             "delayTime": this.delay.delayTime,
//             "gain": this.gain.gain
//         }
//     }

//     setDelayTime(seconds) {
//         this.delay.delayTime.setValueAtTime(seconds, this.audioContext.currentTime);
//     }

//     render(parentDiv) {
//         const childDiv = document.createElement("div");
//         childDiv.innerHTML = `
//             <div class="synth-node">
//                 <div>
//                     <label class="header">
//                         ${this.name}
//                     </label>
//                     <div class="synth-node-control-group">
//                         <label for="${this.name}-delayTime">Delay (s): </label>
//                         <input type="range" id="${this.name}-delayTime" min="0" max="1" value="${this.delay.delayTime.value}" step="0.05">
//                         <span id="${this.name}-delayTimeValue">${this.delay.delayTime.value}</span>
//                     </div>

//                     <div class="synth-node-control-group">
//                         <label for="${this.name}-volume">Volume: </label>
//                         <input type="range" id="${this.name}-volume" min="0" max="100" value="${this.gain.gain.value * 100}" step="1">
//                         <span id="${this.name}-volumeValue">${this.gain.gain.value * 100}%</span>
//                     </div>

//                     <div class="synth-node-control-group">
//                         <label for="${this.name}-mute">Mute:</label>
//                         <input type="checkbox" id="${this.name}-mute" value="${this.isMuted}">
//                     </div>
//                 </div>
//             </div>
//         `;

//         parentDiv.appendChild(childDiv);

//         // Update displayed values
//         document.getElementById(`${this.name}-delayTime`).addEventListener('input', (event) => {
//             document.getElementById(`${this.name}-delayTimeValue`).textContent = event.currentTarget.value;
//             this.setDelayTime(event.currentTarget.value);
//         });

//         document.getElementById(`${this.name}-volume`).addEventListener('input', (event) => {
//             document.getElementById(`${this.name}-volumeValue`).textContent = event.currentTarget.value;
//             this.setGain(event.currentTarget.value / 100);
//         });

//         document.getElementById(`${this.name}-mute`).addEventListener('change', (event) => {
//             if(event.currentTarget.checked){
//                 this.mute();
//             } else {
//                 this.unmute();
//             }
//         });
//     }
// }

// class Filter extends GainNode {
//         constructor(name, audioContext){
//         super(name, audioContext);
//         this.filter = audioContext.createBiquadFilter();
//         this.filter.type = "lowpass";
//         this.filter.frequency.value = 440;
//         this.filter.Q.value = 1;
//         this.filter.connect(this.gain);
//     }

//     getInputs(){
//         return {
//             "input": this.filter,
//             "type": this.filter.type,
//             "cutoffFrequency": this.filter.frequency,
//             "Q": this.filter.Q,
//             "gain": this.gain.gain
//         }
//     }

//     setFilterType(value) {
//         this.filter.type = value;
//     }

//     setCutoffFrequency(value) {
//         this.filter.frequency.setValueAtTime(value, this.audioContext.currentTime);
//     }

//     setQ(value) {
//         this.filter.Q.setValueAtTime(value, this.audioContext.currentTime);
//     }

//     render(parentDiv) {
//         const childDiv = document.createElement("div");
//         childDiv.innerHTML = `
//             <div class="synth-node">
//                 <div>
//                     <label class="header">
//                         ${this.name}
//                     </label>
//                     <div class="synth-node-control-group">
//                         <label for="${this.name}-filterType">Filter type: </label>
//                         <select id="${this.name}-filterType">
//                             <option value="lowpass" ${this.filter.type==='lowpass' ? "selected": ""}>Lowpass</option>
//                             <option value="highpass" ${this.filter.type==='highpass' ? "selected": ""}>Highpass</option>
//                             <span id="${this.name}-filterTypeValue">${this.filter.type}</span>
//                         </select>
//                     </div>

//                     <div class="synth-node-control-group">
//                         <label for="${this.name}-cutoffFrequency">Cutoff Frequency: </label>
//                         <input type="range" id="${this.name}-cutoffFrequency" min="0" max="5000" value="${this.filter.frequency.value}" step="1">
//                         <span id="${this.name}-cutoffFrequencyValue">${this.filter.frequency.value}</span>Hz
//                     </div>
                    
//                     <div class="synth-node-control-group">
//                         <label for="${this.name}-Q">Quality Factor: </label>
//                         <input type="range" id="${this.name}-Q" min="1" max="10" value="${this.filter.Q.value}" step="1">
//                         <span id="${this.name}-QValue">${this.filter.Q.value}</span>
//                     </div>
                    
//                     <div class="synth-node-control-group">
//                         <label for="${this.name}-volume">Volume: <span id="${this.name}-volumeValue">${this.gain.gain.value * 100}</span>%</label>
//                         <input type="range" id="${this.name}-volume" min="0" max="100" value="${this.gain.gain.value * 100}" step="1">
//                     </div>

//                     <div class="synth-node-control-group">
//                         <label for="${this.name}-mute">Mute:</label>
//                         <input type="checkbox" id="${this.name}-mute" value="${this.isMuted}">
//                     </div>
//                 </div>
//             </div>
//         `;

//         parentDiv.appendChild(childDiv);

//         // Update displayed values
//         document.getElementById(`${this.name}-filterType`).addEventListener('change', (event) => {
//             this.setFilterType(event.currentTarget.value);
//         });

//         document.getElementById(`${this.name}-cutoffFrequency`).addEventListener('input', (event) => {
//             document.getElementById(`${this.name}-cutoffFrequencyValue`).textContent = event.currentTarget.value;
//             this.setCutoffFrequency(event.currentTarget.value);
//         });

//         document.getElementById(`${this.name}-Q`).addEventListener('input', (event) => {
//             document.getElementById(`${this.name}-QValue`).textContent = event.currentTarget.value;
//             this.setQ(event.currentTarget.value);
//         });

//         document.getElementById(`${this.name}-volume`).addEventListener('input', (event) => {
//             document.getElementById(`${this.name}-volumeValue`).textContent = event.currentTarget.value;
//             this.setGain(event.currentTarget.value/100);
//         });

//         document.getElementById(`${this.name}-mute`).addEventListener('change', (event) => {
//             if(event.currentTarget.checked){
//                 this.mute();
//             } else {
//                 this.unmute();
//             }
//         });
//     }
// }

// class Sequencer extends BaseNode{
//     constructor(name, audioContext) {
//         super();
//         this.name = name;
//         this.context = audioContext;
//         this.currentStep = 0;
//         this.intervalId = null;

//         this.SCHEDULER_INTERVAL = 25; // How often (ms) the scheduler looks ahead
//         this.LOOKAHEAD_TIME = 0.1;    // How far (s) to schedule notes into the future
//         this.nextNoteTime = 0.0;      // The precise context.currentTime when the next note should play
//         this.noteLength = 0.0;        // The length of a single note in seconds

//         this.outputNode = audioContext.createConstantSource();
//         this.outputNode.offset.value = 0; // Initialize to zero frequency
//         this.outputNode.start(0);
//     }

//     getMelody() {
//         return [];
//     }

//     scheduler() {
//         // While the next note is within the lookahead buffer...
//         while (this.nextNoteTime < this.context.currentTime + this.LOOKAHEAD_TIME) {

//             // Schedule the note change precisely at nextNoteTime
//             this._scheduleNoteChange(this.nextNoteTime);

//             // Advance the nextNoteTime for the following note
//             this.nextNoteTime += this.noteLength;

//             // Advance the melody step index
//             this.currentStep = (this.currentStep + 1) % this.getMelody().length;
//         }
//     }

//     _scheduleNoteChange(time) {
//         const cents = this.getMelody()[this.currentStep];
//         this.outputNode.offset.setValueAtTime(cents, time);
//     }

//     start(bpm, noteDuration = 4) {
//         if (this.intervalId) this.stop();

//         // Calculate note length in seconds
//         const beatDuration = 60 / bpm;
//         this.noteLength = beatDuration * (4 / noteDuration);

//         // Initialize the next note time to the current context time
//         this.nextNoteTime = this.context.currentTime;

//         // Start the lookahead scheduler (running every 25ms)
//         this.intervalId = setInterval(() => {
//             this.scheduler();
//         }, this.SCHEDULER_INTERVAL);

//         // Run scheduler once immediately to schedule the very first note
//         this.scheduler();
//     }

//     stop() {
//         if (this.intervalId) {
//             clearInterval(this.intervalId);
//             this.intervalId = null;
//             this.currentStep = 0;
//             // Reset detune back to 0 when stopping
//             this.outputNode.offset.setValueAtTime(0, this.context.currentTime);
//             console.log("Melody stopped.");
//         }
//     }
// }


// class Melody extends Sequencer{

//     getMelody() {
//         return [
//             0,    // A3
//             1200, // A4 (+1 octave)
//             1000, // G4 (+10 semitones)
//             700,  // E4 (+7 semitones)
//             1000, // G4
//             700,  // E4
//             500,  // D4 (+5 semitones)
//             300   // C4 (+3 semitones)
//         ];
//     }
// }

// class Bass extends Sequencer{
//     getMelody() {
//         return [
//             0,    // A
//             200,  // B
//             300,  // C
//             500,  // D
//         ];
//     }
// }

// class MusicSequence extends BaseNode {
    
//     constructor(name, audioContext) {
//         super();
//         this.name = name;

//         this.melody = new Melody(`${name}/melody`, audioContext);
//         this.bass = new Bass(`${name}/bass`, audioContext);

//         this.start(90);
//     }

//     getOutputs() {
//         return {
//             "melody": {
//                 "node": this.melody.outputNode,
//                 "index": 0,
//             },
//             "bass": {
//                 "node": this.bass.outputNode,
//                 "index": 0,
//             },
//         }
//     }

//     getInputs() {
//         return {}
//     }

//     start(bpm) {
//             this.melody.start(bpm, 16);
//             this.bass.start(bpm, 2);
//     }

//     stop(bpm) {
//             this.melody.stop();
//             this.bass.stop();
//     }

//     render() {}
// }