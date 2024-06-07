const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require("https");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const DataModel = require("./models/weatherdata.js");

mongoose
  .connect("mongodb+srv://ramesh:ram@cluster0.lohftsv.mongodb.net/weatherdata?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });
////////////////////////////////////////////////////////////////////////////////////////////////
  app.post("/city", (req, res) => {
    const { name } = req.body;
    const apikey = "7200b632960203848354ccd855faae71";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${apikey}&units=metric`;
  
    DataModel.findOne({ place: name })
      .then((existingPlace) => {
        if (existingPlace) {
          console.log("true");
          res.json( "Place already exists" );
        } 
        else {
          https.get(url, (response) => {
            let data = '';
            
            response.on("data", (chunk) => {
              data += chunk;
            });
  
            response.on("end", () => {
              const weatherdata = JSON.parse(data);
              const place = weatherdata.name;
              const temp = weatherdata.main.temp;
              const wind = weatherdata.wind.speed;
              const feelslike = weatherdata.main.feels_like;
              const description = weatherdata.weather[0].description;
  
              DataModel.create({
                place: place,
                temp: temp,
                feelslike: feelslike,
                description: description,
                wind: wind,
              })
                .then((data) => res.json(data))
                .catch((err) => res.status(400).json(err));
            });
          }).on("error", (err) => {
            res.status(500).json(err);
          });
        }
      })
      .catch((err) => res.status(500).json(err));
  });
//////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/getData", (req, res) => {
  DataModel.find()
    .then((data) => res.json(data))
    .catch((err) => res.json(err));
});
/////////////////////////////////////////////////////////////////////////////////////////////////
app.put("/updateuser/:id", async (req, res) => {
   const id = req.params.id;
   try {
     const data = await DataModel.findById(id);
     if (!data) {
       console.log("not found");
       return res.json('Data not found');
     }
 
     const name = data.place;
     console.log(name);
     const apikey = "7200b632960203848354ccd855faae71";
     const url = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${apikey}&units=metric`;
 
     https.get(url, async (response) => {
       let weatherData = '';
 
       response.on("data", (chunk) => {
         weatherData += chunk;
       });
 
       response.on("end", async () => {
         try {
           const parsedData = JSON.parse(weatherData);
           const place = parsedData.name;
           const temp = parsedData.main.temp;
           const wind = parsedData.wind.speed;
           const feelslike = parsedData.main.feels_like;
           const description = parsedData.weather[0].description;
 
           const updatedData = await DataModel.findByIdAndUpdate(
             id,
             {
               place: place,
               temp: temp,
               feelslike: feelslike,
               description: description,
               wind: wind,
             },
             { new: true }
           );
 
           res.json(updatedData);
         } catch (err) {
           console.error("Error parsing weather data:", err);
           res.status(500).json({ error: "Internal server error" });
         }
       });
     });
   } catch (error) {
     console.error("Error finding data:", error);
     res.status(500).json({ error: "Internal server error" });
   }
 });
/////////////////////////////////////////////////////////////////////////////////////////////////
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
