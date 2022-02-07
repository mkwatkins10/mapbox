import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import * as airportsdata from "./airports.json";

mapboxgl.accessToken='pk.eyJ1IjoiYWxpa2lsaWNoYXJpdGEiLCJhIjoiY2prcGpwajY4MnpqMDNxbXpmcnlrbWdneCJ9.0NaE-BID7eX38MDSY40-Qg';

// Sample data 


class Mapp extends React.Component{

	// Set up states for updating map 
	constructor(props){
		super(props);
		this.state = {
			lng: -74,
			lat: 40.7128,
			zoom: 12
		}
	}

	// Create map and lay over markers
	componentDidMount(){
		const map = new mapboxgl.Map({
			container: this.mapContainer,
			style: 'mapbox://styles/mapbox/streets-v11', 
			center: [this.state.lng, this.state.lat],
			zoom: this.state.zoom
		})

		map.on('load', () => {
			// Add a new source from our GeoJSON data and
			// set the 'cluster' option to true. GL-JS will
			// add the point_count property to your source data.
			map.addSource('airports', {
			type: 'geojson',
			// Point to GeoJSON data. This example visualizes all M1.0+ airports
			// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
			data: airportsdata,
			cluster: true,
			clusterMaxZoom: 14, // Max zoom to cluster points on
			clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
			});
			 
			map.addLayer({
			id: 'clusters',
			type: 'circle',
			source: 'airports',
			filter: ['has', 'point_count'],
			paint: {
			// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
			// with three steps to implement three types of circles:
			//   * Blue, 20px circles when point count is less than 100
			//   * Yellow, 30px circles when point count is between 100 and 750
			//   * Pink, 40px circles when point count is greater than or equal to 750
			'circle-color': [
			'step',
			['get', 'point_count'],
			'#51bbd6',
			100,
			'#f1f075',
			750,
			'#f28cb1'
			],
			'circle-radius': [
			'step',
			['get', 'point_count'],
			20,
			100,
			30,
			750,
			40
			]
			}
			});
			 
			map.addLayer({
			id: 'cluster-count',
			type: 'symbol',
			source: 'airports',
			filter: ['has', 'point_count'],
			layout: {
			'text-field': '{point_count_abbreviated}',
			'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
			'text-size': 12
			}
			});
			 
			map.addLayer({
			id: 'unclustered-point',
			type: 'circle',
			source: 'airports',
			filter: ['!', ['has', 'point_count']],
			paint: {
			'circle-color': '#11b4da',
			'circle-radius': 4,
			'circle-stroke-width': 1,
			'circle-stroke-color': '#fff'
			}
			});
			 
			// inspect a cluster on click
			map.on('click', 'clusters', (e) => {
			const features = map.queryRenderedFeatures(e.point, {
			layers: ['clusters']
			});
			const clusterId = features[0].properties.cluster_id;
			map.getSource('airports').getClusterExpansionZoom(
			clusterId,
			(err, zoom) => {
			if (err) return;
			 
			map.easeTo({
			center: features[0].geometry.coordinates,
			zoom: zoom
			});
			}
			);
			});
			 
			// When a click event occurs on a feature in
			// the unclustered-point layer, open a popup at
			// the location of the feature, with
			// description HTML from its properties.
			map.on('click', 'unclustered-point', (e) => {
			const coordinates = e.features[0].geometry.coordinates.slice();
			const name = e.features[0].properties.name;
			 
			new mapboxgl.Popup()
			.setLngLat(coordinates)
			.setHTML(
			`Airport Name: ${name}`
			)
			.addTo(map);
			});
			 
			map.on('mouseenter', 'clusters', () => {
			map.getCanvas().style.cursor = 'pointer';
			});
			map.on('mouseleave', 'clusters', () => {
			map.getCanvas().style.cursor = '';
			});
		});
	}

	render(){
		return(
			<div>
				<div ref={el => this.mapContainer = el} style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,width:'100%', height:'100vh'}}/>
			</div>
		)
	}
}

export default Mapp;