import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import {MapInfoWindow, MapMarker} from '@angular/google-maps';

export interface MarkerData {
  title: string;
  category: any;
  points: google.maps.LatLngLiteral[];
}

export let disasterCategoryToIconUrl: any = {
  "wildfires" : "../../assets/wildfire.png",
  "severeStorms" : "../../assets/severeStorms.png",
  "volcanoes" : "../../assets/volcanoes.png",
  "drought": "../../assets/drought.png",
  "dustHaze": "../../assets/dustHaze.png",
  "earthquakes": "../../assets/earthquakes.png",
  "floods": "../../assets/floods.png",
  "landslides": "../../assets/landslides.png",
  "manmade": "../../assets/manmade.png",
  "seaLakeIce": "../../assets/seaLakeIce.png",
  "snow": "../../assets/snow.png",
  "temperatureExtremes": "../../assets/temperatureExtremes.png",
  "waterColor": "../../assets/waterColor.png"
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  positionToMarkerInfo: any = {};
  windowInfo: any = "";

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
          category: e.categories[0],
          points: ps
        };
        ps.forEach(point => {
          let pointName = point.lat.toString() + point.lng.toString();
          this.positionToMarkerInfo[pointName] = md;
        })
        this.markerPoints.push(md);
        points.push(...ps);
      });
        this.markerPositions$.next(points);
    });
  }

  openInfoWindow(marker: MapMarker, markerPosition: any) {
    console.log("Marker clicked, marker position: ", markerPosition);
    this.windowInfo = this.positionToMarkerInfo[markerPosition.lat.toString()+markerPosition.lng.toString()].title;
    this.infoWindow.open(marker);
  }

  getIconData(markerPosition: any): google.maps.Icon {
    let name = this.positionToMarkerInfo[markerPosition.lat.toString()+markerPosition.lng.toString()].category.id;
    let iconData: google.maps.Icon = {
      url: disasterCategoryToIconUrl[name],
      scaledSize: new google.maps.Size(50, 50)
    }
    return iconData;
  }
}
