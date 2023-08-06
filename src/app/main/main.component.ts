import { Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environment/environment';
import { ApiService } from '../services/api.service';
import { faFeatherPointed, faCubesStacked, faPaperPlane } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy{

  key = environment.PALM_API_KEY;
  url = environment.PALM_REST_API;

  authorIcon = faFeatherPointed;
  AIicon = faCubesStacked;
  sendIcon = faPaperPlane;
  
  @HostListener('window:keydown', ['$event'])
  onEnter(pressedKey: KeyboardEvent){
    const enter = pressedKey.key;
    if(enter==='Enter' && this.prompt!=='' && this.prompt){
      this.askAI();
    }
  }

  @ViewChild('bottomLine') bottomLine!: ElementRef;

  reply: any;
  chat: any;
  prompt = '';

  scroll = false;

  typingComplete() {
    setTimeout(()=>{
      this.scroll = false;
    },1000);
  }

  replyFromAI: Subscription = new Subscription();

  constructor(private service: ApiService, private el: ElementRef, private renderer: Renderer2) {
    this.chat = new Array();
    this.chat.push({ type: 'response', result: 'Ask me anything!' })
  }

  ngOnDestroy(): void {
    this.replyFromAI.unsubscribe();
  }

  ngOnInit(): void {
    setInterval(() => {
      if (this.scroll) {
        this.bottomLine.nativeElement.scrollIntoView(true);
      }
    }, 100);
  }

  askAI() {
    this.scroll = true;
    this.chat.push({ type: 'request', result: this.prompt });
    const msgArray = [];
    if (this.reply) {
      for (let message of this.reply.messages) {
        msgArray.push(message);
      }
      msgArray.push(this.reply.candidates[0])
    }
    const prompt = {
      'prompt':
      {
        'messages':
          [...msgArray, { 'author': '0', 'content': `${this.prompt}` }]
      },
      "temperature": 0.8,
      "candidate_count": 1,
      "topP": 0.8,
      "topK": 10
    };
    this.prompt = '';
    this.replyFromAI = this.service.getReply(this.key, this.url, prompt).subscribe(
      data => {
        let value = data.candidates[0].content;
        let result = value.split('```');
        let answer = result[0];
        for(let i = 1; i < result.length; i++) {
          if(i%2==1){
            answer+='<b>'
          } else {
            answer+='</b>'
          }
          answer+=result[i]
        }
        this.reply = data;
        this.chat.push({ type: 'response', result: answer });
      }
    );
  }
}
