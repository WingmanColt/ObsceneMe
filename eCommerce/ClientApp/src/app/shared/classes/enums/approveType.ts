
export enum ApproveType {
 None = 0,
 Waiting = 1,
 Rejected = 2,
 Success = 3
}

export enum Gender {
 Unisex = 1,
 Men = 2,
 Women = 3,
 Kids = 4,
}
export enum Stars {
 One = 1,
 Two = 2,
 Three = 3,
 Four = 4,
 Five = 5,
}

export enum Status {
 Available = 0,
 Sold = 1,
 Unavailable = 2,
 Archived = 3,
}

export enum AdStatus {
None = 0,
Sponsored = 1
}

export const Gender_LabelMapping: Record<Gender, string> = {
 [Gender.Unisex]: "Unisex",
 [Gender.Men]: "For mens",
 [Gender.Women]: "For womens",
 [Gender.Kids]: "For kids",
};
export const Stars_LabelMapping: Record<Stars, string> = {
 [Stars.One]: "1",
 [Stars.Two]: "2",
 [Stars.Three]: "3",
 [Stars.Four]: "4",
 [Stars.Five]: "5",
};

export const Status_LabelMapping: Record<Status, string> = {
 [Status.Available]: "Available",
 [Status.Sold]: "Sold",
 [Status.Unavailable]: "Unavailable",
 [Status.Archived]: "Archived",
};

export const AdStatus_LabelMapping: Record<AdStatus, string> = {
 [AdStatus.None]: "None",
 [AdStatus.Sponsored]: "Sponsored",
};