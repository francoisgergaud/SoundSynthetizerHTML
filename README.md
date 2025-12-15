# SoundSynthetizerHTML
This is an application which original idea originates from a hackaton. The goal is to be able to build our modular synthetizer using
a GUI.
This project is purely recreative, for my own curiosity.

If you are curious, you can play with the built version here: https://francoisgergaud.github.io/SoundSynthetizerHTML/

## Development
This application is a client application (no server, no network access except the application resources itself), running in the Browser using HTML5 Audio-nodes. It is developed in VueJS and Typescript.

To start a local server for development:
`npm run dev`

## Next steps
* create FM algorithms based on  oscillator-nodes for FM synthesis. Each oscillator can have an enveloper defined.
* controlling the carrier fequency using computer's keyboard (no polyphony at first)
* add some effect: delay, reverb, distortion, filters etc...