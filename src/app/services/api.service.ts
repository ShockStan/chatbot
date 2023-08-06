import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getReply(api_key: string, api_url: string, prompt: any): Observable<any> {
    const options = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        'x-goog-api-key': `${api_key}`
      })
    }
    return this.http.post(api_url, JSON.stringify(prompt), options);
  }
}
