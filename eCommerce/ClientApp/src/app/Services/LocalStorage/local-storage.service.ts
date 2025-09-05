import { Injectable } from "@angular/core";
import AsyncLocalStorage from "@createnextapp/async-local-storage";

@Injectable({
 providedIn: "root",
})
export class LocalStorageService {
 constructor() {}

 async getStateItem<T>(key: string, defaultValue: T): Promise<T> {
  let value: T;
  try {
   value = await this.get(key);
   if (value === null) {
    value = defaultValue;
   }
  } catch (error) {
   console.error(`Error getting item ${key} from async local storage: `, error);
   value = defaultValue;
  }
  return value;
 }
 // async get<T>(key: string): Promise<T | null> {

 /*return AsyncLocalStorage.getItem(key); 
  .then((data) => {
   if (data) return JSON.parse(data);
   return null;
  });*/
 //}
 get = async (key: string): Promise<any> => {
  let data;
  try {
   if (!localStorage[key] || localStorage[key].trim() === "") {
    return null;
   }
   data = JSON.parse(localStorage[key]);
   return data;
  } catch (e) {
   console.error(`Error getting item ${key} from async local storage: `, e);
   return null;
  }
 };
 async set<T>(key: string, value: T): Promise<void> {
  try {
   let dataToStore = typeof value === "string" ? value : JSON.stringify(value);
   await AsyncLocalStorage.setItem(key, dataToStore);
  } catch (e) {
   console.error(`Error setting item ${key} to async local storage: `, e);
  }
 }

 async remove(key: string): Promise<void> {
  await AsyncLocalStorage.removeItem(key);
 }

 async clear(): Promise<void> {
  await AsyncLocalStorage.clear();
 }
}
