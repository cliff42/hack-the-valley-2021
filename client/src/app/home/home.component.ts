import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

export interface MarkerData {
  title: string;
  categories: string[];
  points: Point[];
}

export interface Point {
  lat: number;
  lng: number;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  mapOptions: google.maps.MapOptions = {
    center: { lat: 38.9987208, lng: -77.2538699 },
    zoom: 14,
    streetViewControl: false,
  };
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [{lat: 30, lng: 20}];
  markerPoints: MarkerData[] = [];

  constructor(private http:HttpClient) { }

  ngOnInit(): void {
    this.getManuscripts();
  }

  getManuscripts(): void {
    let res = this.http.get<any>('http://localhost:8000/api/manuscripts');
    res.subscribe((data) => {
      data.forEach((e: any) => {
        let data: MarkerData = {
          title: e.title,
          categories: e.categories.map((x: any) => x.title),
          points: []
        };
        this.markerPoints.push(data);
      });
    });
  }

}
