import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface MarkerData {
  title: string;
  categories: string[];
  points: google.maps.LatLngLiteral[];
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
  markerPositions$: BehaviorSubject<google.maps.LatLngLiteral[]> = new BehaviorSubject<google.maps.LatLngLiteral[]>([]);
  markerPoints: MarkerData[] = [];

  constructor(private http:HttpClient) { }

  ngOnInit(): void {
    this.getMarkerData();
  }

  getMarkerData(): void {
    let res = this.http.get<any>('http://localhost:3000/events');
    res.subscribe((data) => {
      let points: google.maps.LatLngLiteral[] = [];
      data.message.forEach((e: any) => {
        let ps: google.maps.LatLngLiteral[] = [];
        e.geometry.forEach((el:any) => {
          let point: google.maps.LatLngLiteral = {
            lat: el.coordinates[1],
            lng: el.coordinates[0]
          }
          ps.push(point);
        });

        let md: MarkerData = {
          title: e.title,
          categories: e.categories.map((x: any) => x.title),
          points: ps
        };
        this.markerPoints.push(md);
        points.push(...ps);
      });
        this.markerPositions$.next(points);
    });
  }
}
