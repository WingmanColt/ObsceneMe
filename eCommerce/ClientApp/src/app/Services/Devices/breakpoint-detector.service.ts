import { BreakpointObserver } from "@angular/cdk/layout";
import { Injectable } from "@angular/core";
import { BreakpointLabel } from "src/app/shared/classes/settings";

@Injectable({
 providedIn: "root",
})
export class BreakpointDetectorService {
 public currentBreakpoint: BreakpointLabel = BreakpointLabel.None;

 constructor(private breakpointObserver: BreakpointObserver) {
  this.breakpointObserver.observe(["(min-width: 1025px)", "(min-width: 768px) and (max-width: 1024px)", "(max-width: 600px)"]).subscribe(() => {
   this.breakpointChanged();
  });
 }

 private breakpointChanged() {
  if (this.breakpointObserver.isMatched("(min-width: 1024px)")) {
   this.currentBreakpoint = BreakpointLabel.Desktop;
  } else if (this.breakpointObserver.isMatched("(min-width: 600px) and (max-width: 1023px)")) {
   this.currentBreakpoint = BreakpointLabel.Tablet;
  } else if (this.breakpointObserver.isMatched("(max-width: 600px)")) {
   this.currentBreakpoint = BreakpointLabel.Mobile;
  }
 }
 public getDevice(): BreakpointLabel {
  return this.currentBreakpoint;
 }
 public isDevice(val: string): boolean {
  return this.currentBreakpoint == val;
 }
}
