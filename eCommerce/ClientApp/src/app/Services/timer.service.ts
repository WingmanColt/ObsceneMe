import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, takeWhile, filter, catchError, startWith } from 'rxjs/operators';
import { Subscription } from 'rxjs/internal/Subscription';
import { SubscriptionTrackerService } from './Tracker/subscription-tracker.service';

@Injectable({
    providedIn: 'root',
})
export class TimerService implements OnDestroy {

    componentName: string = "TimerService";
    private isTimerRunning = false;
    private timerSubscription: Subscription | undefined;

    private timerValueSubject = new BehaviorSubject<number>(0);
    private timerObservable: Observable<number>;

    private remainingTimeInSeconds: number = 0;
    private resendCount: number = 0;

    constructor(private subTracker: SubscriptionTrackerService) {
        this.loadTimerState();
    }

    startTimer(seconds: number): void {
        if (this.isTimerRunning) {
            console.log('Timer is already running.');
            return;
        }

        this.isTimerRunning = true;
        this.remainingTimeInSeconds = seconds;
        this.initTimerObservable();

        this.executeTimerSubscription();
        this.saveTimerState();
    }

    stopTimer() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
        this.isTimerRunning = false;
        this.saveTimerState();
    }

    resetTimer(seconds: number) {
        this.remainingTimeInSeconds = seconds;
        this.saveTimerState();
    }

    executeTimerSubscription() {
        if (!this.timerObservable) {
            this.initTimerObservable();
        }

        this.timerSubscription = this.timerObservable.pipe(
            catchError(error => {
                console.error('Timer error:', error);
                return [];
            })
        ).subscribe(
            value => this.timerValueSubject.next(value),
            undefined,
            () => {
                this.isTimerRunning = false;
                this.timerValueSubject.complete();
                this.subTracker.releaseAllForComponent(this.componentName);
                this.saveTimerState();
            }
        );

        this.subTracker.track({
            subscription: this.timerSubscription,
            name: "subTimer",
            fileName: this.componentName,
        });
    }

    private initTimerObservable() {
        this.timerObservable = timer(0, 1000).pipe(
            map(() => --this.remainingTimeInSeconds),
            takeWhile(() => this.remainingTimeInSeconds >= 0),
            filter(() => this.remainingTimeInSeconds >= 0)
        );
    }

    getRemainingTime(): number {
        return this.remainingTimeInSeconds;
    }

    getIsTimeRunning(): boolean {
        return this.isTimerRunning;
    }

    getResendCount(): number {
        return this.resendCount;
    }

    setResendCount(num: number): void {
        this.resendCount = num;
    }

    ngOnDestroy() {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
        this.subTracker.releaseAllForComponent(this.componentName);
    }

    private saveTimerState() {
        localStorage.setItem('timerState', JSON.stringify({
            isTimerRunning: this.isTimerRunning,
            remainingTimeInSeconds: this.remainingTimeInSeconds
        }));
    }

    private loadTimerState() {
        const timerState = localStorage.getItem('timerState');
        if (timerState) {
            const { isTimerRunning, remainingTimeInSeconds } = JSON.parse(timerState);
            this.isTimerRunning = isTimerRunning;
            this.remainingTimeInSeconds = remainingTimeInSeconds;
            this.initTimerObservable();
        }
    }

    // Expose timerValue$ observable as a public property
    get timerValue$(): Observable<number> {
        return this.timerValueSubject.asObservable().pipe(
            startWith(this.remainingTimeInSeconds)
        );
    }

    triggerResendAction(time: number) {
        console.log('trigger' + time)
        this.resetTimer(time);
        this.timerValueSubject.next(time); // Emit the new value
        this.startTimer(time);
      }
}
