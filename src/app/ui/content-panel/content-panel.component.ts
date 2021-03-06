import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'content-panel',
  templateUrl: './content-panel.component.html',
  styleUrls: ['./content-panel.component.scss']
})
export class ContentPanelComponent implements OnInit {

  @Input() title: string;
  @Input() icon: string;
  @Input() expand: boolean;

  constructor() { }

  ngOnInit(): void { }

  collapse() { this.expand = !this.expand; }
}