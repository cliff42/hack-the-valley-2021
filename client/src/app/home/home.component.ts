import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import {MapInfoWindow, MapMarker} from '@angular/google-maps';

export const USER_LOCATION_ICON = "../../assets/userLocation.png"

export interface MarkerData {
  title: string;
  category: any;
  points: google.maps.LatLngLiteral[];
}

export enum disasterCategoryFilter {
  "all",
  "wildfires",
  "severeStorms",
  "volcanoes",
  "drought",
  "dustHaze",
  "earthquakes",
  "floods",
  "landslides",
  "manmade",
  "seaLakeIce",
  "snow",
  "temperatureExtremes",
  "waterColor"
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

currentFilter: disasterCategoryFilter = disasterCategoryFilter.all;

disasterCategoryFilterToName: any = {
  "all": "all",
  "wildfires": "Wildfires",
  "severeStorms": "Severe Stroms",
  "volcanoes": "Volcanoes",
  "drought": "Drought",
  "dustHaze": "Dust and Haze",
  "earthquakes": "Earthquakes",
  "floods": "Floods",
  "landslides": "Landslides",
  "manmade": "Man made",
  "seaLakeIce": "Sea and Lake Ice",
  "snow": "Snow",
  "temperatureExtremes": "Temperature Extremes",
  "waterColor": "Water Color"
}

 disasterCategories = [
  "wildfires",
  "severeStorms",
  "volcanoes",
  "drought",
  "dustHaze",
  "earthquakes",
  "floods",
  "landslides",
  "manmade",
  "seaLakeIce",
  "snow",
  "temperatureExtremes",
  "waterColor"
 ]

  positionToMarkerInfo: any = {};
  windowInfo: any = "";

  mapOptions: google.maps.MapOptions = {
    center: { lat: 0, lng: 0 },
    zoom: 8,
    streetViewControl: false,
  };
  mapCenter = {
    lat: 49.282,
    lng: -123.12
  }
  userPosition: any;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions$: BehaviorSubject<google.maps.LatLngLiteral[]> = new BehaviorSubject<google.maps.LatLngLiteral[]>([]);
  markerPoints: MarkerData[] = [];

  constructor(private http:HttpClient) { }

  ngOnInit(): void {
    this.getMarkerData();
    if(!navigator.geolocation) {
      console.log("location is not supported");
    }
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(`lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`);
      this.userPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      this.mapCenter = this.userPosition
    })
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

  getUserLocationIcon(): google.maps.Icon {
    let iconData: google.maps.Icon = {
      url: USER_LOCATION_ICON,
      scaledSize: new google.maps.Size(25, 25)
    }
    return iconData;
  }

  filterSelect(category: string) {
    console.log("Selected filter for: " + category as unknown as disasterCategoryFilter);
    if (category as unknown as disasterCategoryFilter === this.currentFilter) {
      this.currentFilter = disasterCategoryFilter.all;
    } else {
      this.currentFilter = category as unknown as disasterCategoryFilter;
    }
    this.updateMarkerPositions();
  }

  updateMarkerPositions() {
    console.log("update points");
    let points: google.maps.LatLngLiteral[] = [];
    this.markerPoints.forEach(md => {
      if (this.currentFilter === disasterCategoryFilter.all || this.currentFilter === md.category.id) {
        points.push(...md.points);
      }
    })
    this.markerPositions$.next(points);
    console.log("Updated points!");
  }

  getFilterNumber(category: string) {
    if (category === "all") {
      return this.markerPoints.length;
    }

    let cat = category as unknown as disasterCategoryFilter
    let num = 0;
    this.markerPoints.forEach(md => {
      if (cat === md.category.id)
      num++;
    })
    return num;
  }

  getIconImageFromCategory(category: string) {
    return disasterCategoryToIconUrl[category];
  }
}
