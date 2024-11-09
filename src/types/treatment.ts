export enum Treatment {
    Normal = 'Normal',
    Foil = 'Foil',
    Etched = 'Etched',
    EtchedFoil = 'Etched Foil',
}

export const AllTreatments: string[] = Object.values(Treatment);