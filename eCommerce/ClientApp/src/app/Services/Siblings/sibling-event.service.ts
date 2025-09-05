import { EventEmitter, Injectable, Output } from "@angular/core";

@Injectable({
 providedIn: "root",
})
export class SiblingEventService {
 @Output() public slideTo: EventEmitter<any> = new EventEmitter();

 constructor() {}
}
