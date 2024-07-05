import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly _http = inject(HttpClient);

  loadingResponse: boolean = false;
  response = { content: '' };

  responses = signal<{ id: number }[]>([]);

  getData() {
    this.loadingResponse = true;
    this._http.get(environment.BACKEND_URL, { observe: 'events', responseType: 'text', reportProgress: true }).subscribe((event: HttpEvent<string>) => {
      if (event.type === HttpEventType.DownloadProgress) {
        const partial = (event as HttpDownloadProgressEvent).partialText!;
        this.response.content = partial;

        const responseObject = this.convertToObjectArray(partial!);
        this.responses.set(responseObject);
      } else if (event.type === HttpEventType.Response) {
        this.response.content = event.body!;
        this.loadingResponse = false;
      }
    });
  }

  private convertToObjectArray(responseContent: string) {
    if (responseContent.slice(-1) !== ']') {
      responseContent += ']';
    }

    return JSON.parse(responseContent);
  }
}
