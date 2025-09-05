/*import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { WebApiUrls } from 'src/app/configs/webApiUrls';

@Injectable({
    providedIn: 'root',
})
export class ErrorLoggingService {
    private logAttempts: number = 0; // Track the number of logging attempts

    constructor(private http: HttpClient, private config: WebApiUrls) { }

    async logError(message: string): Promise<void> {
        const logEntry = {
            timestamp: new Date().toISOString(),
            message
        };

        // Limit the number of attempts to log an error
        if (this.logAttempts > 5) {
            return; // Stop further logging attempts after 5 failures
        }

        try {
            await lastValueFrom(this.http.post<void>(this.config.setting['SendErrorMessage'], logEntry));
            this.logAttempts = 0; // Reset log attempt counter on success
        } catch (httpError) {
            this.logAttempts++;
            // Suppress console log if it has been logged before, or simply log once
            if (this.logAttempts === 1) {
                console.warn('Error logging to server:', httpError);
            }
        }
    }
}
*/