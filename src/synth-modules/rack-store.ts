import { reactive } from 'vue'
import { SynthBaseNode } from './synthNodes'
import type { Track } from '@/sequencer/sequencer'

interface RackModule {
    node: SynthBaseNode
    type: string
}

interface RackStore {
    racks: RackModule[][][]
}


export const rackStore: RackStore = reactive({
    racks: [] as RackModule[][][],
})

export const addSynthModuleOnRack = function(trackNumber: number, node: SynthBaseNode, nodeType: string, rackIndex: number) {
    if (rackStore.racks.length > trackNumber) {
        if (rackStore.racks[trackNumber]!.length > rackIndex && Array.isArray(rackStore.racks[trackNumber]![rackIndex])) {
            rackStore.racks[trackNumber]![rackIndex].push(
                {
                    node: node,
                    type: nodeType
                }
            )
        }
    }
}

export const addTrack = function() {
    rackStore.racks.push([[]])
}

export const addRack = function(trackNumber: number) {
    if (rackStore.racks.length > trackNumber) {
        rackStore.racks[trackNumber]!.push([])
    }
}

export const moveSynthModuleOnRack = function(trackNumber: number, originRackIndex: number, originPositionInRack: number, destinationRackIndex: number, destinationPositionInRack: number){
    console.debug("dropRackNode", destinationRackIndex, destinationPositionInRack)
    const elementToMove = rackStore.racks[trackNumber]![originRackIndex]![originPositionInRack]!
    rackStore.racks[trackNumber]![originRackIndex]!.splice(originPositionInRack, 1)
    if (destinationPositionInRack === -1) {
        rackStore.racks[trackNumber]![destinationRackIndex]!.push(elementToMove)
    } else {
        rackStore.racks[trackNumber]![destinationRackIndex]!.splice(destinationPositionInRack, 0, elementToMove)
    }
}

export const exportRackStore = function(): string[][][] {
    const result: string[][][] = []
    for(const trackRacks of rackStore.racks) {
        const trackRacksExport: string[][] = []
        for(const rack of trackRacks) {
            const racksExport: string[] = []
            for(const synthElement of rack) {
                const node = synthElement.node
                racksExport.push(node.name)
            }
            trackRacksExport.push(racksExport)
        }
        result.push(trackRacksExport)
    }
    return result
}


export const importRackStore = function(tracksRacksData: string[][][], sequencerTracks: Track[]): void {
    rackStore.racks = []
    for(let trackIndex =0; trackIndex < tracksRacksData.length; trackIndex++) {
        const trackSynthModules = sequencerTracks[trackIndex]?.getGraph().nodes
        const trackRacksData = tracksRacksData[trackIndex]!
        const trackRacks: RackModule[][] = []
        for(const rackData of trackRacksData) {
            const rack: RackModule[] = []
            for(const synthName of rackData) {
                const synthNode = trackSynthModules![synthName]
                if (synthNode) {
                    rack.push(synthNode)
                }
            }
            trackRacks.push(rack)
        }
        rackStore.racks.push(trackRacks)
    }
}