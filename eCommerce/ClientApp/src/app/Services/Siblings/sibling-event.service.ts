import { EventEmitter, Injectable, Output } from "@angular/core";

@Injectable({
 providedIn: "root",
})
export class SiblingEventService {
 public emitChange: EventEmitter<any> = new EventEmitter<any>();
 constructor() {}
}
