import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notfound',
  template: `<div class="container">
                <div class="row">
                    <h2>An error occurred when loading this page</h2>
                </div>
                <div class="row">
                    <a routerLink="/courses">Click here to return home</a>
                </div>
              </div>`
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
