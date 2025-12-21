export const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

export function fillKeysFrequencyTable(){
    let frequencyByKey:{[keyName:string]: number} = {}
    let currentKeyName = "A"
    let currentOctave = 4
    let currentFrequency = 440
    let currentKeyIndex = keys.indexOf(currentKeyName)
    frequencyByKey[currentKeyName + currentOctave.toString() ] = currentFrequency
    while( Object.keys(frequencyByKey).length < 12) {
      currentKeyIndex +=  7 //we multiply the frequency by 1.5 for 7 semi-tones
      currentFrequency *= 1.5
      if(currentKeyIndex >=  keys.length) {
        // we went out of the current octave, we go back to the current octave by dividing the frequency by 2
        currentKeyIndex -= keys.length
        currentFrequency /= 2
      }
      currentKeyName = keys[currentKeyIndex]!
      frequencyByKey[currentKeyName + currentOctave.toString() ] = currentFrequency
    }
    return frequencyByKey
  }