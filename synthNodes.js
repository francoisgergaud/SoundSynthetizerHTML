class GainNode {
    constructor(name, audioContext) {
        this.name = name
        this.audioContext = audioContext;

        this.gain = audioContext.createGain();
        this.gain.gain.value = 1;

        this.muter = audioContext.createGain();
        this.muter.gain.value = 1;
        this.isMuted = false;

        this.gain.connect(this.muter);
    }

    setGain(value) {
        this.gain.gain.setValueAtTime(value, this.audioContext.currentTime);
    }

    unmute() {
        this.muter.gain.value= 1;
        this.isMuted = false;
    }

    mute() {
        this.muter.gain.value= 0;
        this.isMuted = true;
    }

    getOutputs(){
        return {
            "output": {
                "node": this.muter,
                "index": 0
            }
        }
    }
}

class BaseOscillator extends GainNode {
    static DEFAULT_FREQUENCY = 440;
    static DEFAULT_GAIN = 1;

    constructor(name, audioContext) {
        super(name, audioContext);
        this.oscillator = audioContext.createOscillator();
        this.oscillator.frequency.value = this.constructor.DEFAULT_FREQUENCY;
        this.oscillator.connect(this.gain);
        this.oscillator.start();
    }

    setFrequency(value) {
        this.oscillator.frequency.setValueAtTime(value, this.audioContext.currentTime)
    }

    getInputs(){
        return {
            "frequency": this.oscillator.frequency,
            "gain": this.gain.gain,
        }
    }

    setType(value) {
        this.oscillator.type=value;
    }
}

class LFO extends BaseOscillator{
    
    static DEFAULT_FREQUENCY = 1; 
    static DEFAULT_GAIN = 0;

    render(parentDiv){

        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="synth-node">
                <label class="header">
                    ${this.name}
                </label>
                <div class="synth-node-control-group">
                    <label for="${this.name}-frequency">Frequency (Hz): </label>
                    <input type="range" id="${this.name}-frequency" min="0" max="20" value="${this.oscillator.frequency.value}" step="0.1">
                    <span id="${this.name}-freqValue">${this.oscillator.frequency.value}</span>
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-waveform">Waveform Type:</label>
                    <select id="${this.name}-waveform">
                        <option value="sine" ${this.oscillator.type==='sine' ? "selected": ""}>Sine</option>
                        <option value="square" ${this.oscillator.type==='square' ? "selected": ""}>Square</option>
                        <option value="sawtooth" ${this.oscillator.type==='sawtooth' ? "selected": ""}>Sawtooth</option>
                        <option value="triangle" ${this.oscillator.type==='triangle' ? "selected": ""}>Triangle</option>
                    </select>
                </div>

                <div class="control-group">
                <div class="synth-node-control-group">
                    <label for="${this.name}-gain">Gain: </label>
                    <input type="text" id="${this.name}-gain" value="${this.gain.gain.value}">
                    <span id="${this.name}-gainValue">${this.gain.gain.value}</span>%
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-mute">Mute:</label>
                    <input type="checkbox" id="${this.name}-mute" value="${this.isMuted}">
                </div>
            </div>
        `;
        parentDiv.appendChild(childDiv);
        // Update displayed values
        document.getElementById(`${this.name}-frequency`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-freqValue`).textContent = event.currentTarget.value;
            this.setFrequency(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-gain`).addEventListener('input', (event) => {
            this.setGain(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-waveform`).addEventListener('change', (event) => {
            this.setType(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-mute`).addEventListener('change', (event) => {
            if(event.currentTarget.checked){
                this.mute();
            } else {
                this.unmute();
            }
        });
    }
}

class VCO extends BaseOscillator{

    constructor(name, audioContext) {
        super(name, audioContext);
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

    render(parentDiv){

        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="synth-node">
                <label class="header">
                    ${this.name}
                </label>
                <div class="synth-node-control-group">
                    <label for="${this.name}-frequency">Frequency (Hz): </label>
                    <input type="range" id="${this.name}-frequency" min="20" max="5000" value="${this.oscillator.frequency.value}" step="1">
                    <span id="${this.name}-freqValue">${this.oscillator.frequency.value}</span>
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-waveform">Waveform Type:</label>
                    <select id="${this.name}-waveform">
                        <option value="sine" ${this.oscillator.type==='sine' ? "selected": ""}>Sine</option>
                        <option value="square" ${this.oscillator.type==='square' ? "selected": ""}>Square</option>
                        <option value="sawtooth" ${this.oscillator.type==='sawtooth' ? "selected": ""}>Sawtooth</option>
                        <option value="triangle" ${this.oscillator.type==='triangle' ? "selected": ""}>Triangle</option>
                    </select>
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-volume">Volume: </label>
                    <input type="range" id="${this.name}-volume" min="0" max="100" value="${this.gain.gain.value * 100}" step="1">
                    <span id="${this.name}-volumeValue">${this.gain.gain.value * 100}%</span>
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-mute">Mute:</label>
                    <input type="checkbox" id="${this.name}-mute" value="${this.isMuted}">
                </div>
            </div>
        `;
        parentDiv.appendChild(childDiv);
        // Update displayed values
        document.getElementById(`${this.name}-frequency`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-freqValue`).textContent = event.currentTarget.value;
            this.setFrequency(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-volume`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-volumeValue`).textContent = event.currentTarget.value;
            this.setGain(event.currentTarget.value/100);
        });

        document.getElementById(`${this.name}-waveform`).addEventListener('change', (event) => {
            this.setType(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-mute`).addEventListener('change', (event) => {
            if(event.currentTarget.checked){
                this.mute();
            } else {
                this.unmute();
            }
        });
    }
}

class Delay extends GainNode {
    constructor(name, audioContext){
        super(name, audioContext);
        this.delay = audioContext.createDelay();
        this.delay.delayTime.value = 0.25;
        this.delay.connect(this.gain);
    }

    getInputs(){
        return {
            "input": this.delay,
            "delayTime": this.delay.delayTime,
            "gain": this.gain.gain
        }
    }

    setDelayTime(seconds) {
        this.delay.delayTime.setValueAtTime(seconds, this.audioContext.currentTime);
    }

    render(parentDiv) {
        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="synth-node">
                <label class="header">
                    ${this.name}
                </label>
                <div class="synth-node-control-group">
                    <label for="${this.name}-delayTime">Delay (s): </label>
                    <input type="range" id="${this.name}-delayTime" min="0" max="1" value="${this.delay.delayTime.value}" step="0.05">
                    <span id="${this.name}-delayTimeValue">${this.delay.delayTime.value}</span>
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-volume">Volume: </label>
                    <input type="range" id="${this.name}-volume" min="0" max="100" value="${this.gain.gain.value * 100}" step="1">
                    <span id="${this.name}-volumeValue">${this.gain.gain.value * 100}%</span>
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-mute">Mute:</label>
                    <input type="checkbox" id="${this.name}-mute" value="${this.isMuted}">
                </div>
            </div>
        `;

        parentDiv.appendChild(childDiv);

        // Update displayed values
        document.getElementById(`${this.name}-delayTime`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-delayTimeValue`).textContent = event.currentTarget.value;
            this.setDelayTime(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-volume`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-volumeValue`).textContent = event.currentTarget.value;
            this.setGain(event.currentTarget.value / 100);
        });

        document.getElementById(`${this.name}-mute`).addEventListener('change', (event) => {
            if(event.currentTarget.checked){
                this.mute();
            } else {
                this.unmute();
            }
        });
    }
}

class Filter extends GainNode {
        constructor(name, audioContext){
        super(name, audioContext);
        this.filter = audioContext.createBiquadFilter();
        this.filter.type = "lowpass";
        this.filter.frequency.value = 440;
        this.filter.Q.value = 1;
        this.filter.connect(this.gain);
    }

    getInputs(){
        return {
            "input": this.filter,
            "type": this.filter.type,
            "cutoffFrequency": this.filter.frequency,
            "Q": this.filter.Q,
            "gain": this.gain.gain
        }
    }

    setFilterType(value) {
        this.filter.type = value;
    }

    setCutoffFrequency(value) {
        this.filter.frequency.setValueAtTime(value, this.audioContext.currentTime);
    }

    setQ(value) {
        this.filter.Q.setValueAtTime(value, this.audioContext.currentTime);
    }

    render(parentDiv) {
        const childDiv = document.createElement("div");
        childDiv.innerHTML = `
            <div class="synth-node">
                <label class="header">
                    ${this.name}
                </label>
                <div class="synth-node-control-group">
                    <label for="${this.name}-filterType">Filter type: </label>
                    <select id="${this.name}-filterType">
                        <option value="lowpass" ${this.filter.type==='lowpass' ? "selected": ""}>Lowpass</option>
                        <option value="highpass" ${this.filter.type==='highpass' ? "selected": ""}>Highpass</option>
                        <span id="${this.name}-filterTypeValue">${this.filter.type}</span>
                    </select>
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-cutoffFrequency">Cutoff Frequency (Hz): </label>
                    <input type="range" id="${this.name}-cutoffFrequency" min="0" max="5000" value="${this.filter.frequency.value}" step="1">
                    <span id="${this.name}-cutoffFrequencyValue">${this.filter.frequency.value}</span>
                </div>
                
                <div class="synth-node-control-group">
                    <label for="${this.name}-Q">Quality Factor: </label>
                    <input type="range" id="${this.name}-Q" min="1" max="10" value="${this.filter.Q.value}" step="1">
                    <span id="${this.name}-QValue">${this.filter.Q.value}</span>
                </div>
                
                <div class="control-group">
                    <label for="${this.name}-volume">Volume: <span id="${this.name}-volumeValue">${this.gain.gain.value * 100}</span>%</label>
                    <input type="range" id="${this.name}-volume" min="0" max="100" value="${this.gain.gain.value * 100}" step="1">
                </div>

                <div class="synth-node-control-group">
                    <label for="${this.name}-mute">Mute:</label>
                    <input type="checkbox" id="${this.name}-mute" value="${this.isMuted}">
                </div>
            </div>
        `;

        parentDiv.appendChild(childDiv);

        // Update displayed values
        document.getElementById(`${this.name}-filterType`).addEventListener('change', (event) => {
            this.setFilterType(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-cutoffFrequency`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-cutoffFrequencyValue`).textContent = event.currentTarget.value;
            this.setCutoffFrequency(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-Q`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-QValue`).textContent = event.currentTarget.value;
            this.setQ(event.currentTarget.value);
        });

        document.getElementById(`${this.name}-volume`).addEventListener('input', (event) => {
            document.getElementById(`${this.name}-volumeValue`).textContent = event.currentTarget.value;
            this.setGain(event.currentTarget.value/100);
        });

        document.getElementById(`${this.name}-mute`).addEventListener('change', (event) => {
            if(event.currentTarget.checked){
                this.mute();
            } else {
                this.unmute();
            }
        });
    }
}

class Sequencer {
    constructor(name, audioContext) {
        this.name = name;
        this.context = audioContext;
        this.currentStep = 0;

        this.SCHEDULER_INTERVAL = 25; // How often (ms) the scheduler looks ahead
        this.LOOKAHEAD_TIME = 0.1;    // How far (s) to schedule notes into the future
        this.nextNoteTime = 0.0;      // The precise context.currentTime when the next note should play
        this.noteLength = 0.0;        // The length of a single note in seconds

        this.outputNode = audioContext.createConstantSource();
        this.outputNode.offset.value = 0; // Initialize to zero frequency
        this.outputNode.start(0);
    }

    getMelody() {
        return [];
    }

    scheduler() {
        // While the next note is within the lookahead buffer...
        while (this.nextNoteTime < this.context.currentTime + this.LOOKAHEAD_TIME) {

            // Schedule the note change precisely at nextNoteTime
            this._scheduleNoteChange(this.nextNoteTime);

            // Advance the nextNoteTime for the following note
            this.nextNoteTime += this.noteLength;

            // Advance the melody step index
            this.currentStep = (this.currentStep + 1) % this.getMelody().length;
        }
    }

    _scheduleNoteChange(time) {
        const cents = this.getMelody()[this.currentStep];
        this.outputNode.offset.setValueAtTime(cents, time);
    }

    start(bpm, noteDuration = 4) {
        // Calculate note length in seconds
        const beatDuration = 60 / bpm;
        this.noteLength = beatDuration * (4 / noteDuration);

        // Initialize the next note time to the current context time
        this.nextNoteTime = this.context.currentTime;

        // Start the lookahead scheduler (running every 25ms)
        setInterval(() => {
            this.scheduler();
        }, this.SCHEDULER_INTERVAL);

        // Run scheduler once immediately to schedule the very first note
        this.scheduler();
    }
}


class Melody extends Sequencer{

    getMelody() {
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

class Bass extends Sequencer{
    getMelody() {
        return [
            0,    // A
            200,  // B
            300,  // C
            500,  // D
        ];
    }
}

class MusicSequence {
        constructor(name, audioContext) {
        this.name = name;

        this.melody = new Melody(`${name}/melody`, audioContext);
        this.bass = new Bass(`${name}/bass`, audioContext);

        this.melody.start(90, 16);
        this.bass.start(90, 2);
    }

    getOutputs() {
        return {
            "bass": {
                "node": this.bass.outputNode,
                "index": 0,
            },
            "melody": {
                "node": this.melody.outputNode,
                "index": 0,
            }
        }
    }

    getInputs() {
        return {}
    }

    render(parentDiv) {}
}