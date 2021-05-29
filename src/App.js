import React, {useState,useEffect} from 'react';
import { Card,CardContent,FormControl, MenuItem,Select } from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph.js';
import './App.css';
import 'leaflet/dist/leaflet.css';

import {sortData,prettyPrintStat} from './util';


function App() {

  // for drop-down menu
  const [countries, setCountries] = useState([]);

  // to show selected country on drop down menu box
  const [country, setCountry] = useState('worldwide');

  // for three info boxes
  const [countryInfo, setCountryInfo] = useState({});

  // for right table
  const [tableData,setTableData] = useState([]);

  // for map
  const [mapCenter,setMapCenter] = useState([34.80746,-40.4796]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

// 
  const [casesType,setCasesType] = useState("cases");
  
   


  useEffect(()=>{
    fetch('https://api.caw.sh/v3/covid-19/all')
    .then(response => response.json())
    .then((data)=>{
      setCountryInfo(data);
    })
  },[]);

  useEffect(()=>{
    const getCountriesData = async() =>{
      await fetch("https://api.caw.sh/v3/covid-19/countries")
        .then((response)=>response.json())
        .then((data)=>{
          const countries = data.map((country)=> ({
            name: country.country,
            value: country.countryInfo.iso2
          }))

          setCountries(countries);

          const sortedData = sortData(data);
          setTableData(sortedData);

          setMapCountries(data);
      })
    };

    getCountriesData();
  },[])


  const onCountryChange = async(event)=>{
    const countryCode = event.target.value;
    

    const url = countryCode === 'worldwide'?'https://api.caw.sh/v3/covid-19/all': `https://api.caw.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then((response)=> response.json())
    .then((data)=>{
          setCountryInfo(data);
          setCountry(countryCode);

          countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long])
          setMapZoom(4);
    })

    // https://api.caw.sh/v3/covid-19/all
    // https://api.caw.sh/v3/covid-19/countries/countryCode
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              
              <MenuItem value="worldwide">Worldwide</MenuItem>

              {countries.map((country,id)=>{
                return <MenuItem key={id} value={country.value}>{country.name}</MenuItem>
              })}
    
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
              <InfoBox 
                isRed
                active={casesType === "cases"}
                onClick={(e)=>setCasesType("cases")}
                title="Coronavirus Cases"   
                cases={prettyPrintStat(countryInfo.todayCases)} 
                total={prettyPrintStat(countryInfo.cases)}  

              />

              <InfoBox 
                active={casesType === "recovered"}
                onClick={(e)=>setCasesType("recovered")}
                title="Recovered" 
                cases={prettyPrintStat(countryInfo.todayRecovered)} 
                total={prettyPrintStat(countryInfo.recovered)}

              />

              <InfoBox 
                isRed
                active={casesType === "deaths"}
                onClick={(e)=>setCasesType("deaths")}
                title="Deaths" 
                cases={prettyPrintStat(countryInfo.todayDeaths)} 
                total={prettyPrintStat(countryInfo.deaths)} 
                  
              />
        </div>

        <Map countries={mapCountries} center={mapCenter} zoom={mapZoom} casesType={casesType} />
      </div>

      <Card className="app_right">
        <CardContent>
          {/* Table */}
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>

          <LineGraph className="app__graph" casesType={casesType} />

        </CardContent>
        
      </Card>
  </div>
      
  );
}

export default App;
