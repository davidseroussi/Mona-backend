const R = require('ramda');
const Museum = require('./models/museum');
const Artwork = require('./models/artwork');
const Exhibition = require('./models/exhibition');
const Request = require('./core/request');
const RequestHandler = require('./core/request-handler');
// const Database = require('./core/database');
const request = require('request');


const mongoose = require('mongoose');

const uri = 'mongodb+srv://david:rz3v3kB8pkwsvtFS@cluster0-n86p3.mongodb.net/test?retryWrites=true&w=majority'

const connect = () => {
    mongoose.connect(uri, {
        useNewUrlParser: true
        // UseUnifiedTopology: true,
    });
};

connect()

const fs = require('fs');
const data = JSON.parse(fs.readFileSync('/home/david/Documents/mona-scraping/expos/expos.json', 'utf8'));


function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const createMuseumAndExhibitions = async data => {

    let museum = await Museum.findOneAndUpdate(
        { title: data.museum },
        { $set: { 'title': data.museum, 'location.address': data.address } },
        { upsert: true, new: true }
    ).exec().catch(Request.dbError)

    if (Request.hasError(museum)) {
        console.log(museum);
        return museum;
    }

    const rateCategories = [
        'Baby',
        'Child',
        'Teen',
        'Student',
        'Adult',
    ];

    const categories = [
        'Sciences',
        'Cinéma',
        'Arts Visuels',
        'Sculpture',
        'Musique',
        'Littérature',
        'Arts de la scène',
        'Photographie'
    ];

    let rates = []

    for (let i = 0; i < rateCategories.length; i++) {
        if (Math.random() >= 0.7) {
            continue
        }

        rates.push({
            category: rateCategories[i],
            price: Math.floor(Math.random() * 15)
        });
    }

    const randomVotersCount = Math.floor(Math.random() * 200);
    const randomValue = Math.random() * Math.floor(5);

    const randomStartDate = randomDate(new Date(2020, 0, 1), new Date(2021, 0, 1))
    const randomEndDate = randomDate(randomStartDate, new Date(2021, 0, 1))

    const randomOpeningDays = Array.from({ length: 7 }, () => Math.floor(Math.random() * 2));

    const randomCategory = categories[Math.floor(Math.random() * categories.length - 1)]

    let exhibition = await Exhibition.findOneAndUpdate(
        { title: data.title },
        {
            $set: {
                'title': data.title,
                'imageUrl': data.imageUrl,
                'description': data.description,
                'categories': [randomCategory],
                'rating': {
                    value: randomValue,
                    votersCount: randomVotersCount
                },
                'rates': rates,
                'opening': {
                    isOpen: Math.random() >= 0.5,
                    startDate: randomStartDate,
                    endDate: randomEndDate,
                    openingDays: randomOpeningDays
                },
                'museum': museum._id
            }
        },
        { upsert: true, new: true }
    ).exec().catch(Request.dbError)

    museum = await Museum.findOneAndUpdate(
        {
            _id: museum._id,
            'exhibitions': { $ne: exhibition._id }
        },
        { $addToSet: { 'exhibitions': exhibition._id } },
        { upsert: true, new: true }
    ).exec().catch(Request.dbError)

    return museum;
}

const updateMuseumsLocation = async _ => {

    const museums = await Museum.find({}).exec().catch(Request.dbError);
    if (Request.hasError(museums)) {
        console.log(museums);
        return museums;
    }

    for (let i = 0; i < museums.length; i++) {
        let museum = museums[i];

        const title = encodeURIComponent(museum.title);
        const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + title + '&key=AIzaSyCa3F5_pKLRhSfv_Ohwpfh05y8gEfMPfcw'
        //const res = await request(url);
        request(url, function (error, response, body) {
            const res = JSON.parse(body)
            if(R.isNil(res.results) || res.results.length == 0){
                return;
            }
    
            const location = res.results[0].geometry.location
            museum.location.lat = location.lat;
            museum.location.lon = location.lng;

            console.log(location);

            museum.save();
        });



    }




}

// for (let i = 0; i < data.length; i++){
//     createMuseumAndExhibitions(data[i]);
// }



const testPlaces = async _ => {
    const title = encodeURIComponent('Musée d\'Orsay');
    const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + title + '&key=AIzaSyCa3F5_pKLRhSfv_Ohwpfh05y8gEfMPfcw'
    //const res = await request(url);
    request(url, function (error, response, body) {
        const res = JSON.parse(body)
        if(R.isNil(res.results) || res.results.length == 0){
            return;
        }

        const location = res.results[0].geometry.location
        console.log(location);
    });
}

updateMuseumsLocation();